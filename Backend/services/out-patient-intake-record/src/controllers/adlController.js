const ADLFile = require('../models/ADLFile');
const axios = require('axios');

// Service URLs
const OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL = process.env.OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL || 'http://localhost:3002';
const ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL = process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL || 'http://localhost:3003';

class ADLController {
  static async getAllADLFiles(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {};

      if (req.query.file_status) filters.file_status = req.query.file_status;
      if (req.query.is_active !== undefined) filters.is_active = req.query.is_active === 'true';
      if (req.query.created_by) filters.created_by = req.query.created_by;
      if (req.query.last_accessed_by) filters.last_accessed_by = req.query.last_accessed_by;
      if (req.query.date_from) filters.date_from = req.query.date_from;
      if (req.query.date_to) filters.date_to = req.query.date_to;
      if (req.query.include_all === 'true') filters.include_all = true;

      const result = await ADLFile.findAll(page, limit, filters);

      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all ADL files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files'
      });
    }
  }

  static async getADLFileById(req, res) {
    try {
      const adlFile = await ADLFile.findById(req.params.id);
      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      res.json({
        success: true,
        data: { adl_file: adlFile.toJSON() }
      });
    } catch (error) {
      console.error('Get ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL file'
      });
    }
  }

  static async createADLFile(req, res) {
    try {
      const data = req.body;

      if (!data.patient_id) {
        return res.status(400).json({
          success: false,
          message: 'Patient ID is required'
        });
      }

      // Verify patient exists via patient service
      try {
        await axios.get(`${OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL}/api/patients/${data.patient_id}`, {
          headers: { Authorization: req.headers.authorization }
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const adlFile = await ADLFile.create({
        ...data,
        created_by: req.user.id
      });

      // Update patient status via patient service
      try {
        await axios.put(`${OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL}/api/patients/${data.patient_id}`, {
          has_adl_file: true,
          case_complexity: 'complex',
          file_status: 'created'
        }, {
          headers: { Authorization: req.headers.authorization }
        });
      } catch (error) {
        console.warn('Failed to update patient status:', error.message);
      }

      // Update clinical proforma if provided
      if (data.clinical_proforma_id) {
        try {
          await axios.put(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/${data.clinical_proforma_id}`, {
            adl_file_id: adlFile.id,
            requires_adl_file: true
          }, {
            headers: { Authorization: req.headers.authorization }
          });
        } catch (error) {
          console.warn('Failed to update clinical proforma:', error.message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'ADL file created successfully',
        data: { adl_file: adlFile.toJSON() }
      });
    } catch (error) {
      console.error('Create ADL file error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create ADL file'
      });
    }
  }

  static async updateADLFile(req, res) {
    try {
      const adlFile = await ADLFile.findById(req.params.id);
      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      await adlFile.update(req.body);

      res.json({
        success: true,
        message: 'ADL file updated successfully',
        data: { adl_file: adlFile.toJSON() }
      });
    } catch (error) {
      console.error('Update ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update ADL file'
      });
    }
  }

  static async deleteADLFile(req, res) {
    try {
      const adlFile = await ADLFile.findById(req.params.id);
      if (!adlFile) {
        return res.status(404).json({
          success: false,
          message: 'ADL file not found'
        });
      }

      await adlFile.delete();

      res.json({
        success: true,
        message: 'ADL file deleted successfully'
      });
    } catch (error) {
      console.error('Delete ADL file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete ADL file'
      });
    }
  }

  static async getADLFilesByPatientId(req, res) {
    try {
      const adlFiles = await ADLFile.findByPatientId(req.params.patient_id);

      res.json({
        success: true,
        data: {
          files: adlFiles.map(file => file.toJSON())
        }
      });
    } catch (error) {
      console.error('Get ADL files by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files'
      });
    }
  }

  static async getADLStats(req, res) {
    try {
      const stats = await ADLFile.getStats();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get ADL stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics'
      });
    }
  }

  static async getFilesByStatus(req, res) {
    try {
      const stats = await ADLFile.getFilesByStatus();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get files by status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get status statistics'
      });
    }
  }

  static async getActiveFiles(req, res) {
    try {
      const files = await ADLFile.findActive();
      res.json({
        success: true,
        data: { files: files.map(f => f.toJSON()) }
      });
    } catch (error) {
      console.error('Get active files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get active files'
      });
    }
  }
}

module.exports = ADLController;

