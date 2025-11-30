const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
require('dotenv').config();

const userRoutes = require('./routes/userRoutes');
const sessionRoutes = require('./routes/sessionRoutes');
const authSessionRoutes = require('./routes/authSessionRoutes');
const { authenticateToken } = require('../../../common/middleware/auth');
const errorHandler = require('../../../common/middleware/errorHandler');
const { testConnection } = require('../../../common/database/pool');

const app = express();
const PORT = process.env.USER_SERVICE_PORT || 3001;

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
    service: 'user',
    features: ['authentication', 'user-management', 'session-management'],
    status: 'running',
    database: dbConnected ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString()
  });
});

// Routes
app.use('/api/users', userRoutes);
app.use('/api/sessions', sessionRoutes); // Patient visit sessions (POST /, GET /patient/:id, etc.)
app.use('/api/session', authSessionRoutes); // Authentication sessions (refresh, logout, activity, info)

// Error handler
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 User Service running on port ${PORT}`);
});

module.exports = app;

