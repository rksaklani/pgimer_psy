# Frontend Microservices Migration Checklist

This checklist helps track the migration from old API slices to the new service-based structure.

## ✅ Completed

- [x] Created service-based API slices matching backend microservices exactly
- [x] Updated base API configuration to use gateway (port 5000)
- [x] Created documentation for new structure
- [x] Updated tag types in apiSlice
- [x] **DELETED all old API slice files** (authApiSlice, usersApiSlice, patientsApiSlice, etc.)
- [x] Updated service names to match backend exactly

## 🔄 In Progress

- [ ] Update components to use new service API slices (31 files need updating)

## 📋 Components to Update

### Authentication & User Management
- [ ] `src/pages/Login.jsx` - Use `userServiceApiSlice`
- [ ] `src/pages/Profile.jsx` - Use `userServiceApiSlice`
- [ ] `src/pages/users/*` - Use `userServiceApiSlice`

### Patient Management
- [ ] `src/pages/patients/PatientsPage.jsx` - Use `patientCardAndRecordServiceApiSlice`
- [ ] `src/pages/patients/CreatePatient.jsx` - Use `patientCardAndRecordServiceApiSlice`
- [ ] `src/pages/patients/PatientDetails.jsx` - Use `patientCardAndRecordServiceApiSlice`
- [ ] `src/pages/patients/PatientDetailsView.jsx` - Use `patientCardAndRecordServiceApiSlice`
- [ ] `src/pages/patients/PatientDetailsEdit.jsx` - Use `patientCardAndRecordServiceApiSlice`
- [ ] `src/pages/patients/SelectExistingPatient.jsx` - Use `patientCardAndRecordServiceApiSlice`

### Clinical Proformas
- [ ] `src/pages/clinical/*` - Use `clinicalPerformaServiceApiSlice`

### Intake Records (ADL)
- [ ] `src/pages/adl/*` - Use `intakeRecordServiceApiSlice`

### Prescriptions
- [ ] `src/pages/PrescribeMedication/*` - Use `prescriptionServiceApiSlice`

### Dashboard
- [ ] `src/pages/Dashboard.jsx` - Update to use new service slices

## Migration Pattern

### Example: Updating Patient Components

**Before:**
```javascript
import { 
  useGetAllPatientsQuery,
  useGetPatientByIdQuery 
} from '../../features/patients/patientsApiSlice';
```

**After:**
```javascript
import { 
  useGetAllPatientRecordsQuery,
  useGetPatientRecordByIdQuery 
} from '../../features/services/patientCardAndRecordServiceApiSlice';
```

### Example: Updating Auth Components

**Before:**
```javascript
import { useLoginMutation } from '../../features/auth/authApiSlice';
```

**After:**
```javascript
import { useLoginMutation } from '../../features/services/userServiceApiSlice';
```

## Notes

- Old API slices are kept for backward compatibility during migration
- All new code should use the service-based API slices
- The old slices can be removed once all components are migrated
- Test each component after migration to ensure functionality

