const express = require('express');
const router = express.Router();
const PatientCardAndRecordController = require('../controllers/patientCardAndRecordController');
const { authenticateToken, authorizeRoles } = require('../../../../common/middleware/auth');
const { validateId, validateCRNo, validatePatientCard, validatePatientRecord, validatePagination } = require('../middleware/validation');

/**
 * Unified Patient Card and Record Routes
 * Base paths:
 *   - /api/patient-cards (for creating cards)
 *   - /api/patient-records (for creating records)
 *   - /api/patients (for unified view/update/delete operations)
 */

// ============================================================================
// CREATE OPERATIONS (Separate - Card first, then Record)
// ============================================================================

// Create patient card (Step 1)
router.post(
  '/patient-cards',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePatientCard,
  PatientCardAndRecordController.createCard
);

// Create patient record (Step 2 - requires card to exist)
router.post(
  '/patient-records',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePatientRecord,
  PatientCardAndRecordController.createRecord
);

// ============================================================================
// READ OPERATIONS (Unified - works with both card and record)
// ============================================================================

// Get all patients (unified - returns both card and record data)
router.get(
  '/patients',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePagination,
  PatientCardAndRecordController.getAll
);

// Get patient by CR No (unified)
router.get(
  '/patients/cr/:cr_no',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateCRNo,
  PatientCardAndRecordController.getByCRNo
);

// Get patient by Record ID (unified)
router.get(
  '/patients/:id',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  PatientCardAndRecordController.getById
);

// Get patient profile with related data
router.get(
  '/patients/:id/profile',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateId,
  PatientCardAndRecordController.getProfile
);

// ============================================================================
// UPDATE OPERATIONS (Unified - updates both card and record)
// ============================================================================

// Update patient by CR No (unified - updates both card and record)
router.put(
  '/patients/cr/:cr_no',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateCRNo,
  PatientCardAndRecordController.updateByCRNo
);

// ============================================================================
// DELETE OPERATIONS (Unified - deletes both card and record with cascade)
// ============================================================================

// Delete patient by CR No (unified - deletes both card and record)
router.delete(
  '/patients/cr/:cr_no',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateCRNo,
  PatientCardAndRecordController.deleteByCRNo
);

// ============================================================================
// ADDITIONAL OPERATIONS
// ============================================================================

// Assign patient to doctor
router.post(
  '/patients/assign',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  PatientCardAndRecordController.assignPatient
);

module.exports = router;

