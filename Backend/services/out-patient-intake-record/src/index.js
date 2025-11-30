const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const adlRoutes = require('./routes/adlRoutes');
const errorHandler = require('../../../common/middleware/errorHandler');
const { testConnection } = require('../../../common/database/pool');

const app = express();
const PORT = process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_PORT || 3004;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    success: true,
    service: 'out-patient-intake-record',
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/outpatient-intake-records', adlRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Out Patient Intake Record Service running on port ${PORT}`);
});

module.exports = app;

