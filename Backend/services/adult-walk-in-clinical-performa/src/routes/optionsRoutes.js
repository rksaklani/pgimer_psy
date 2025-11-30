const express = require('express');
const router = express.Router();
const OptionsController = require('../controllers/optionsController');
const { authenticateToken } = require('../../../../common/middleware/auth');

// Clinical options routes
router.get('/:group', authenticateToken, OptionsController.getGroup);
router.post('/:group', authenticateToken, OptionsController.addOption);
router.delete('/:group', authenticateToken, OptionsController.deleteOption);

module.exports = router;

