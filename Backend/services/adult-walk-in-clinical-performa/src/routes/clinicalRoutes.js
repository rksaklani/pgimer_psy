const express = require('express');
const router = express.Router();
const ClinicalController = require('../controllers/clinicalController');
const { authenticateToken, requireDoctor, requireAdmin, authorizeRoles } = require('../../../../common/middleware/auth');
const { validateClinicalProforma, validateId, validatePagination } = require('../middleware/validation');

// Clinical proforma routes
router.post('/', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateClinicalProforma, ClinicalController.createClinicalProforma);
router.get('/my-proformas', authenticateToken, requireDoctor, validatePagination, ClinicalController.getMyProformas);
router.get('/complex-cases', authenticateToken, validatePagination, ClinicalController.getComplexCases);
router.get('/', authenticateToken, validatePagination, ClinicalController.getAllClinicalProformas);
router.get('/stats', authenticateToken, requireAdmin, ClinicalController.getClinicalStats);
router.get('/decision-stats', authenticateToken, ClinicalController.getCasesByDecision);
router.get('/visit-trends', authenticateToken, ClinicalController.getVisitTrends);
router.get('/:id', authenticateToken, validateId, ClinicalController.getClinicalProformaById);
router.put('/:id', authenticateToken, validateId, ClinicalController.updateClinicalProforma);
router.delete('/:id', authenticateToken, validateId, ClinicalController.deleteClinicalProforma);
router.get('/patient/:patient_id', authenticateToken, ClinicalController.getClinicalProformaByPatientId);

module.exports = router;

