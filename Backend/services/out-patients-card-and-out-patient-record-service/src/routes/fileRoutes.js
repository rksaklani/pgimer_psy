const express = require('express');
const router = express.Router();
const FileController = require('../controllers/fileController');
const { authenticateToken, authorizeRoles } = require('../../../../common/middleware/auth');
const { validateId } = require('../middleware/validation');
const { handleUpload } = require('../middleware/upload');

// Patient file routes (Out Patient Records)
router.post('/create', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), handleUpload, FileController.createPatientFiles);
router.put('/update/:patient_id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, handleUpload, FileController.updatePatientFiles);
router.get('/:patient_id', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, FileController.getPatientFiles);
router.delete('/delete/:patient_id/:file_path', authenticateToken, authorizeRoles('Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident'), validateId, FileController.deletePatientFile);
router.get('/stats', authenticateToken, authorizeRoles('Admin'), FileController.getFileStats);

module.exports = router;

