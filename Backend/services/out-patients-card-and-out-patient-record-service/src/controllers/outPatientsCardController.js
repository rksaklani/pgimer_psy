const OutPatientsCard = require('../models/OutPatientsCard');

/**
 * Out Patients Card Controller
 * Handles operations for patient cards (master demographic + registration data)
 */
class OutPatientsCardController {
  /**
   * Create a new patient card
   * POST /api/patient-cards
   */
  static async createCard(req, res) {
    try {
      const card = await OutPatientsCard.create(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Patient card created successfully',
        data: { card: card.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientsCardController.createCard] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create patient card',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get patient card by CR No
   * GET /api/patient-cards/cr/:cr_no
   */
  static async getCardByCRNo(req, res) {
    try {
      const card = await OutPatientsCard.findByCRNo(req.params.cr_no);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Patient card not found'
        });
      }

      res.json({
        success: true,
        data: { card: card.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientsCardController.getCardByCRNo] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient card'
      });
    }
  }

  /**
   * Get all patient cards with pagination and filters
   * GET /api/patient-cards
   */
  static async getAllCards(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        name: req.query.name,
        cr_no: req.query.cr_no,
        mobile_no: req.query.mobile_no
      };

      const result = await OutPatientsCard.findAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[OutPatientsCardController.getAllCards] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient cards'
      });
    }
  }

  /**
   * Update patient card
   * PUT /api/patient-cards/:cr_no
   */
  static async updateCard(req, res) {
    try {
      const card = await OutPatientsCard.update(req.params.cr_no, req.body);
      
      if (!card) {
        return res.status(404).json({
          success: false,
          message: 'Patient card not found'
        });
      }

      res.json({
        success: true,
        message: 'Patient card updated successfully',
        data: { card: card.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientsCardController.updateCard] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update patient card'
      });
    }
  }
}

module.exports = OutPatientsCardController;

