const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const outPatientsCardRoutes = require('./routes/outPatientsCardRoutes');
const outPatientRecordRoutes = require('./routes/outPatientRecordRoutes');
const fileRoutes = require('./routes/fileRoutes');
const errorHandler = require('../../../common/middleware/errorHandler');
const { testConnection } = require('../../../common/database/pool');

const app = express();
const PORT = process.env.OUT_PATIENTS_CARD_AND_RECORD_SERVICE_PORT || 3002;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000'],
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check
app.get('/health', async (req, res) => {
  const dbConnected = await testConnection();
  res.json({
    success: true,
    service: 'out-patients-card-and-out-patient-record-service',
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes - Using proper model-based routes
app.use('/api/patient-cards', outPatientsCardRoutes);
app.use('/api/out-patient-records', outPatientRecordRoutes);
app.use('/api/patient-files', fileRoutes);

// Legacy routes for backward compatibility (if needed)
// app.use('/api/patients', patientRoutes); // Can be removed if not needed

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Out Patients Card and Out Patient Record Service running on port ${PORT}`);
});

module.exports = app;

