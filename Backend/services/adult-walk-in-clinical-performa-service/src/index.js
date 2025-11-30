const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const clinicalRoutes = require('./routes/clinicalRoutes');
const optionsRoutes = require('./routes/optionsRoutes');
const errorHandler = require('../../../common/middleware/errorHandler');
const { testConnection } = require('../../../common/database/pool');

const app = express();
const PORT = process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_PORT || 3003;

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
    service: 'adult-walk-in-clinical-performa-service',
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/clinical-proformas', clinicalRoutes);
app.use('/api/clinical-options', optionsRoutes);

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Adult Walk-in Clinical Proforma Service running on port ${PORT}`);
});

module.exports = app;
