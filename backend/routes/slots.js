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
    db.prepare('DELETE FROM slots WHERE id = ?').run(id);
    res.json({ message: 'Slot deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete slot' });
  }
});

export default router;
