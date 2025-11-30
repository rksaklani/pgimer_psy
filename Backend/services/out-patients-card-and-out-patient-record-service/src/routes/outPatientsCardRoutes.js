const express = require('express');
const router = express.Router();
const OutPatientsCardController = require('../controllers/outPatientsCardController');
const { authenticateToken, authorizeRoles } = require('../../../../common/middleware/auth');
const { validateId, validateCRNo, validatePatientCard, validatePagination } = require('../middleware/validation');

/**
 * Out Patients Card Routes
 * Base path: /api/patient-cards
 */

// Create patient card
router.post(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePatientCard,
  OutPatientsCardController.createCard
);

// Get all patient cards with pagination and filters
router.get(
  '/',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validatePagination,
  OutPatientsCardController.getAllCards
);

// Get patient card by CR No
router.get(
  '/cr/:cr_no',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  validateCRNo,
  OutPatientsCardController.getCardByCRNo
);

// Update patient card
router.put(
  '/:cr_no',
  authenticateToken,
  authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'),
  OutPatientsCardController.updateCard
);

module.exports = router;

