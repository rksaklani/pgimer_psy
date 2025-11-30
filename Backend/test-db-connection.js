#!/usr/bin/env node

/**
 * Database Connection Test Script
 * Tests PostgreSQL connection using .env configuration
 */

const { Pool } = require('pg');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Database configuration from .env
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'pgi_emrs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

console.log('========================================');
console.log('Database Connection Test');
console.log('========================================');
console.log('');
console.log('Configuration from .env:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Password: ${dbConfig.password ? '***' : '(not set)'}`);
console.log('');

async function testConnection() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Testing connection...');
    const startTime = Date.now();
    
    // Test 1: Basic connection
    const versionResult = await pool.query('SELECT version()');
    const connectionTime = Date.now() - startTime;
    
    console.log('✅ Connection successful!');
    console.log(`  Response time: ${connectionTime}ms`);
    console.log(`  PostgreSQL version: ${versionResult.rows[0].version.split(',')[0]}`);
    console.log('');
    
    // Test 2: Database info
    const dbInfo = await pool.query(`
      SELECT 
        current_database() as database_name,
        current_user as current_user,
        inet_server_addr() as server_address,
        inet_server_port() as server_port
    `);
    
    console.log('Database Information:');
    console.log(`  Database: ${dbInfo.rows[0].database_name}`);
    console.log(`  User: ${dbInfo.rows[0].current_user}`);
    console.log(`  Server: ${dbInfo.rows[0].server_address || 'localhost'}:${dbInfo.rows[0].server_port || dbConfig.port}`);
    console.log('');
    
    // Test 3: Check tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    
    console.log(`Tables found: ${tablesResult.rows.length}`);
    if (tablesResult.rows.length > 0) {
      console.log('  Tables:');
      tablesResult.rows.forEach((row, index) => {
        console.log(`    ${index + 1}. ${row.table_name}`);
      });
    }
    console.log('');
    
    // Test 4: Pool stats
    console.log('Connection Pool Stats:');
    console.log(`  Total clients: ${pool.totalCount}`);
    console.log(`  Idle clients: ${pool.idleCount}`);
    console.log(`  Waiting clients: ${pool.waitingCount}`);
    console.log('');
    
    // Test 5: Simple query
    const timeResult = await pool.query('SELECT NOW() as current_time');
    console.log(`Current database time: ${timeResult.rows[0].current_time}`);
    console.log('');
    
    await pool.end();
    
    console.log('========================================');
    console.log('✅ All tests passed! Database is ready.');
    console.log('========================================');
    return true;
    
  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ Connection failed!');
    console.error('========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Possible issues:');
      console.error('  1. PostgreSQL service is not running');
      console.error('  2. Wrong host or port in .env file');
      console.error('  3. Firewall blocking the connection');
      console.error('');
      console.error('Check your .env file:');
      console.error(`  DB_HOST=${dbConfig.host}`);
      console.error(`  DB_PORT=${dbConfig.port}`);
    } else if (error.code === '28P01' || error.message.includes('password')) {
      console.error('Possible issues:');
      console.error('  1. Wrong password in .env file');
      console.error('  2. User does not exist');
      console.error('');
      console.error('Check your .env file:');
      console.error(`  DB_USER=${dbConfig.user}`);
      console.error(`  DB_PASSWORD=<check your password>`);
    } else if (error.code === '3D000') {
      console.error('Possible issues:');
      console.error(`  1. Database '${dbConfig.database}' does not exist`);
      console.error('  2. Run database setup to create tables');
    } else if (error.code === 'ETIMEDOUT') {
      console.error('Possible issues:');
      console.error('  1. Database server is slow or overloaded');
      console.error('  2. Network connectivity issues');
    }
    
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

// Run test
testConnection();

