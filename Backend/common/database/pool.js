const { Pool } = require('pg');
require('dotenv').config();

// PostgreSQL connection pool - shared across all services
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  database: process.env.DB_NAME || 'pgi_emrs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  max: parseInt(process.env.DB_POOL_MAX) || 20,
  idleTimeoutMillis: parseInt(process.env.DB_POOL_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: parseInt(process.env.DB_POOL_CONNECTION_TIMEOUT) || 10000,
});

// Handle pool errors
pool.on('error', (err, client) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

// Main query function
const query = async (text, params = []) => {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    if (duration > 1000) {
      console.warn(`⚠️ Slow query detected: ${duration}ms`, { 
        command: result.command,
        rows: result.rowCount 
      });
    }
    
    return result;
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', text.substring(0, 200));
    console.error('Params:', params.slice(0, 5));
    
    if (error.message && (
      error.message.includes('timeout') || 
      error.message.includes('connection') ||
      error.code === 'ETIMEDOUT' ||
      error.code === 'ECONNREFUSED'
    )) {
      const connectionError = new Error('Database connection timeout. The database may be slow or unavailable. Please try again.');
      connectionError.code = error.code;
      connectionError.originalError = error.message;
      throw connectionError;
    }
    
    throw error;
  }
};

// Get a client from the pool for transactions
const getClient = async () => {
  return await pool.connect();
};

// Test database connection
async function testConnection() {
  try {
    const client = await pool.connect();
    const result = await client.query('SELECT NOW()');
    client.release();
    console.log('✅ Connected to PostgreSQL successfully');
    console.log('📅 Database time:', result.rows[0].now);
    return true;
  } catch (error) {
    console.error('❌ PostgreSQL connection error:', error.message);
    return false;
  }
}

module.exports = {
  query,
  getClient,
  pool,
  testConnection
};

