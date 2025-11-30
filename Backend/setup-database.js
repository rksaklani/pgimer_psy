#!/usr/bin/env node

/**
 * Database Setup Script
 * Creates database and runs schema using Node.js
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Database configuration from .env or defaults
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: 'postgres', // Connect to default postgres database first
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
};

const targetDbName = process.env.DB_NAME || 'pgi_emrs';
const schemaFile = path.join(__dirname, 'common', 'database', 'schema.sql');

console.log('========================================');
console.log('PGIMER EMRS Database Setup');
console.log('========================================');
console.log('');
console.log('Configuration:');
console.log(`  Host: ${dbConfig.host}`);
console.log(`  Port: ${dbConfig.port}`);
console.log(`  User: ${dbConfig.user}`);
console.log(`  Database: ${targetDbName}`);
console.log('');

// Test connection to postgres database
async function setupDatabase() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Step 1: Testing connection to PostgreSQL...');
    const testResult = await pool.query('SELECT version()');
    console.log('✓ Connected to PostgreSQL successfully');
    console.log(`  Version: ${testResult.rows[0].version.split(',')[0]}`);
    console.log('');

    // Check if database exists
    console.log(`Step 2: Checking if database '${targetDbName}' exists...`);
    const dbCheck = await pool.query(
      `SELECT 1 FROM pg_database WHERE datname = $1`,
      [targetDbName]
    );

    if (dbCheck.rows.length > 0) {
      console.log(`✓ Database '${targetDbName}' already exists`);
    } else {
      console.log(`Creating database '${targetDbName}'...`);
      await pool.query(`CREATE DATABASE ${targetDbName}`);
      console.log(`✓ Database '${targetDbName}' created successfully`);
    }
    console.log('');

    // Close connection to postgres database
    await pool.end();

    // Connect to the target database
    console.log(`Step 3: Connecting to database '${targetDbName}'...`);
    const targetPool = new Pool({
      ...dbConfig,
      database: targetDbName,
    });

    // Check if schema file exists
    if (!fs.existsSync(schemaFile)) {
      throw new Error(`Schema file not found: ${schemaFile}`);
    }

    console.log(`Step 4: Reading schema file...`);
    const schemaSQL = fs.readFileSync(schemaFile, 'utf8');
    console.log('✓ Schema file loaded');
    console.log('');

    console.log('Step 5: Running schema script...');
    console.log('  This may take a few moments...');
    
    // Try to execute the entire schema first
    try {
      await targetPool.query(schemaSQL);
      console.log('✓ Schema executed successfully');
    } catch (error) {
      // If full execution fails, try executing statement by statement
      console.log('  Full execution had issues, trying statement by statement...');
      
      // Split by semicolon but preserve dollar-quoted strings
      const statements = [];
      let currentStatement = '';
      let inDollarQuote = false;
      let dollarTag = '';
      
      const lines = schemaSQL.split('\n');
      for (const line of lines) {
        // Skip comments
        if (line.trim().startsWith('--')) continue;
        
        currentStatement += line + '\n';
        
        // Check for dollar-quoted strings
        const dollarMatches = line.match(/\$([^$]*)\$/g);
        if (dollarMatches) {
          for (const match of dollarMatches) {
            if (!inDollarQuote) {
              dollarTag = match;
              inDollarQuote = true;
            } else if (match === dollarTag) {
              inDollarQuote = false;
              dollarTag = '';
            }
          }
        }
        
        // If we're not in a dollar quote and line ends with semicolon, it's a complete statement
        if (!inDollarQuote && line.trim().endsWith(';')) {
          const stmt = currentStatement.trim();
          if (stmt && stmt.length > 10) { // Ignore very short statements
            statements.push(stmt);
          }
          currentStatement = '';
        }
      }
      
      // Execute statements one by one
      let executed = 0;
      let errors = 0;
      for (const statement of statements) {
        try {
          await targetPool.query(statement);
          executed++;
        } catch (error) {
          // Ignore "already exists" and "does not exist" errors
          if (!error.message.includes('does not exist') && 
              !error.message.includes('already exists') &&
              !error.message.includes('duplicate key')) {
            errors++;
            if (errors <= 3) { // Only show first 3 errors
              console.warn(`  Warning: ${error.message.substring(0, 100)}`);
            }
          }
        }
      }
      console.log(`✓ Schema executed (${executed} statements, ${errors} errors)`);
    }
    console.log('');

    // Verify tables were created
    console.log('Step 6: Verifying tables...');
    const tablesResult = await targetPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);

    const tableCount = tablesResult.rows.length;
    console.log(`✓ Found ${tableCount} tables:`);
    tablesResult.rows.forEach((row, index) => {
      console.log(`  ${index + 1}. ${row.table_name}`);
    });
    console.log('');

    // Test connection with final config
    console.log('Step 7: Testing final connection...');
    const testQuery = await targetPool.query('SELECT NOW() as current_time, current_database() as db_name');
    console.log('✓ Connection test successful');
    console.log(`  Database: ${testQuery.rows[0].db_name}`);
    console.log(`  Server time: ${testQuery.rows[0].current_time}`);
    console.log('');

    await targetPool.end();

    console.log('========================================');
    console.log('✅ Database setup completed successfully!');
    console.log('========================================');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run: npm run seed:users (to create seed users)');
    console.log('2. Start your services: npm start');
    console.log('');

  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ Database setup failed!');
    console.error('========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Possible issues:');
      console.error('  1. PostgreSQL is not running');
      console.error('  2. Wrong host or port');
      console.error('  3. Firewall blocking connection');
    } else if (error.code === '28P01' || error.message.includes('password')) {
      console.error('Possible issues:');
      console.error('  1. Wrong password in .env file');
      console.error('  2. User does not exist');
    } else if (error.code === '3D000') {
      console.error('Possible issues:');
      console.error('  1. Database does not exist and cannot be created');
      console.error('  2. User does not have CREATE DATABASE permission');
    }
    
    console.error('');
    process.exit(1);
  }
}

// Run setup
setupDatabase();

