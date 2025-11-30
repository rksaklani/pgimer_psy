const express = require('express');
const router = express.Router();
const ADLController = require('../controllers/adlController');
const { authenticateToken, requireDoctor, requireAdmin } = require('../../../../common/middleware/auth');
const { validateId, validatePagination } = require('../middleware/validation');

// ADL file routes
router.get('/', authenticateToken, validatePagination, ADLController.getAllADLFiles);
router.post('/', authenticateToken, ADLController.createADLFile);
router.get('/stats', authenticateToken, requireAdmin, ADLController.getADLStats);
router.get('/status-stats', authenticateToken, ADLController.getFilesByStatus);
router.get('/active', authenticateToken, ADLController.getActiveFiles);
router.get('/:id', authenticateToken, validateId, ADLController.getADLFileById);
router.put('/:id', authenticateToken, validateId, ADLController.updateADLFile);
router.delete('/:id', authenticateToken, validateId, ADLController.deleteADLFile);
router.get('/patient/:patient_id', authenticateToken, ADLController.getADLFilesByPatientId);

module.exports = router;

