#!/usr/bin/env node

/**
 * Seed Users Script
 * Creates default users for all roles for testing/login
 */

const { Pool } = require('pg');
const bcrypt = require('bcryptjs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

// Database configuration from .env
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 5432,
  database: process.env.DB_NAME || 'pgi_emrs',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'root',
};

// Seed users for all roles
const seedUsers = [
  {
    name: 'Admin User',
    email: 'admin@pgimer.com',
    password: 'admin123',
    role: 'Admin',
    mobile: '9876543210'
  },
  {
    name: 'Faculty User',
    email: 'faculty@pgimer.com',
    password: 'faculty123',
    role: 'Faculty',
    mobile: '9876543211'
  },
  {
    name: 'Resident User',
    email: 'resident@pgimer.com',
    password: 'resident123',
    role: 'Resident',
    mobile: '9876543212'
  },
  {
    name: 'Psychiatric Welfare Officer',
    email: 'mwo@pgimer.com',
    password: 'mwo123',
    role: 'Psychiatric Welfare Officer',
    mobile: '9876543213'
  }
];

console.log('========================================');
console.log('Seeding Users');
console.log('========================================');
console.log('');

async function seedDatabase() {
  const pool = new Pool(dbConfig);
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
  
  try {
    console.log('Connecting to database...');
    const testResult = await pool.query('SELECT NOW()');
    console.log('✓ Connected successfully');
    console.log('');

    console.log('Creating seed users...');
    let created = 0;
    let skipped = 0;

    for (const userData of seedUsers) {
      try {
        // Check if user already exists
        const existing = await pool.query(
          'SELECT id, email FROM users WHERE email = $1',
          [userData.email]
        );

        if (existing.rows.length > 0) {
          console.log(`  ⚠ Skipping ${userData.email} (already exists)`);
          skipped++;
          continue;
        }

        // Hash password
        const password_hash = await bcrypt.hash(userData.password, saltRounds);

        // Insert user
        const result = await pool.query(
          `INSERT INTO users (name, email, password_hash, role, mobile, is_active)
           VALUES ($1, $2, $3, $4, $5, true)
           RETURNING id, name, email, role, mobile`,
          [userData.name, userData.email, password_hash, userData.role, userData.mobile]
        );

        const user = result.rows[0];
        console.log(`  ✓ Created ${user.role}: ${user.email} (Password: ${userData.password})`);
        created++;
      } catch (error) {
        console.error(`  ✗ Failed to create ${userData.email}: ${error.message}`);
      }
    }

    console.log('');
    console.log('========================================');
    console.log('✅ Seeding completed!');
    console.log('========================================');
    console.log('');
    console.log(`Created: ${created} users`);
    console.log(`Skipped: ${skipped} users (already exist)`);
    console.log('');
    console.log('Login Credentials:');
    console.log('────────────────────────────────────────');
    seedUsers.forEach(user => {
      console.log(`  ${user.role.padEnd(30)} ${user.email.padEnd(25)} ${user.password}`);
    });
    console.log('────────────────────────────────────────');
    console.log('');

    await pool.end();

  } catch (error) {
    console.error('');
    console.error('========================================');
    console.error('❌ Seeding failed!');
    console.error('========================================');
    console.error('');
    console.error('Error:', error.message);
    console.error('');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('Database is not running. Please start it first.');
    } else if (error.code === '3D000') {
      console.error('Database does not exist. Run: npm run setup:db');
    }
    
    console.error('');
    await pool.end();
    process.exit(1);
  }
}

// Run seeding
seedDatabase();

