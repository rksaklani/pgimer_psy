const express = require('express');
const router = express.Router();
const UserController = require('../controllers/userController');
const { authenticateToken, requireAdmin } = require('../../../../common/middleware/auth');
const { validateUserRegistration, validateUserLogin, validateId, validatePagination } = require('../middleware/validation');

// Public routes
router.post('/register', validateUserRegistration, UserController.register);
router.post('/login', validateUserLogin, UserController.login);
router.post('/verify-login-otp', UserController.verifyLoginOTP);
router.post('/forgot-password', UserController.forgotPassword);
router.post('/verify-otp', UserController.verifyOTP);
router.post('/reset-password', UserController.resetPassword);

// Protected routes
router.get('/profile', authenticateToken, UserController.getProfile);
router.put('/profile', authenticateToken, UserController.updateProfile);
router.put('/change-password', authenticateToken, UserController.changePassword);
router.post('/enable-2fa', authenticateToken, UserController.enable2FA);
router.post('/disable-2fa', authenticateToken, UserController.disable2FA);
router.get('/doctors', authenticateToken, UserController.getDoctors);


// Admin-only routes
router.get('/', authenticateToken, requireAdmin, validatePagination, UserController.getAllUsers);
router.get('/stats', authenticateToken, requireAdmin, UserController.getUserStats);
router.get('/:id', authenticateToken, requireAdmin, validateId, UserController.getUserById);
router.put('/:id', authenticateToken, requireAdmin, validateId, UserController.updateUserById);
router.put('/:id/activate', authenticateToken, requireAdmin, validateId, UserController.activateUserById);
router.put('/:id/deactivate', authenticateToken, requireAdmin, validateId, UserController.deactivateUserById);
router.delete('/:id', authenticateToken, requireAdmin, validateId, UserController.deleteUserById);

module.exports = router;

