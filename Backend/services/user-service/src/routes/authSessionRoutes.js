const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');

/**
 * Authentication Session Routes
 * Handles refresh token, logout, activity, and session info
 * These routes don't require authentication (they use refresh token from cookie)
 */
router.post('/refresh', UserController.refreshToken);
router.post('/refresh-token', UserController.refreshToken); // Alias
router.post('/logout', UserController.logout);
router.post('/activity', UserController.updateActivity);
router.get('/info', UserController.getSessionInfo);

module.exports = router;

