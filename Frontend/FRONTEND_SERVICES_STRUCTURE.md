# Frontend Services Structure

This document describes the frontend structure that matches the backend microservices architecture.

## Service-Based API Slices

The frontend is organized to match the backend microservices structure:

### 1. user-service (`features/services/userServiceApiSlice.js`)
**Backend Service**: `Backend-Microservices/services/user-service`  
**Port**: 3001  
**Handles**:
- User authentication (login, register, OTP)
- User profile management
- User CRUD operations (Admin)
- 2FA management
- Authentication session management (refresh, logout, activity)
- Patient visit sessions

**Key Endpoints**:
- `/api/users/*` - User management
- `/api/session/*` - Authentication sessions
- `/api/sessions/*` - Patient visit sessions

### 2. out-patients-card-and-out-patient-record-service (`features/services/patientCardAndRecordServiceApiSlice.js`)
**Backend Service**: `Backend-Microservices/services/out-patients-card-and-out-patient-record-service`  
**Port**: 3002  
**Handles**:
- Patient Cards (OutPatientsCard) - Demographic and registration data
- Patient Records (OutPatientRecord) - Extended patient details
- Patient Files - File uploads and management

**Key Endpoints**:
- `/api/patient-cards/*` - Patient card operations
- `/api/out-patient-records/*` - Patient record operations
- `/api/patient-files/*` - File operations

### 3. adult-walk-in-clinical-performa-service (`features/services/clinicalPerformaServiceApiSlice.js`)
**Backend Service**: `Backend-Microservices/services/adult-walk-in-clinical-performa-service`  
**Port**: 3003  
**Handles**:
- Clinical Proformas
- Clinical Options (dynamic dropdown options)

**Key Endpoints**:
- `/api/clinical-proformas/*` - Clinical proforma operations
- `/api/clinical-options/*` - Clinical options management

### 4. out-patient-intake-record-service (`features/services/intakeRecordServiceApiSlice.js`)
**Backend Service**: `Backend-Microservices/services/out-patient-intake-record-service`  
**Port**: 3004  
**Handles**:
- Outpatient Intake Records (formerly ADL Files)

**Key Endpoints**:
- `/api/outpatient-intake-records/*` - Intake record operations

### 5. prescription-service (`features/services/prescriptionServiceApiSlice.js`)
**Backend Service**: `Backend-Microservices/services/prescription-service`  
**Port**: 3005  
**Handles**:
- Prescriptions

**Key Endpoints**:
- `/api/prescriptions/*` - Prescription operations

## Migration Guide

### Old API Slices (DELETED)
The following old API slices have been **removed**. All components must now use the new service-based API slices:

- ❌ `features/auth/authApiSlice.js` → ✅ Use `features/services/userServiceApiSlice.js`
- ❌ `features/users/usersApiSlice.js` → ✅ Use `features/services/userServiceApiSlice.js`
- ❌ `features/patients/patientsApiSlice.js` → ✅ Use `features/services/patientCardAndRecordServiceApiSlice.js`
- ❌ `features/patients/patientCardsApiSlice.js` → ✅ Use `features/services/patientCardAndRecordServiceApiSlice.js`
- ❌ `features/patients/patientRecordsApiSlice.js` → ✅ Use `features/services/patientCardAndRecordServiceApiSlice.js`
- ❌ `features/patients/patientFilesApiSlice.js` → ✅ Use `features/services/patientCardAndRecordServiceApiSlice.js`
- ❌ `features/clinical/clinicalApiSlice.js` → ✅ Use `features/services/clinicalPerformaServiceApiSlice.js`
- ❌ `features/adl/adlApiSlice.js` → ✅ Use `features/services/intakeRecordServiceApiSlice.js`
- ❌ `features/prescriptions/prescriptionApiSlice.js` → ✅ Use `features/services/prescriptionServiceApiSlice.js`

### Import Examples

#### Before (Old Structure):
```javascript
import { useGetAllPatientsQuery } from '../../features/patients/patientsApiSlice';
import { useLoginMutation } from '../../features/auth/authApiSlice';
import { useGetAllADLFilesQuery } from '../../features/adl/adlApiSlice';
```

#### After (New Structure):
```javascript
import { useGetAllPatientRecordsQuery } from '../../features/services/patientCardAndRecordServiceApiSlice';
import { useLoginMutation } from '../../features/services/userServiceApiSlice';
import { useGetAllIntakeRecordsQuery } from '../../features/services/intakeRecordServiceApiSlice';
```

## API Gateway

All API calls go through the API Gateway at `http://localhost:5000/api` which routes requests to the appropriate microservice.

## Benefits

1. **Clear Service Boundaries**: Each API slice matches exactly one backend service
2. **Easier Maintenance**: Changes to a backend service only affect one frontend API slice
3. **Better Organization**: Code is organized by service, making it easier to understand the architecture
4. **Scalability**: Easy to add new services or split existing ones
5. **Type Safety**: Clear separation makes it easier to add TypeScript types per service

## File Structure

```
Frontend/src/features/
├── services/                          # Service-based API slices (matches backend exactly)
│   ├── userServiceApiSlice.js        # user-service (Port 3001)
│   ├── patientCardAndRecordServiceApiSlice.js  # out-patients-card-and-out-patient-record-service (Port 3002)
│   ├── clinicalPerformaServiceApiSlice.js     # adult-walk-in-clinical-performa-service (Port 3003)
│   ├── intakeRecordServiceApiSlice.js         # out-patient-intake-record-service (Port 3004)
│   ├── prescriptionServiceApiSlice.js         # prescription-service (Port 3005)
│   └── index.js                      # Central export point
├── auth/                              # Only authSlice.js (Redux state)
│   └── authSlice.js
└── form/                              # Only formSlice.js (Redux state)
    └── formSlice.js
```

