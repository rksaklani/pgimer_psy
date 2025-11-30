#!/usr/bin/env node

/**
 * Start Database and Test Connection
 * Uses .env configuration
 */

const { execSync } = require('child_process');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'pgi_emrs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
};

console.log('========================================');
console.log('Starting PostgreSQL Database');
console.log('========================================');
console.log('');
console.log('Configuration from .env:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  Database: ${dbConfig.database}`);
console.log(`  User: ${dbConfig.user}`);
console.log('');

// Check if Docker container exists
try {
  const containerCheck = execSync('docker ps -a --filter name=pgi-emrs-postgres --format "{{.Names}}"', { encoding: 'utf-8' }).trim();
  
  if (containerCheck === 'pgi-emrs-postgres') {
    console.log('Found existing Docker container...');
    
    // Check if running
    const runningCheck = execSync('docker ps --filter name=pgi-emrs-postgres --format "{{.Names}}"', { encoding: 'utf-8' }).trim();
    
    if (runningCheck === 'pgi-emrs-postgres') {
      console.log('✅ Database container is already running');
    } else {
      console.log('Starting container...');
      execSync('docker start pgi-emrs-postgres', { stdio: 'inherit' });
      console.log('✅ Container started');
      console.log('Waiting 5 seconds for PostgreSQL to initialize...');
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  } else {
    console.log('Creating new Docker container...');
    const dockerCmd = `docker run -d --name pgi-emrs-postgres -e POSTGRES_DB=${dbConfig.database} -e POSTGRES_USER=${dbConfig.user} -e POSTGRES_PASSWORD=${dbConfig.password} -p ${dbConfig.port}:5432 -v pgi_emrs_data:/var/lib/postgresql/data postgres:15-alpine`;
    execSync(dockerCmd, { stdio: 'inherit' });
    console.log('✅ Container created and started');
    console.log('Waiting 10 seconds for PostgreSQL to initialize...');
    await new Promise(resolve => setTimeout(resolve, 10000));
  }
  
  console.log('');
  console.log('Testing connection...');
  console.log('');
  
  // Run connection test
  require('./test-db-connection.js');
  
} catch (error) {
  console.error('Error:', error.message);
  console.error('');
  console.error('Please ensure:');
  console.error('  1. Docker Desktop is running');
  console.error('  2. Port 5432 is not in use');
  console.error('  3. .env file has correct database configuration');
}

