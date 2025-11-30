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

const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID must be a positive integer'),
  validate
];

const validatePatient = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('sex').optional().isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
  body('cr_no').optional().trim(),
  validate
];

const validatePatientRegistration = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('sex').optional().isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
  validate
];

const validatePagination = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  validate
];

const validateCRNo = [
  param('cr_no').trim().notEmpty().withMessage('CR No is required'),
  validate
];

const validatePatientCard = [
  body('cr_no').trim().notEmpty().withMessage('CR No is required'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('sex').optional().isIn(['Male', 'Female', 'Other']).withMessage('Sex must be Male, Female, or Other'),
  validate
];

const validatePatientRecord = [
  body('cr_no').trim().notEmpty().withMessage('CR No is required'),
  body('no_of_children_male').optional().isInt({ min: 0 }).withMessage('Number of male children must be a non-negative integer'),
  body('no_of_children_female').optional().isInt({ min: 0 }).withMessage('Number of female children must be a non-negative integer'),
  body('year_of_marriage').optional().isInt({ min: 1900, max: 2100 }).withMessage('Year of marriage must be a valid year'),
  validate
];

module.exports = {
  validateId,
  validateCRNo,
  validatePatient,
  validatePatientCard,
  validatePatientRecord,
  validatePatientRegistration,
  validatePagination
};

