import express from 'express';
import cors from 'cors';
import path from 'path';
import incidentRoutes from './routes/incidentRoutes';
import cameraRoutes from './routes/cameraRoutes';
import { errorHandler } from './middleware/errorHandler';
import { notFound } from './middleware/notFound';

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploads)
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/incidents', incidentRoutes);
app.use('/api/cameras', cameraRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
