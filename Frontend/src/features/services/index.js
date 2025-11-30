/**
 * Services API Slices Index
 * Central export point for all microservice API slices
 * Matches the backend microservices architecture exactly
 */

// user-service (Port 3001)
export * from './userServiceApiSlice';

// out-patients-card-and-out-patient-record-service (Port 3002)
export * from './patientCardAndRecordServiceApiSlice';

// adult-walk-in-clinical-performa-service (Port 3003)
export * from './clinicalPerformaServiceApiSlice';

// out-patient-intake-record-service (Port 3004)
export * from './intakeRecordServiceApiSlice';

// prescription-service (Port 3005)
export * from './prescriptionServiceApiSlice';

