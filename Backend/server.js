#!/usr/bin/env node

/**
 * Main Gateway Server - Starts All Services + Gateway
 * 
 * This is a single entry point that:
 * 1. Starts all 5 microservices concurrently
 * 2. Starts the API gateway server that proxies all requests
 * 
 * Services:
 * - user (Port 3001)
 * - out-patients-card-and-out-patient-record (Port 3002)
 * - adult-walk-in-clinical-performa (Port 3003)
 * - out-patient-intake-record (Port 3004)
 * - prescription (Port 3005)
 * 
 * Run: node server.js
 * Or: npm start
 */

require('dotenv').config();
const express = require('express');
const proxy = require('express-http-proxy');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bgBlue: '\x1b[44m',
  bgGreen: '\x1b[42m',
};

// Service definitions
const services = [
  {
    name: 'user',
    port: process.env.USER_SERVICE_PORT || 3001,
    path: path.join(__dirname, 'services', 'user'),
    color: colors.green
  },
  {
    name: 'out-patients-card-and-out-patient-record',
    port: process.env.OUT_PATIENTS_CARD_AND_RECORD_SERVICE_PORT || 3002,
    path: path.join(__dirname, 'services', 'out-patients-card-and-out-patient-record'),
    color: colors.blue
  },
  {
    name: 'adult-walk-in-clinical-performa',
    port: process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_PORT || 3003,
    path: path.join(__dirname, 'services', 'adult-walk-in-clinical-performa'),
    color: colors.cyan
  },
  {
    name: 'out-patient-intake-record',
    port: process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_PORT || 3004,
    path: path.join(__dirname, 'services', 'out-patient-intake-record'),
    color: colors.magenta
  },
  {
    name: 'prescription',
    port: process.env.PRESCRIPTION_SERVICE_PORT || 3005,
    path: path.join(__dirname, 'services', 'prescription'),
    color: colors.yellow
  }
];

// Service URLs for proxy
const SERVICE_URLS = {
  // Service URLs used in route proxies
  user: process.env.USER_SERVICE_URL || 'http://localhost:3001',
  outPatientsCardAndRecord: process.env.OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL || 'http://localhost:3002',
  adultWalkInClinical: process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL || 'http://localhost:3003',
  outPatientIntakeRecord: process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_URL || 'http://localhost:3004',
  prescription: process.env.PRESCRIPTION_SERVICE_URL || 'http://localhost:3005'
};

// Store service processes
const serviceProcesses = [];

// Function to start all microservices
function startAllServices() {
  console.log(`\n${colors.bright}${colors.cyan}╔════════════════════════════════════════════════════════════════════════╗${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}║${colors.reset}  ${colors.bright}${colors.yellow}🚀 Starting PGIMER EMRS Microservices${colors.reset}${colors.bright}${colors.cyan}                                    ║${colors.reset}`);
  console.log(`${colors.bright}${colors.cyan}╚════════════════════════════════════════════════════════════════════════╝${colors.reset}\n`);

  services.forEach((service, index) => {
    const packageJsonPath = path.join(service.path, 'package.json');
    
    if (!fs.existsSync(packageJsonPath)) {
      console.log(`${colors.yellow}⚠️  Skipping ${service.name} - package.json not found${colors.reset}`);
      return;
    }

    const progress = `${colors.dim}[${index + 1}/${services.length}]${colors.reset}`;
    console.log(`${progress} ${colors.blue}${colors.bright}Starting${colors.reset} ${service.color}${service.name}${colors.reset} ${colors.dim}on port ${service.port}...${colors.reset}`);

    const child = spawn('node', ['src/index.js'], {
      cwd: service.path,
      env: {
        ...process.env,
        NODE_ENV: process.env.NODE_ENV || 'development',
        PORT: service.port
      },
      stdio: 'pipe',
      shell: true
    });

    // Handle service output - only show important messages
    child.stdout.on('data', (data) => {
      const output = data.toString().trim();
      // Only show service startup messages, filter out other noise
      if (output && (output.includes('🚀') || output.includes('running on port') || output.includes('Service running'))) {
        const cleanOutput = output.replace(/\[.*?\]/g, '').trim();
        console.log(`  ${service.color}${colors.bright}✓${colors.reset} ${service.color}${cleanOutput}${colors.reset}`);
      }
    });

    child.stderr.on('data', (data) => {
      const output = data.toString().trim();
      if (output && !output.includes('DeprecationWarning') && !output.includes('ExperimentalWarning')) {
        console.error(`  ${colors.red}✗${colors.reset} ${colors.red}[${service.name}] ${output}${colors.reset}`);
      }
    });

    child.on('error', (error) => {
      console.error(`  ${colors.red}✗${colors.reset} ${colors.red}Error starting ${service.name}: ${error.message}${colors.reset}`);
    });

    child.on('exit', (code) => {
      if (code !== 0 && code !== null) {
        console.log(`  ${colors.red}✗${colors.reset} ${colors.red}${service.name} exited with code ${code}${colors.reset}`);
      }
    });

    serviceProcesses.push({ name: service.name, process: child });
  });

  // Wait a bit for services to start
  console.log(`\n${colors.green}${colors.bright}✅ All services initialized!${colors.reset} ${colors.dim}Waiting for services to be ready...${colors.reset}\n`);
}

// Setup Express Gateway
const app = express();
const GATEWAY_PORT = process.env.GATEWAY_PORT || 5000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000',' http://localhost:8001'],
  credentials: true
}));
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'api-gateway',
    status: 'running',
    timestamp: new Date().toISOString(),
    services: services.map(s => ({ name: s.name, port: s.port }))
  });
});

// Proxy configuration function
const createProxy = (serviceUrl, serviceName, pathPrefix = '') => {
  return proxy(serviceUrl, {
    proxyReqPathResolver: (req) => {
      // Preserve the full path including the prefix
      return pathPrefix + req.url;
    },
    proxyErrorHandler: (err, res, next) => {
      console.error(`[${serviceName}] Proxy error:`, err.message);
      res.status(503).json({
        success: false,
        message: `${serviceName} service is unavailable`,
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
      });
    },
    timeout: 30000,
    limit: '50mb'
  });
};

// Route proxies
app.use('/api/users', createProxy(SERVICE_URLS.user, 'user', '/api/users'));
app.use('/api/sessions', createProxy(SERVICE_URLS.user, 'user', '/api/sessions')); // Sessions are now part of user
app.use('/api/session', createProxy(SERVICE_URLS.user, 'user', '/api/session')); // Legacy route
app.use('/api/patients', createProxy(SERVICE_URLS.outPatientsCardAndRecord, 'out-patients-card-and-out-patient-record', '/api/patients'));
app.use('/api/patient-cards', createProxy(SERVICE_URLS.outPatientsCardAndRecord, 'out-patients-card-and-out-patient-record', '/api/patient-cards'));
app.use('/api/patient-files', createProxy(SERVICE_URLS.outPatientsCardAndRecord, 'out-patients-card-and-out-patient-record', '/api/patient-files'));
app.use('/api/out-patient-records', createProxy(SERVICE_URLS.outPatientsCardAndRecord, 'out-patients-card-and-out-patient-record', '/api/out-patient-records'));
app.use('/api/clinical-proformas', createProxy(SERVICE_URLS.adultWalkInClinical, 'adult-walk-in-clinical-performa', '/api/clinical-proformas'));
app.use('/api/clinical-options', createProxy(SERVICE_URLS.adultWalkInClinical, 'adult-walk-in-clinical-performa', '/api/clinical-options')); // Options are now part of clinical service
app.use('/api/outpatient-intake-records', createProxy(SERVICE_URLS.outPatientIntakeRecord, 'out-patient-intake-record', '/api/outpatient-intake-records'));
app.use('/api/prescriptions', createProxy(SERVICE_URLS.prescription, 'prescription', '/api/prescriptions'));

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'PGIMER EMRS Microservices API Gateway',
    version: '2.0.0',
    services: [
      {
        name: 'user',
        port: 3001,
        endpoints: ['/api/users', '/api/sessions']
      },
      {
        name: 'out-patients-card-and-out-patient-record',
        port: 3002,
        endpoints: ['/api/patients', '/api/patient-cards', '/api/patient-files', '/api/out-patient-records']
      },
      {
        name: 'adult-walk-in-clinical-performa',
        port: 3003,
        endpoints: ['/api/clinical-proformas', '/api/clinical-options']
      },
      {
        name: 'out-patient-intake-record',
        port: 3004,
        endpoints: ['/api/outpatient-intake-records']
      },
      {
        name: 'prescription',
        port: 3005,
        endpoints: ['/api/prescriptions']
      }
    ],
    endpoints: {
      users: '/api/users',
      sessions: '/api/sessions',
      patients: '/api/patients',
      patientCards: '/api/patient-cards',
      patientFiles: '/api/patient-files',
      outPatientRecords: '/api/out-patient-records',
      clinicalProformas: '/api/clinical-proformas',
      clinicalOptions: '/api/clinical-options',
      outpatientIntakeRecords: '/api/outpatient-intake-records',
      prescriptions: '/api/prescriptions',
      health: '/health'
    }
  });
});

// API Documentation endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'PGIMER EMRS Microservices API Documentation',
    version: '2.0.0',
    gateway: {
      baseUrl: `http://localhost:${GATEWAY_PORT}`,
      healthCheck: `http://localhost:${GATEWAY_PORT}/health`
    },
    services: [
      {
        name: 'user',
        port: 3001,
        url: SERVICE_URLS.user,
        endpoints: [
          { path: '/api/users', description: 'User management endpoints' },
          { path: '/api/sessions', description: 'Session management endpoints' },
          { path: '/api/session', description: 'Legacy session endpoint' }
        ]
      },
      {
        name: 'out-patients-card-and-out-patient-record',
        port: 3002,
        url: SERVICE_URLS.outPatientsCardAndRecord,
        endpoints: [
          { path: '/api/patients', description: 'Patient management endpoints' },
          { path: '/api/patient-cards', description: 'Patient card endpoints' },
          { path: '/api/patient-files', description: 'Patient file endpoints' },
          { path: '/api/out-patient-records', description: 'Out-patient record endpoints' }
        ]
      },
      {
        name: 'adult-walk-in-clinical-performa',
        port: 3003,
        url: SERVICE_URLS.adultWalkInClinical,
        endpoints: [
          { path: '/api/clinical-proformas', description: 'Clinical proforma endpoints' },
          { path: '/api/clinical-options', description: 'Clinical options endpoints' }
        ]
      },
      {
        name: 'out-patient-intake-record',
        port: 3004,
        url: SERVICE_URLS.outPatientIntakeRecord,
        endpoints: [
          { path: '/api/outpatient-intake-records', description: 'Out-patient intake record endpoints' }
        ]
      },
      {
        name: 'prescription',
        port: 3005,
        url: SERVICE_URLS.prescription,
        endpoints: [
          { path: '/api/prescriptions', description: 'Prescription management endpoints' }
        ]
      }
    ],
    commonEndpoints: {
      root: '/',
      apiDocs: '/api',
      health: '/health'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Gateway error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log(`\n${colors.yellow}🛑 Shutting down...${colors.reset}`);
  
  // Kill all service processes
  serviceProcesses.forEach(({ name, process }) => {
    console.log(`${colors.yellow}Stopping ${name}...${colors.reset}`);
    process.kill();
  });
  
  // Exit
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log(`\n${colors.yellow}🛑 Shutting down...${colors.reset}`);
  
  serviceProcesses.forEach(({ name, process }) => {
    process.kill();
  });
  
  process.exit(0);
});

// Start everything
startAllServices();

// Start gateway server after a delay
let gatewayStarted = false;
setTimeout(() => {
  if (gatewayStarted) return; // Prevent multiple starts
  gatewayStarted = true;
  
  app.listen(GATEWAY_PORT, '0.0.0.0', () => {
    // Header
    console.log(`\n${colors.bgBlue}${colors.white}${colors.bright}`);
    console.log('╔════════════════════════════════════════════════════════════════════════╗');
    console.log('║                                                                        ║');
    console.log('║              🚀  PGIMER EMRS - API GATEWAY SERVER  🚀                  ║');
    console.log('║                                                                        ║');
    console.log('╚════════════════════════════════════════════════════════════════════════╝');
    console.log(`${colors.reset}\n`);
    
    // Server Info
    console.log(`${colors.cyan}${colors.bright}📡 Server Information${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(64)}${colors.reset}`);
    console.log(`  ${colors.green}✓${colors.reset} Port:        ${colors.bright}${GATEWAY_PORT}${colors.reset}`);
    console.log(`  ${colors.green}✓${colors.reset} Environment:  ${colors.bright}${process.env.NODE_ENV || 'development'}${colors.reset}`);
    console.log(`  ${colors.green}✓${colors.reset} Status:       ${colors.green}${colors.bright}Running${colors.reset}\n`);
    
    // Services Status
    console.log(`${colors.cyan}${colors.bright}🔧 Microservices${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(64)}${colors.reset}`);
    services.forEach((service, index) => {
      const status = `${colors.green}●${colors.reset}`;
      const name = service.name.padEnd(45);
      const url = `http://localhost:${service.port}`;
      console.log(`  ${status} ${service.color}${name}${colors.reset} ${colors.dim}${url}${colors.reset}`);
    });
    console.log('');
    
    // API Endpoints
    console.log(`${colors.cyan}${colors.bright}🌐 API Endpoints${colors.reset}`);
    console.log(`${colors.dim}${'─'.repeat(64)}${colors.reset}`);
    console.log(`  ${colors.yellow}→${colors.reset} Gateway:     ${colors.bright}http://localhost:${GATEWAY_PORT}${colors.reset}`);
    console.log(`  ${colors.yellow}→${colors.reset} Health Check: ${colors.bright}http://localhost:${GATEWAY_PORT}/health${colors.reset}`);
    console.log(`  ${colors.yellow}→${colors.reset} API Docs:     ${colors.bright}http://localhost:${GATEWAY_PORT}/api${colors.reset}\n`);
    
    // Footer
    console.log(`${colors.dim}${'─'.repeat(64)}${colors.reset}`);
    console.log(`${colors.green}${colors.bright}✅ All services are running and ready to accept requests!${colors.reset}\n`);
  });
}, 3000); // Wait 3 seconds for services to initialize

module.exports = app;
