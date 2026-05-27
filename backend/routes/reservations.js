import express from 'express';
import db from '../db/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Get all reservations (Filtered by user, or all if Admin)
router.get('/', verifyToken, (req, res) => {
  try {
    let rows;
    if (req.user.role === 'Admin') {
      rows = db.prepare(`
        SELECT r.*, u.name as user_name 
        FROM reservations r 
        JOIN users u ON r.user_id = u.id 
        ORDER BY r.reservation_time DESC
      `).all();
    } else {
      rows = db.prepare(`
        SELECT r.* 
        FROM reservations r 
        WHERE r.user_id = ? 
        ORDER BY r.reservation_time DESC
      `).all(req.user.id);
    }
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reservations' });
  }
});

// Book a reservation
router.post('/', verifyToken, (req, res) => {
  const { vehicle_number, vehicle_type, slot_id, reservation_time } = req.body;
  const userId = req.user.id;

  if (!vehicle_number || !vehicle_type || !slot_id || !reservation_time) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  if (!['Car', 'Bike'].includes(vehicle_type)) {
    return res.status(400).json({ error: 'Vehicle type must be Car or Bike' });
  }

  // Use a transaction
  const bookTx = db.transaction(() => {
    // Check if slot exists and matches vehicle type
    const slot = db.prepare('SELECT * FROM slots WHERE id = ?').get(slot_id);
    if (!slot) {
      throw new Error('Slot does not exist');
    }
    if (slot.type !== vehicle_type) {
      throw new Error(`Slot type (${slot.type}) does not match vehicle type (${vehicle_type})`);
    }

    // Check if slot is occupied
    if (slot.status === 'Occupied') {
      throw new Error('Slot is currently occupied');
    }

    // Check if there is already a pending reservation for this slot
    const existingRes = db.prepare('SELECT id FROM reservations WHERE slot_id = ? AND status = "Pending"').get(slot_id);
    if (existingRes) {
      throw new Error('Slot is already reserved for a pending booking');
    }

    // Insert reservation
    const stmt = db.prepare(`
      INSERT INTO reservations (user_id, vehicle_number, vehicle_type, slot_id, reservation_time, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `);
    const info = stmt.run(userId, vehicle_number.toUpperCase(), vehicle_type, slot_id, reservation_time);
    return info.lastInsertRowid;
  });

  try {
    const resId = bookTx();
    res.status(201).json({ id: resId, message: 'Reservation booked successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Check-in a reserved vehicle (Converts reservation to active parking)
router.post('/:id/checkin', verifyToken, (req, res) => {
  const { id } = req.params;

  const checkinTx = db.transaction(() => {
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!reservation) {
      throw new Error('Reservation not found');
    }

    if (reservation.status !== 'Pending') {
      throw new Error(`Reservation has status "${reservation.status}" and cannot be checked in`);
    }

    // Verify slot is still available
    const slot = db.prepare('SELECT status FROM slots WHERE id = ?').get(reservation.slot_id);
    if (slot.status === 'Occupied') {
      throw new Error('Slot is currently occupied by another vehicle');
    }

    // Check if vehicle is already parked elsewhere
    const existingParked = db.prepare('SELECT id FROM parking_records WHERE vehicle_number = ? AND exit_time IS NULL').get(reservation.vehicle_number);
    if (existingParked) {
      throw new Error('Vehicle is already parked in another slot');
    }

    // 1. Mark slot as occupied
    db.prepare('UPDATE slots SET status = "Occupied" WHERE id = ?').run(reservation.slot_id);

    // 2. Insert parking record
    const entryTime = new Date().toISOString();
    const info = db.prepare(`
      INSERT INTO parking_records (vehicle_number, slot_id, entry_time)
      VALUES (?, ?, ?)
    `).run(reservation.vehicle_number, reservation.slot_id, entryTime);

    // 3. Mark reservation as checked in
    db.prepare('UPDATE reservations SET status = "CheckedIn" WHERE id = ?').run(id);

    return { record_id: info.lastInsertRowid, slot_id: reservation.slot_id, entry_time: entryTime };
  });

  try {
    const result = checkinTx();
    res.json({ message: 'Reservation checked in successfully', ...result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Cancel a reservation
router.post('/:id/cancel', verifyToken, (req, res) => {
  const { id } = req.params;

  try {
    const reservation = db.prepare('SELECT * FROM reservations WHERE id = ?').get(id);
    if (!reservation) {
      return res.status(404).json({ error: 'Reservation not found' });
    }

    // Standard users can only cancel their own reservations
    if (req.user.role !== 'Admin' && reservation.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied: Cannot cancel another user\'s reservation' });
    }

    if (reservation.status !== 'Pending') {
      return res.status(400).json({ error: `Cannot cancel a reservation that is already "${reservation.status}"` });
    }

    db.prepare('UPDATE reservations SET status = "Cancelled" WHERE id = ?').run(id);
    res.json({ message: 'Reservation cancelled successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to cancel reservation' });
  }
});

export default router;
