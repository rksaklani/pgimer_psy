const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array()
    });
  }
  next();
};

const validateUserRegistration = [
  body('name').trim().isLength({ min: 2, max: 255 }).withMessage('Name must be between 2 and 255 characters'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('role').isIn(['Admin', 'Psychiatric Welfare Officer', 'Faculty', 'Resident']).withMessage('Invalid role'),
  body('mobile').optional().trim(),
  validate
];

const validateUserLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').notEmpty().withMessage('Password is required'),
  validate
];

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  validate
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

const validatePatientId = [
  param('patient_id').isInt({ min: 1 }).withMessage('Patient ID must be a positive integer'),
  validate
];

module.exports = {
  validateUserRegistration,
  validateUserLogin,
  validateId,
  validatePagination,
  validatePatientId
};

