import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authRouter } from './routes/auth';
import { districtsRouter } from './routes/districts';
import { incidentsRouter } from './routes/incidents';
import { sheltersRouter } from './routes/shelters';
import { resourcesRouter } from './routes/resources';
import { riskRouter } from './routes/risk';
import { dashboardRouter } from './routes/dashboard';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Health endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'ResilienceOS Tamil Nadu API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    note: 'DEMO MODE — All data is synthetic and for demonstration purposes only',
  });
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/districts', districtsRouter);
app.use('/api/incidents', incidentsRouter);
app.use('/api/shelters', sheltersRouter);
app.use('/api/resources', resourcesRouter);
app.use('/api/risk', riskRouter);
app.use('/api/dashboard', dashboardRouter);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not found', path: req.path });
});

// Error handler
app.use((err: Error, req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`\n🚨 ResilienceOS Tamil Nadu API`);
  console.log(`   Running on http://localhost:${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/api/health`);
  console.log(`   Mode: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   ⚠  DEMO MODE — Synthetic data only\n`);
});

export default app;
