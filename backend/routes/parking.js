import express from 'express';
import db from '../db/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

// Rates are now fetched dynamically from the SQLite 'rates' table.

// Vehicle Entry
router.post('/entry', verifyToken, (req, res) => {
  const { vehicle_number, type } = req.body;
  
  if (!vehicle_number || !['Car', 'Bike'].includes(type)) {
    return res.status(400).json({ error: 'Valid vehicle_number and type (Car/Bike) are required' });
  }

  // Use a transaction
  const assignSlot = db.transaction(() => {
    // Check if vehicle is already parked
    const existing = db.prepare('SELECT id FROM parking_records WHERE vehicle_number = ? AND exit_time IS NULL').get(vehicle_number);
    if (existing) {
      throw new Error('Vehicle is already parked');
    }

    // Find nearest available slot
    const slot = db.prepare('SELECT id FROM slots WHERE type = ? AND status = "Available" ORDER BY id ASC LIMIT 1').get(type);
    
    if (!slot) {
      throw new Error(`Parking full for ${type}`);
    }

    // Mark slot as occupied
    db.prepare('UPDATE slots SET status = "Occupied" WHERE id = ?').run(slot.id);
    
    // Create record
    const entryTime = new Date().toISOString();
    const info = db.prepare('INSERT INTO parking_records (vehicle_number, slot_id, entry_time) VALUES (?, ?, ?)').run(vehicle_number, slot.id, entryTime);
    
    return { record_id: info.lastInsertRowid, slot_id: slot.id, entry_time: entryTime };
  });

  try {
    const result = assignSlot();
    res.status(201).json({ message: 'Vehicle parked successfully', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Vehicle Exit
router.post('/exit', verifyToken, (req, res) => {
  const { vehicle_number } = req.body;
  if (!vehicle_number) return res.status(400).json({ error: 'vehicle_number required' });

  const processExit = db.transaction(() => {
    const record = db.prepare(`
      SELECT p.id, p.entry_time, p.slot_id, s.type 
      FROM parking_records p 
      JOIN slots s ON p.slot_id = s.id 
      WHERE p.vehicle_number = ? AND p.exit_time IS NULL
    `).get(vehicle_number);

    if (!record) {
      throw new Error('Vehicle not found or already exited');
    }

    const exitTime = new Date();
    const entryTime = new Date(record.entry_time);
    
    // Calculate hours (minimum 1 hour)
    const msDiff = exitTime - entryTime;
    let hours = Math.ceil(msDiff / (1000 * 60 * 60));
    if (hours < 1) hours = 1;

    const rateRow = db.prepare('SELECT hourly_rate FROM rates WHERE vehicle_type = ?').get(record.type);
    const hourlyRate = rateRow ? rateRow.hourly_rate : (record.type === 'Car' ? 50 : 20);
    const fee = hours * hourlyRate;
    const exitTimeStr = exitTime.toISOString();

    db.prepare('UPDATE parking_records SET exit_time = ?, fee = ? WHERE id = ?').run(exitTimeStr, fee, record.id);
    db.prepare('UPDATE slots SET status = "Available" WHERE id = ?').run(record.slot_id);

    return { record_id: record.id, exit_time: exitTimeStr, duration_hours: hours, fee };
  });

  try {
    const result = processExit();
    res.json({ message: 'Vehicle exited successfully', ...result });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get active parked vehicles
router.get('/active', verifyToken, (req, res) => {
  try {
    const records = db.prepare(`
      SELECT p.id, p.vehicle_number, p.entry_time, s.id as slot_id, s.type 
      FROM parking_records p 
      JOIN slots s ON p.slot_id = s.id 
      WHERE p.exit_time IS NULL
      ORDER BY p.entry_time DESC
    `).all();
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch active records' });
  }
});

export default router;
