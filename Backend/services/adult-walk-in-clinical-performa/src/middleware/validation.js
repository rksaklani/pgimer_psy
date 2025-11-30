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

const validateClinicalProforma = [
  body('patient_id').isInt({ min: 1 }).withMessage('Patient ID is required and must be a positive integer'),
  body('visit_date').optional().isISO8601().withMessage('Visit date must be a valid date'),
  body('visit_type').optional().isIn(['first_visit', 'follow_up']).withMessage('Visit type must be first_visit or follow_up'),
  body('doctor_decision').optional().isIn(['simple_case', 'complex_case']).withMessage('Doctor decision must be simple_case or complex_case'),
  body('case_severity').optional().isIn(['mild', 'moderate', 'severe', 'critical']).withMessage('Case severity must be mild, moderate, severe, or critical'),
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

module.exports = {
  validateClinicalProforma,
  validateId,
  validatePagination
};

