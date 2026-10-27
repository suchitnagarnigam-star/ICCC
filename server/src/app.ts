import express from 'express';
import cors from 'cors';
import { ENV } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import complaintRoutes from './routes/complaintRoutes';
import referenceRoutes from './routes/referenceRoutes';
import driveRoutes from './routes/driveRoutes';

const app = express();

// Global Middlewares
app.use(cors({
  origin: true,
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Mount Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/reference', referenceRoutes);
app.use('/api/drive', driveRoutes);

// Error Handling
app.use(errorHandler);

export default app;

