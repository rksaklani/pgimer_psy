# Frontend Microservices Migration Guide

## Overview

The frontend has been updated to use the new microservices architecture. All API calls now go through the API Gateway (port 5000) which routes requests to the appropriate microservice.

## Configuration Changes

### 1. Base API URL
- **Old**: `http://31.97.60.2:2025/api` or `http://localhost:2025/api`
- **New**: `http://localhost:5000/api` (Microservices Gateway)

### 2. Vite Proxy Configuration
- **Updated**: `vite.config.js` now proxies to the gateway at `http://localhost:5000`
- **Environment Variable**: `VITE_API_GATEWAY_URL` can be set to override default

## New API Slices

### Patient Cards API (`patientCardsApiSlice.js`)
Handles operations for `OutPatientsCard` (patient demographic + registration data):

- `useGetAllPatientCardsQuery` - Get all patient cards
- `useGetPatientCardByCRNoQuery` - Get card by CR No
- `useCreatePatientCardMutation` - Create new card
- `useUpdatePatientCardMutation` - Update card

**Endpoints:**
- `GET /api/patient-cards` - List all cards
- `GET /api/patient-cards/cr/:cr_no` - Get by CR No
- `POST /api/patient-cards` - Create card
- `PUT /api/patient-cards/:cr_no` - Update card

### Patient Records API (`patientRecordsApiSlice.js`)
Handles operations for `OutPatientRecord` (extended patient details):

- `useGetAllPatientRecordsQuery` - Get all records
- `useGetPatientRecordByIdQuery` - Get by ID
- `useGetPatientRecordByCRNoQuery` - Get by CR No
- `useCreatePatientRecordMutation` - Create record
- `useUpdatePatientRecordMutation` - Update record
- `useGetPatientRecordProfileQuery` - Get profile with related data
- `useGetPatientVisitCountQuery` - Get visit count
- `useGetPatientVisitHistoryQuery` - Get visit history
- `useGetPatientClinicalRecordsQuery` - Get clinical records
- `useGetPatientIntakeRecordsQuery` - Get intake records
- `useAssignPatientMutation` - Assign to doctor
- `useMarkVisitCompletedMutation` - Mark visit completed

**Endpoints:**
- `GET /api/out-patient-records` - List all records
- `GET /api/out-patient-records/:id` - Get by ID
- `GET /api/out-patient-records/cr/:cr_no` - Get by CR No
- `POST /api/out-patient-records` - Create record
- `PUT /api/out-patient-records/:id` - Update record
- `GET /api/out-patient-records/:id/profile` - Get profile
- `GET /api/out-patient-records/:id/visits/count` - Get visit count
- `GET /api/out-patient-records/:id/visits` - Get visit history
- `GET /api/out-patient-records/:id/clinical-records` - Get clinical records
- `GET /api/out-patient-records/:id/intake-records` - Get intake records
- `POST /api/out-patient-records/assign` - Assign patient

## Updated API Slices

### ADL API Slice (`adlApiSlice.js`)
- **Updated**: All endpoints now use `/outpatient-intake-records` instead of `/adl-files`
- **Endpoints:**
  - `GET /api/outpatient-intake-records` - List all intake records
  - `GET /api/outpatient-intake-records/:id` - Get by ID
  - `GET /api/outpatient-intake-records/patient/:patientId` - Get by patient ID
  - `POST /api/outpatient-intake-records` - Create intake record
  - `PUT /api/outpatient-intake-records/:id` - Update intake record

### Auth API Slice (`authApiSlice.js`)
- **Updated**: Session endpoints now use `/sessions` instead of `/session`
- **Endpoints:**
  - `POST /api/sessions/refresh` - Refresh token
  - `POST /api/sessions/activity` - Update activity
  - `POST /api/sessions/logout` - Logout
  - `GET /api/sessions/info` - Get session info

## Microservices Architecture

All API calls are routed through the Gateway (port 5000):

```
Frontend (Port 8001)
    ↓
API Gateway (Port 5000)
    ↓
┌─────────────────────────────────────────┐
│  Microservices:                         │
│  - user-service (3001)                  │
│  - out-patients-card-and-out-patient-   │
│    record-service (3002)                 │
│  - adult-walk-in-clinical-performa-     │
│    service (3003)                        │
│  - out-patient-intake-record-service    │
│    (3004)                                │
│  - prescription-service (3005)          │
└─────────────────────────────────────────┘
```

## Environment Variables

Create a `.env` file in the Frontend directory:

```env
# API Gateway URL (default: http://localhost:5000)
VITE_API_URL=http://localhost:5000/api
VITE_API_GATEWAY_URL=http://localhost:5000
```

## Migration Steps for Components

### Before (Old Patient API):
```javascript
import { useGetPatientByIdQuery } from '../features/patients/patientsApiSlice';

const { data } = useGetPatientByIdQuery(patientId);
```

### After (New Patient Record API):
```javascript
import { useGetPatientRecordByIdQuery } from '../features/patients/patientRecordsApiSlice';

const { data } = useGetPatientRecordByIdQuery(patientId);
```

## Backward Compatibility

The old `patientsApiSlice.js` is still available for backward compatibility, but new code should use:
- `patientCardsApiSlice.js` for patient card operations
- `patientRecordsApiSlice.js` for patient record operations

## Testing

1. Start all microservices:
   ```bash
   cd Backend-Microservices
   npm start
   ```

2. Start the frontend:
   ```bash
   cd Frontend
   npm run dev
   ```

3. Verify API calls are going through the gateway by checking the network tab in browser dev tools.

## Notes

- All API calls automatically include authentication tokens
- Session management is handled automatically
- The gateway handles routing to the correct microservice
- Error handling and token refresh work seamlessly through the gateway

