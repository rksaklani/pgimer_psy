/**
 * Services API Slices Index
 * Central export point for all microservice API slices
 * Matches the backend microservices architecture exactly
 */

// user (Port 3001)
export * from './userServiceApiSlice';

// out-patients-card-and-out-patient-record (Port 3002)
export * from './patientCardAndRecordServiceApiSlice';

// adult-walk-in-clinical-performa (Port 3003)
export * from './clinicalPerformaServiceApiSlice';

// out-patient-intake-record (Port 3004)
export * from './intakeRecordServiceApiSlice';

// prescription (Port 3005)
export * from './prescriptionServiceApiSlice';

