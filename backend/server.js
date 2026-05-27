import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import slotRoutes from './routes/slots.js';
import parkingRoutes from './routes/parking.js';
import dashboardRoutes from './routes/dashboard.js';
import ratesRoutes from './routes/rates.js';
import reservationsRoutes from './routes/reservations.js';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/slots', slotRoutes);
app.use('/api/parking', parkingRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/rates', ratesRoutes);
app.use('/api/reservations', reservationsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something broke!' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

export default app;
