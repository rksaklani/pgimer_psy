# Frontend Services - Exact Backend Match

The frontend now uses **exact same service names** as the backend microservices.

## Service Mapping

| Frontend API Slice | Backend Service | Port | Status |
|-------------------|-----------------|------|--------|
| `userServiceApiSlice.js` | `user-service` | 3001 | ✅ Active |
| `patientCardAndRecordServiceApiSlice.js` | `out-patients-card-and-out-patient-record-service` | 3002 | ✅ Active |
| `clinicalPerformaServiceApiSlice.js` | `adult-walk-in-clinical-performa-service` | 3003 | ✅ Active |
| `intakeRecordServiceApiSlice.js` | `out-patient-intake-record-service` | 3004 | ✅ Active |
| `prescriptionServiceApiSlice.js` | `prescription-service` | 3005 | ✅ Active |

## Old Code Removed

All old API slice files have been **deleted**:
- ❌ `features/auth/authApiSlice.js` - DELETED
- ❌ `features/users/usersApiSlice.js` - DELETED
- ❌ `features/patients/patientsApiSlice.js` - DELETED
- ❌ `features/patients/patientCardsApiSlice.js` - DELETED
- ❌ `features/patients/patientRecordsApiSlice.js` - DELETED
- ❌ `features/patients/patientFilesApiSlice.js` - DELETED
- ❌ `features/clinical/clinicalApiSlice.js` - DELETED
- ❌ `features/adl/adlApiSlice.js` - DELETED
- ❌ `features/prescriptions/prescriptionApiSlice.js` - DELETED

## Current Structure

```
Frontend/src/features/
├── services/                          # ✅ Service-based API slices
│   ├── userServiceApiSlice.js        # user-service
│   ├── patientCardAndRecordServiceApiSlice.js  # out-patients-card-and-out-patient-record-service
│   ├── clinicalPerformaServiceApiSlice.js     # adult-walk-in-clinical-performa-service
│   ├── intakeRecordServiceApiSlice.js         # out-patient-intake-record-service
│   ├── prescriptionServiceApiSlice.js         # prescription-service
│   └── index.js                      # Central export
├── auth/                              # Redux state only
│   └── authSlice.js
└── form/                              # Redux state only
    └── formSlice.js
```

## Usage

Import from the services folder:

```javascript
// ✅ Correct - Use service API slices
import { 
  useLoginMutation,
  useGetAllUsersQuery 
} from '../../features/services/userServiceApiSlice';

import { 
  useGetAllPatientRecordsQuery,
  useCreatePatientRecordMutation 
} from '../../features/services/patientCardAndRecordServiceApiSlice';

// Or use the index for convenience
import { 
  useLoginMutation,
  useGetAllPatientRecordsQuery 
} from '../../features/services';
```

## Next Steps

31 components still need to be updated to use the new service API slices. See `MIGRATION_CHECKLIST.md` for details.

