# PGIMER EMRS - Microservices Backend

Electronic Medical Record System for Psychiatry Department - Postgraduate Institute of Medical Education & Research, Chandigarh

## Overview

This is a microservices-based backend architecture for the PGIMER EMRS system. The monolithic backend has been refactored into 5 independent, scalable services that communicate via HTTP/REST APIs.

## Architecture

### Microservices

1. **user** (Port 3001)
   - User management and authentication
   - JWT token generation and refresh
   - 2FA (Two-Factor Authentication)
   - Password reset
   - User roles and permissions
   - Session management (integrated from session-service)

2. **out-patients-card-and-out-patient-record** (Port 3002)
   - Patient card management
   - Out-patient record management
   - Patient registration and management
   - Patient CRUD operations
   - Patient search and filtering
   - Patient statistics
   - Single file upload for both patient cards and out-patient records
   - File management (integrated from patient-file-upload-service)

3. **adult-walk-in-clinical-performa** (Port 3003)
   - Adult walk-in clinical performa creation and management
   - Walk-in clinical assessments
   - Simple and complex case handling
   - Clinical statistics
   - Clinical form options management (integrated from walkin-clinical-performa-option-service)
   - Dynamic dropdown options
   - Options CRUD operations

4. **out-patient-intake-record** (Port 3004)
   - Outpatient intake record management
   - ADL (Activities of Daily Living) file management
   - Complex case detailed workups
   - File status tracking
   - File uploads for intake records
   - ADL file statistics

5. **prescription** (Port 3005)
   - Prescription creation and management
   - Medication management
   - Prescription history

### Shared Modules (Common)

- **database/pool.js** - PostgreSQL connection pool
- **utils/tokenUtils.js** - JWT token utilities
- **utils/emailService.js** - Email service for OTP and notifications
- **utils/logger.js** - Logging utilities
- **middleware/auth.js** - Authentication and authorization middleware
- **middleware/errorHandler.js** - Global error handling

## Technology Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: PostgreSQL 15
- **Authentication**: JWT (JSON Web Tokens)
- **API Gateway**: Nginx
- **Containerization**: Docker & Docker Compose
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator
- **File Upload**: Multer

## Project Structure

```
Backend-Microservices/
├── services/
│   ├── user/
│   │   ├── src/
│   │   │   ├── controllers/
│   │   │   ├── models/
│   │   │   ├── routes/
│   │   │   ├── middleware/
│   │   │   └── index.js
│   │   └── package.json
│   ├── out-patients-card-and-out-patient-record/
│   ├── adult-walk-in-clinical-performa/
│   ├── out-patient-intake-record/
│   └── prescription/
├── common/
│   ├── database/
│   │   └── pool.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   ├── emailService.js
│   │   └── logger.js
│   └── middleware/
│       ├── auth.js
│       └── errorHandler.js
├── nginx/
│   └── nginx.conf
├── docker-compose.yml
├── .env.example
└── README.md
```

## Getting Started

### Prerequisites

- Docker and Docker Compose (for containerized deployment)
- Node.js 18+ (for local development)
- PostgreSQL 15+ (if running without Docker)
- npm or yarn

### Quick Start - Run All Services

**Option 1: Using Node.js (Recommended for Development)**

1. **Navigate to Backend-Microservices**
   ```bash
   cd Backend-Microservices
   ```

2. **Install root dependencies**
   ```bash
   npm install
   ```

3. **Install all service dependencies**
   ```bash
   npm run install:all
   ```
   This installs dependencies for all 5 services automatically.

4. **Copy and configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials and configuration
   ```

5. **Start all services and gateway with one command**
   ```bash
   npm start
   ```
   Or:
   ```bash
   node server.js
   ```

   This will start all 5 microservices concurrently AND the API gateway server. You'll see output from all services in your terminal. The gateway will be available on port 5000.

6. **Verify services are running**
   ```bash
   # Check individual services
   curl http://localhost:3001/health  # User service
   curl http://localhost:3002/health  # Patient service
   curl http://localhost:3003/health  # Clinical service
   # ... etc
   ```

**Option 2: Using Docker Compose (Recommended for Production)**

1. **Navigate to Backend-Microservices**
   ```bash
   cd Backend-Microservices
   ```

2. **Copy environment file**
   ```bash
   cp .env.example .env
   ```

3. **Update environment variables**
   Edit `.env` file with your configuration:
   - Database credentials
   - JWT secrets
   - Email configuration
   - Service URLs

4. **Start all services with Docker Compose**
   ```bash
   npm run start:docker
   # Or
   docker-compose up -d
   ```

   This will:
   - Start PostgreSQL database
   - Build and start all 5 microservices
   - Start Nginx API gateway
   - Set up networking between services

5. **Verify services are running**
   ```bash
   docker-compose ps
   ```

6. **View logs**
   ```bash
   npm run logs
   # Or
   docker-compose logs -f
   ```

7. **Stop all services**
   ```bash
   npm run stop:docker
   # Or
   docker-compose down
   ```

### Local Development (Manual Start)

If you prefer to start services individually:

1. **Install dependencies for each service**
   ```bash
   cd services/user && npm install
   cd ../out-patients-card-and-out-patient-record && npm install
   cd ../adult-walk-in-clinical-performa && npm install
   cd ../out-patient-intake-record && npm install
   cd ../prescription && npm install
   ```

2. **Set up PostgreSQL database**
   - Create database: `pgi_emrs`
   - Run migrations from the original backend

3. **Start each service in separate terminals**
   ```bash
   # Terminal 1
   cd services/user && npm run dev

   # Terminal 2
   cd services/out-patients-card-and-out-patient-record && npm run dev

   # Terminal 3
   cd services/adult-walk-in-clinical-performa && npm run dev

   # Terminal 4
   cd services/out-patient-intake-record && npm run dev

   # Terminal 5
   cd services/prescription && npm run dev
   ```

## Main Entry Point

### Option 1: Gateway Server (Recommended)

**Single Gateway Server that proxies all services:**

```bash
# First, start all services
npm start

# Then, in another terminal, start the gateway
npm run server
# or
node server.js
```

The gateway server runs on port **5000** and routes all requests:
- `http://localhost:5000/api/users` → User Service (3001)
- `http://localhost:5000/api/sessions` → User Service (3001) - Session management
- `http://localhost:5000/api/patients` → Out Patients Card and Record Service (3002)
- `http://localhost:5000/api/patient-cards` → Out Patients Card and Record Service (3002)
- `http://localhost:5000/api/patient-files` → Out Patients Card and Record Service (3002)
- `http://localhost:5000/api/out-patient-records` → Out Patients Card and Record Service (3002)
- `http://localhost:5000/api/clinical-proformas` → Adult Walk-in Clinical Proforma Service (3003)
- `http://localhost:5000/api/clinical-options` → Adult Walk-in Clinical Proforma Service (3003)
- `http://localhost:5000/api/outpatient-intake-records` → Out Patient Intake Record Service (3004)
- `http://localhost:5000/api/adl-files` → Out Patient Intake Record Service (3004) - Legacy route
- `http://localhost:5000/api/prescriptions` → Prescription Service (3005)

### Option 2: Direct Service Access

**Start all services individually:**

```bash
npm start
# or
node server.js
```

This starts all 5 microservices concurrently. Each service runs on its designated port:
- User Service: `http://localhost:3001`
- Out Patients Card and Out Patient Record Service: `http://localhost:3002`
- Adult Walk-in Clinical Proforma Service: `http://localhost:3003`
- Out Patient Intake Record Service: `http://localhost:3004`
- Prescription Service: `http://localhost:3005`

### Option 3: Docker Compose (Production)

```bash
npm run start:docker
# or
docker-compose up -d
```

## API Gateway

Nginx acts as the API gateway (when using Docker), routing requests to appropriate services:

- `http://localhost/api/users` → user
- `http://localhost/api/sessions` → user (session management)
- `http://localhost/api/patients` → out-patients-card-and-out-patient-record
- `http://localhost/api/patient-cards` → out-patients-card-and-out-patient-record
- `http://localhost/api/patient-files` → out-patients-card-and-out-patient-record
- `http://localhost/api/out-patient-records` → out-patients-card-and-out-patient-record
- `http://localhost/api/clinical-proformas` → adult-walk-in-clinical-performa
- `http://localhost/api/clinical-options` → adult-walk-in-clinical-performa
- `http://localhost/api/outpatient-intake-records` → out-patient-intake-record
- `http://localhost/api/adl-files` → out-patient-intake-record (legacy route)
- `http://localhost/api/prescriptions` → prescription

**Note:** When running with `npm start` (Node.js), you can access services directly on their ports (3001-3005) or set up Nginx separately.

## Service Communication

Services communicate via HTTP/REST APIs using internal service URLs:

- Services use service names (e.g., `http://patient-service:3002`) when running in Docker
- Services use `localhost` URLs when running locally
- All inter-service calls include the Authorization header for authentication

## Environment Variables

### Session Timing Configuration

**You can easily change session timing by updating environment variables in your `.env` file:**

| Variable | Description | Default | Format |
|----------|-------------|---------|--------|
| `SESSION_INACTIVITY_TIMEOUT_MS` | Time after which session expires if user is inactive | `900000` (15 minutes) | Milliseconds |
| `ACCESS_TOKEN_EXPIRATION_SECONDS` | Short-lived access token expiration | `300` (5 minutes) | Seconds |
| `REFRESH_TOKEN_EXPIRATION_MS` | Long-lived refresh token expiration (database) | `604800000` (7 days) | Milliseconds |
| `REFRESH_TOKEN_COOKIE_MAX_AGE_MS` | Refresh token cookie expiration | `604800000` (7 days) | Milliseconds |
| `JWT_ACCESS_TOKEN_EXPIRATION` | JWT access token expiration | `5m` | Format: `Xs`, `Xm`, `Xh`, `Xd` |
| `JWT_REFRESH_TOKEN_EXPIRATION` | JWT refresh token expiration | `7d` | Format: `Xs`, `Xm`, `Xh`, `Xd` |
| `OTP_EXPIRATION_MS` | OTP expiration time | `300000` (5 minutes) | Milliseconds |
| `OTP_EXPIRATION_SECONDS` | OTP expiration (for API responses) | `300` (5 minutes) | Seconds |
| `PASSWORD_RESET_TOKEN_EXPIRATION_MS` | Password reset token expiration | `900000` (15 minutes) | Milliseconds |

**Example `.env` configuration:**
```env
# Session timing - adjust as needed
SESSION_INACTIVITY_TIMEOUT_MS=1800000        # 30 minutes
ACCESS_TOKEN_EXPIRATION_SECONDS=600          # 10 minutes
REFRESH_TOKEN_EXPIRATION_MS=1209600000       # 14 days
REFRESH_TOKEN_COOKIE_MAX_AGE_MS=1209600000   # 14 days
JWT_ACCESS_TOKEN_EXPIRATION=10m              # 10 minutes
JWT_REFRESH_TOKEN_EXPIRATION=14d              # 14 days
OTP_EXPIRATION_MS=600000                      # 10 minutes
OTP_EXPIRATION_SECONDS=600                    # 10 minutes
PASSWORD_RESET_TOKEN_EXPIRATION_MS=1800000   # 30 minutes
```

**Important Notes:**
- `SESSION_INACTIVITY_TIMEOUT_MS` should be longer than `ACCESS_TOKEN_EXPIRATION_SECONDS` to allow token refresh before session expires
- JWT expiration formats: `'5m'` = 5 minutes, `'1h'` = 1 hour, `'7d'` = 7 days
- All timing values are in milliseconds except JWT expiration (uses format strings) and access token/OTP expiration (uses seconds for API responses)
- After changing these values, restart all services for changes to take effect

Each service requires the following environment variables:

### Common Variables
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_NAME` - Database name
- `DB_USER` - Database user
- `DB_PASSWORD` - Database password
- `CORS_ORIGIN` - Allowed CORS origins
- `NODE_ENV` - Environment (development/production)

### Service-Specific Variables
- `USER_SERVICE_PORT` - User service port (default: 3001)
- `OUT_PATIENTS_CARD_AND_RECORD_SERVICE_PORT` - Out Patients Card and Record service port (default: 3002)
- `ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_PORT` - Adult Walk-in Clinical Proforma service port (default: 3003)
- `OUT_PATIENT_INTAKE_RECORD_SERVICE_PORT` - Out Patient Intake Record service port (default: 3004)
- `PRESCRIPTION_SERVICE_PORT` - Prescription service port (default: 3005)

### JWT Configuration
- `JWT_SECRET` - Secret key for access tokens
- `JWT_REFRESH_SECRET` - Secret key for refresh tokens
- `JWT_EXPIRE` - Token expiration time

### Email Configuration
- `EMAIL_HOST` - SMTP server host
- `EMAIL_PORT` - SMTP server port
- `EMAIL_USER` - SMTP username
- `EMAIL_PASSWORD` - SMTP password
- `EMAIL_FROM` - From email address

## API Endpoints

### User Service (`/api/users`)
- `POST /api/users/register` - Register new user
- `POST /api/users/login` - User login
- `POST /api/users/verify-login-otp` - Verify login OTP
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update profile
- `GET /api/users` - Get all users (Admin)
- `GET /api/users/doctors` - Get all doctors

### Out Patients Card and Out Patient Record Service (`/api/patients`, `/api/patient-cards`, `/api/patient-files`, `/api/out-patient-records`)
- `POST /api/patients` - Register new patient
- `GET /api/patients` - Get all patients
- `GET /api/patients/:id` - Get patient by ID
- `PUT /api/patients/:id` - Update patient
- `GET /api/patients/search` - Search patients
- `GET /api/patients/stats` - Get patient statistics
- `POST /api/patient-files/create` - Upload patient files
- `PUT /api/patient-files/update/:patient_id` - Update patient files
- `GET /api/patient-files/:patient_id` - Get patient files
- `DELETE /api/patient-files/delete/:patient_id/:file_path` - Delete file

### Adult Walk-in Clinical Proforma Service (`/api/clinical-proformas`, `/api/clinical-options`)
- `POST /api/clinical-proformas` - Create clinical proforma
- `GET /api/clinical-proformas` - Get all proformas
- `GET /api/clinical-proformas/:id` - Get proforma by ID
- `PUT /api/clinical-proformas/:id` - Update proforma
- `GET /api/clinical-proformas/patient/:patient_id` - Get proformas by patient
- `GET /api/clinical-options/:group` - Get options for a group
- `POST /api/clinical-options/:group` - Add option to group
- `DELETE /api/clinical-options/:group` - Delete option from group

### Out Patient Intake Record Service (`/api/outpatient-intake-records`, `/api/adl-files`)
- `POST /api/outpatient-intake-records` - Create intake record
- `GET /api/outpatient-intake-records` - Get all intake records
- `GET /api/outpatient-intake-records/:id` - Get intake record by ID
- `PUT /api/outpatient-intake-records/:id` - Update intake record
- `GET /api/outpatient-intake-records/patient/:patient_id` - Get intake records by patient
- `POST /api/adl-files` - Create ADL file (legacy route)
- `GET /api/adl-files` - Get all ADL files (legacy route)
- `GET /api/adl-files/:id` - Get ADL file by ID (legacy route)
- `PUT /api/adl-files/:id` - Update ADL file (legacy route)
- `GET /api/adl-files/patient/:patient_id` - Get ADL files by patient (legacy route)

### Prescription Service (`/api/prescriptions`)
- `POST /api/prescriptions` - Create prescription
- `GET /api/prescriptions` - Get all prescriptions
- `GET /api/prescriptions/:id` - Get prescription by ID
- `PUT /api/prescriptions/:id` - Update prescription
- `DELETE /api/prescriptions/:id` - Delete prescription

### Session Management (`/api/sessions`) - Part of User Service
- `POST /api/sessions` - Create session/visit
- `GET /api/sessions/patient/:patient_id` - Get patient sessions
- `POST /api/sessions/patient/:patient_id/complete` - Complete session

## Database Schema

The database schema remains the same as the monolithic backend. All services share the same PostgreSQL database but access different tables:

- `users` - User service
- `registered_patient` - Out Patients Card and Out Patient Record service
- `patient_files` - Out Patients Card and Out Patient Record service
- `clinical_proforma` - Adult Walk-in Clinical Proforma service
- `clinical_options` - Adult Walk-in Clinical Proforma service
- `adl_files` - Out Patient Intake Record service
- `prescriptions` - Prescription service
- `patient_visits` - User service (session management)
- `refresh_tokens` - User service
- `login_otps` - User service
- `password_reset_tokens` - User service

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Authorization**: Granular permission system
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Comprehensive data validation
- **SQL Injection Protection**: Parameterized queries
- **CORS Configuration**: Controlled cross-origin access
- **Helmet Security**: HTTP security headers
- **File Upload Validation**: Type and size restrictions

## Development

### Running Services Locally

1. **Install dependencies for common modules**
   ```bash
   cd common
   npm install  # If common has its own package.json
   ```

2. **Start each service**
   ```bash
   # Service 1
   cd services/user
   npm install
   npm run dev

   # Service 2 (new terminal)
   cd services/out-patients-card-and-out-patient-record
   npm install
   npm run dev

   # Service 3 (new terminal)
   cd services/adult-walk-in-clinical-performa
   npm install
   npm run dev

   # Service 4 (new terminal)
   cd services/out-patient-intake-record
   npm install
   npm run dev

   # Service 5 (new terminal)
   cd services/prescription
   npm install
   npm run dev
   ```

### Testing

Each service can be tested independently:

```bash
cd services/user
npm test
```

### Logging

- Each service logs to console
- Logs are also written to files in `logs/` directory
- Use centralized logging in production (e.g., ELK stack)

## Deployment

### Production Considerations

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use strong JWT secrets
   - Configure proper CORS origins
   - Set up SSL/TLS certificates

2. **Database**
   - Use connection pooling
   - Set up read replicas if needed
   - Configure backup strategies

3. **Services**
   - Use process managers (PM2) or container orchestration (Kubernetes)
   - Set up health checks
   - Configure auto-scaling
   - Monitor service health

4. **API Gateway**
   - Configure SSL/TLS
   - Set up rate limiting
   - Configure load balancing
   - Set up monitoring

## Monitoring

Each service exposes a `/health` endpoint for health checks:

```bash
curl http://localhost:3001/health
```

Response:
```json
{
  "success": true,
  "service": "user",
  "status": "running",
  "database": "connected",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### Service won't start
- Check database connection
- Verify environment variables
- Check service logs: `docker-compose logs <service-name>`

### Database connection errors
- Ensure PostgreSQL is running
- Verify database credentials
- Check network connectivity

### Inter-service communication fails
- Verify service URLs in environment variables
- Check service health endpoints
- Ensure services are on the same network (Docker)

## Migration from Monolithic Backend

The microservices architecture maintains API compatibility with the original monolithic backend. The frontend should work without changes when using the Nginx API gateway.

## Contributing

1. Create a feature branch
2. Make changes to the relevant service(s)
3. Test the service(s) independently
4. Update documentation
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Email: support@pgimer.ac.in
- Documentation: See individual service READMEs

