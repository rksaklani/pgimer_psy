#!/usr/bin/env node

/**
 * Install Dependencies for All Services
 * 
 * This script installs npm dependencies for all microservices.
 * Run: npm run install:all
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  red: '\x1b[31m',
};

const servicesDir = path.join(__dirname, 'services');
const services = [
  'user',
  'out-patients-card-and-out-patient-record',
  'adult-walk-in-clinical-performa',
  'out-patient-intake-record',
  'prescription'
];

console.log(`${colors.blue}📦 Installing dependencies for all services...${colors.reset}\n`);

// Install root dependencies
console.log(`${colors.blue}Installing root dependencies...${colors.reset}`);
try {
  execSync('npm install', { stdio: 'inherit', cwd: __dirname });
  console.log(`${colors.green}✅ Root dependencies installed${colors.reset}\n`);
} catch (error) {
  console.error(`${colors.red}❌ Failed to install root dependencies${colors.reset}`);
}

// Install each service's dependencies
let successCount = 0;
let failCount = 0;

services.forEach((serviceName, index) => {
  const servicePath = path.join(servicesDir, serviceName);
  const packageJsonPath = path.join(servicePath, 'package.json');
  
  if (!fs.existsSync(packageJsonPath)) {
    console.log(`${colors.yellow}⚠️  Skipping ${serviceName} - package.json not found${colors.reset}`);
    failCount++;
    return;
  }
  
  console.log(`${colors.blue}[${index + 1}/${services.length}] Installing ${serviceName}...${colors.reset}`);
  
  try {
    execSync('npm install', { 
      cwd: servicePath, 
      stdio: 'inherit' 
    });
    console.log(`${colors.green}✅ ${serviceName} installed successfully${colors.reset}\n`);
    successCount++;
  } catch (error) {
    console.error(`${colors.red}❌ ${serviceName} installation failed${colors.reset}\n`);
    failCount++;
  }
});

console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}`);
if (failCount === 0) {
  console.log(`${colors.green}✅ All services installed successfully!${colors.reset}`);
  console.log(`${colors.green}🚀 You can now run: npm start${colors.reset}`);
} else {
  console.log(`${colors.yellow}⚠️  ${failCount} service(s) failed to install${colors.reset}`);
  console.log(`${colors.yellow}   ${successCount} service(s) installed successfully${colors.reset}`);
  console.log(`${colors.yellow}   Try installing manually in failed service directories${colors.reset}`);
}
console.log(`${colors.blue}═══════════════════════════════════════════════════════${colors.reset}\n`);
