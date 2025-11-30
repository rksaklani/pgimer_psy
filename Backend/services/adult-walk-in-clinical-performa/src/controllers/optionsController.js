const ClinicalOption = require('../models/ClinicalOption');

class OptionsController {
  static async getGroup(req, res) {
    try {
      const group = req.params.group;
      const options = await ClinicalOption.getGroup(group);
      
      res.json({
        success: true,
        data: { group, options }
      });
    } catch (error) {
      console.error('Get options error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get options'
      });
    }
  }

  static async addOption(req, res) {
    try {
      const group = req.params.group;
      const { label } = req.body;
      
      if (!label || !label.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Label is required'
        });
      }

      await ClinicalOption.addOption(group, label.trim());
      const options = await ClinicalOption.getGroup(group);
      
      res.status(201).json({
        success: true,
        data: { group, options }
      });
    } catch (error) {
      console.error('Add option error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to add option'
      });
    }
  }

  static async deleteOption(req, res) {
    try {
      const group = req.params.group;
      const { label } = req.body;
      
      if (!label || !label.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Label is required'
        });
      }

      await ClinicalOption.deleteOption(group, label.trim());
      const options = await ClinicalOption.getGroup(group);
      
      res.json({
        success: true,
        data: { group, options }
      });
    } catch (error) {
      console.error('Delete option error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete option'
      });
    }
  }
}

module.exports = OptionsController;

