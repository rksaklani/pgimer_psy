const express = require('express');
const router = express.Router();
const PrescriptionController = require('../controllers/prescriptionController');
const { authenticateToken, authorizeRoles } = require('../../../../common/middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

// Prescription routes
router.post('/', authenticateToken, authorizeRoles('Faculty', 'Resident', 'Admin'), PrescriptionController.createPrescription);
router.get('/', authenticateToken, authorizeRoles('Faculty', 'Resident', 'Admin'), validatePagination, PrescriptionController.getAllPrescriptions);
router.get('/by-proforma/:clinical_proforma_id', authenticateToken, PrescriptionController.getPrescriptionByProformaId);
router.get('/:id', authenticateToken, PrescriptionController.getPrescriptionById);
router.put('/:id', authenticateToken, authorizeRoles('Faculty', 'Resident', 'Admin'), validateId, PrescriptionController.updatePrescription);
router.delete('/:id', authenticateToken, authorizeRoles('Faculty', 'Resident', 'Admin'), validateId, PrescriptionController.deletePrescription);

module.exports = router;

