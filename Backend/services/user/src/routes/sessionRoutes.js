const express = require('express');
const router = express.Router();
const SessionController = require('../controllers/sessionController');
const { authenticateToken } = require('../../../../common/middleware/auth');
const { validateId, validatePatientId } = require('../middleware/validation');

// Session routes
router.post('/', authenticateToken, SessionController.createSession);
router.get('/patient/:patient_id', authenticateToken, validatePatientId, SessionController.getPatientSessions);
router.post('/patient/:patient_id/complete', authenticateToken, validatePatientId, SessionController.completeSession);
router.get('/:id', authenticateToken, validateId, SessionController.getSessionById);
router.put('/:id', authenticateToken, validateId, SessionController.updateSession);
router.delete('/:id', authenticateToken, validateId, SessionController.deleteSession);

module.exports = router;

