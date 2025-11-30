const express = require('express');
const router = express.Router();
const PatientController = require('../controllers/patientController');
const { authenticateToken, requireMWOOrDoctor, requireAdmin, authorizeRoles } = require('../../../../common/middleware/auth');
const { validatePatient, validatePatientRegistration, validateId, validatePagination } = require('../middleware/validation');

// Patient routes (Patient Cards)
router.post('/', authenticateToken, requireMWOOrDoctor, validatePatient, PatientController.createPatient);
router.post('/register-complete', authenticateToken, authorizeRoles('Psychiatric Welfare Officer', 'Faculty', 'Resident', 'Admin'), validatePatientRegistration, PatientController.registerPatientWithDetails);
router.get('/', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validatePagination, PatientController.getAllPatients);
router.get('/search', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.searchPatients);
router.get('/stats', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientStats);
router.get('/age-distribution', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getAgeDistribution);
router.get('/:id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientById);
router.get('/:id/visits/count', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientVisitCount);
router.put('/:id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.updatePatient);
router.post('/:id/visits/complete', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.markVisitCompleted);
router.delete('/:id', authenticateToken, requireAdmin, validateId, PatientController.deletePatient);
router.get('/:id/profile', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientProfile);
router.get('/:id/visits', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientVisitHistory);
router.get('/:id/clinical-records', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientClinicalRecords);
router.get('/:id/outpatient-intake-records', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, PatientController.getPatientADLFiles);
router.post('/assign', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.assignPatient);
router.get('/cr/:cr_no', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientByCRNo);
router.get('/psy/:psy_no', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), PatientController.getPatientByPSYNo);
router.get('/adl/:adl_no', authenticateToken, PatientController.getPatientByADLNo);
router.get('/outpatient-intake-record/:outpatient_intake_record_no', authenticateToken, PatientController.getPatientByADLNo); // New route

module.exports = router;

