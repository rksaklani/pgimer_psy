const express = require('express');
const router = express.Router();
const OutPatientRecordController = require('../controllers/outPatientRecordController');
const { authenticateToken, authorizeRoles } = require('../../../../common/middleware/auth');
const { validateId, validateCRNo, validatePatientRecord, validatePagination } = require('../middleware/validation');

/**
 * Out Patient Record Routes
 * Base path: /api/out-patient-records
 */

// Create patient record
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePatientRecord,
  OutPatientRecordController.createRecord
);

// Get all patient records with pagination and filters
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePagination,
  OutPatientRecordController.getAllRecords
);

// Get patient record by ID
router.get(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.getRecordById
);

// Get patient record by CR No
router.get(
  '/cr/:cr_no',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateCRNo,
  OutPatientRecordController.getRecordByCRNo
);

// Update patient record
router.put(
  '/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.updateRecord
);

// Get patient record profile with related data
router.get(
  '/:id/profile',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.getRecordProfile
);

// Get patient visit count
router.get(
  '/:id/visits/count',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.getVisitCount
);

// Get patient visit history
router.get(
  '/:id/visits',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.getVisitHistory
);

// Get patient clinical records
router.get(
  '/:id/clinical-records',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.getClinicalRecords
);

// Get patient intake records
router.get(
  '/:id/intake-records',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  OutPatientRecordController.getIntakeRecords
);

// Assign patient to doctor
router.post(
  '/assign',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  OutPatientRecordController.assignPatient
);

module.exports = router;

