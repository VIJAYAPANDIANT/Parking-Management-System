import express from 'express';
import db from '../db/database.js';
import { verifyToken } from './auth.js';

const router = express.Router();

router.get('/', verifyToken, (req, res) => {
  try {
    const totalSlots = db.prepare("SELECT COUNT(*) as count FROM slots").get().count;
    const occupiedSlots = db.prepare("SELECT COUNT(*) as count FROM slots WHERE status = 'Occupied'").get().count;
    const availableSlots = totalSlots - occupiedSlots;
    const activeVehicles = db.prepare("SELECT COUNT(*) as count FROM parking_records WHERE exit_time IS NULL").get().count;
    
    // Calculate total revenue generated
    const revenueRow = db.prepare("SELECT SUM(fee) as totalRevenue FROM parking_records WHERE fee IS NOT NULL").get();
    const totalRevenue = revenueRow.totalRevenue || 0;

    res.json({
      totalSlots,
      occupiedSlots,
      availableSlots,
      activeVehicles,
      totalRevenue
    });
  } catch (error) {
    res.status(500).json({ error: 'Internal server error while fetching dashboard stats' });
  }
});

export default router;
