import express from 'express';
import db from '../db/database.js';
import { verifyAdmin, verifyToken } from './auth.js';

const router = express.Router();

// Get all rates (All authenticated users)
router.get('/', verifyToken, (req, res) => {
  try {
    const rates = db.prepare('SELECT * FROM rates').all();
    res.json(rates);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch rates' });
  }
});

// Update rates (Admin only)
router.put('/', verifyAdmin, (req, res) => {
  const { rates } = req.body; // Expecting { Car: 50, Bike: 20 } or similar
  
  if (!rates || typeof rates !== 'object') {
    return res.status(400).json({ error: 'Invalid rates object provided' });
  }

  const updateRatesTx = db.transaction(() => {
    for (const [type, rate] of Object.entries(rates)) {
      if (!['Car', 'Bike'].includes(type)) {
        throw new Error(`Invalid vehicle type: ${type}`);
      }
      const rateVal = parseFloat(rate);
      if (isNaN(rateVal) || rateVal < 0) {
        throw new Error(`Invalid rate value for ${type}`);
      }
      db.prepare('INSERT OR REPLACE INTO rates (vehicle_type, hourly_rate) VALUES (?, ?)').run(type, rateVal);
    }
  });

  try {
    updateRatesTx();
    res.json({ message: 'Rates updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message || 'Failed to update rates' });
  }
});

export default router;
