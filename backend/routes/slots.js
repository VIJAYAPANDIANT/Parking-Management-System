import express from 'express';
import db from '../db/database.js';
import { verifyAdmin, verifyToken } from './auth.js';

const router = express.Router();

// Get all slots (Any authenticated user can view)
router.get('/', verifyToken, (req, res) => {
  try {
    const slots = db.prepare('SELECT * FROM slots').all();
    res.json(slots);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch slots' });
  }
});

// Create a new slot (Admin only)
router.post('/', verifyAdmin, (req, res) => {
  const { type } = req.body;
  if (!['Car', 'Bike'].includes(type)) {
    return res.status(400).json({ error: 'Type must be Car or Bike' });
  }
  
  try {
    const stmt = db.prepare('INSERT INTO slots (type, status) VALUES (?, ?)');
    const info = stmt.run(type, 'Available');
    res.status(201).json({ id: info.lastInsertRowid, type, status: 'Available' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create slot' });
  }
});

// Delete a slot (Admin only)
router.delete('/:id', verifyAdmin, (req, res) => {
  const { id } = req.params;
  try {
    const slot = db.prepare('SELECT status FROM slots WHERE id = ?').get(id);
    if (!slot) {
      return res.status(404).json({ error: 'Slot not found' });
    }
    if (slot.status === 'Occupied') {
      return res.status(400).json({ error: 'Cannot delete an occupied slot' });
    }

    const activeRecord = db.prepare('SELECT id FROM parking_records WHERE slot_id = ? AND exit_time IS NULL').get(id);
    if (activeRecord) {
      return res.status(400).json({ error: 'Cannot delete slot: it is currently occupied' });
    }

    const pendingReservation = db.prepare('SELECT id FROM reservations WHERE slot_id = ? AND status = "Pending"').get(id);
    if (pendingReservation) {
      return res.status(400).json({ error: 'Cannot delete slot: it has a pending reservation' });
    }

    db.prepare('DELETE FROM slots WHERE id = ?').run(id);
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to delete slot. It is referenced by existing parking history.' });
  }
});

export default router;
