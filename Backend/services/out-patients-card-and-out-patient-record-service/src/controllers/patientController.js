const Patient = require('../models/Patient');
const PatientVisit = require('../models/PatientVisit');
const axios = require('axios');

// Service URLs (from environment or defaults)
const ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL = process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL || 'http://localhost:3003';
const OUT_PATIENT_INTAKE_RECORD_SERVICE_URL = process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_URL || 'http://localhost:3004';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';
const SESSION_SERVICE_URL = USER_SERVICE_URL; // Sessions are now part of user-service

class PatientController {
  static async createPatient(req, res) {
    try {
      const patientData = { ...req.body, filled_by: req.user.id };
      const patient = await Patient.create(patientData);
      
      // Create visit record via session service
      if (req.body.assigned_doctor_id) {
        try {
          await axios.post(`${USER_SERVICE_URL}/api/sessions`, {
            patient_id: patient.id,
            assigned_doctor_id: req.body.assigned_doctor_id,
            visit_date: new Date().toISOString().slice(0, 10),
            visit_type: 'first_visit'
          }, {
            headers: { Authorization: req.headers.authorization }
          });
        } catch (error) {
          console.warn('Failed to create visit record:', error.message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Create patient error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create patient',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async registerPatientWithDetails(req, res) {
    try {
      const patientData = { ...req.body, filled_by: req.user.id };
      const patient = await Patient.create(patientData);
      
      res.status(201).json({
        success: true,
        message: 'Patient registered successfully with complete information',
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Register patient error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to register patient'
      });
    }
  }

  static async getAllPatients(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        sex: req.query.sex,
        case_complexity: req.query.case_complexity,
        has_adl_file: req.query.has_adl_file !== undefined ? req.query.has_adl_file === 'true' : undefined,
        file_status: req.query.file_status,
        assigned_room: req.query.assigned_room
      };

      const result = await Patient.findAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patients'
      });
    }
  }

  static async searchPatients(req, res) {
    try {
      const searchTerm = req.query.q || '';
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const result = await Patient.search(searchTerm, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Search patients error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to search patients'
      });
    }
  }

  static async getPatientById(req, res) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Get patient by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient'
      });
    }
  }

  static async updatePatient(req, res) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await patient.update(req.body);
      
      res.json({
        success: true,
        message: 'Patient updated successfully',
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Update patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update patient'
      });
    }
  }

  static async deletePatient(req, res) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await patient.delete();
      
      res.json({
        success: true,
        message: 'Patient deleted successfully'
      });
    } catch (error) {
      console.error('Delete patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete patient'
      });
    }
  }

  static async getPatientStats(req, res) {
    try {
      const stats = await Patient.getStats();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get patient stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient statistics'
      });
    }
  }

  static async getAgeDistribution(req, res) {
    try {
      const distribution = await Patient.getAgeDistribution();
      res.json({
        success: true,
        data: { distribution }
      });
    } catch (error) {
      console.error('Get age distribution error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get age distribution'
      });
    }
  }

  static async getPatientProfile(req, res) {
    try {
      const patient = await Patient.findById(req.params.id);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Fetch related data from other services
      let visits = [];
      let clinicalRecords = [];
      let adlFiles = [];

      try {
        const visitsRes = await axios.get(`${SESSION_SERVICE_URL}/api/sessions/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        visits = visitsRes.data.data?.visits || [];
      } catch (error) {
        console.warn('Failed to fetch visits:', error.message);
      }

      try {
        const clinicalRes = await axios.get(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        clinicalRecords = clinicalRes.data.data?.proformas || [];
      } catch (error) {
        console.warn('Failed to fetch clinical records:', error.message);
      }

      try {
        const adlRes = await axios.get(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        adlFiles = adlRes.data.data?.files || [];
      } catch (error) {
        console.warn('Failed to fetch ADL files:', error.message);
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          visits,
          clinicalRecords,
          adlFiles
        }
      });
    } catch (error) {
      console.error('Get patient profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient profile'
      });
    }
  }

  static async getPatientVisitHistory(req, res) {
    try {
      const response = await axios.get(`${SESSION_SERVICE_URL}/api/sessions/patient/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('Get visit history error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit history'
      });
    }
  }

  static async getPatientClinicalRecords(req, res) {
    try {
      const response = await axios.get(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/patient/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('Get clinical records error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical records'
      });
    }
  }

  static async getPatientADLFiles(req, res) {
    try {
      const response = await axios.get(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records/patient/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('Get ADL files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get ADL files'
      });
    }
  }

  static async assignPatient(req, res) {
    try {
      const { patient_id, assigned_to } = req.body;
      const patient = await Patient.findById(patient_id);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await patient.update({ assigned_doctor_id: assigned_to });
      
      res.json({
        success: true,
        message: 'Patient assigned successfully',
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Assign patient error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign patient'
      });
    }
  }

  static async getPatientByCRNo(req, res) {
    try {
      const patient = await Patient.findByCRNo(req.params.cr_no);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Get patient by CR No error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient'
      });
    }
  }

  static async getPatientByPSYNo(req, res) {
    try {
      const patient = await Patient.findByPSYNo(req.params.psy_no);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Get patient by PSY No error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient'
      });
    }
  }

  static async getPatientByADLNo(req, res) {
    try {
      const patient = await Patient.findByADLNo(req.params.adl_no);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('Get patient by ADL No error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient'
      });
    }
  }

  static async getPatientVisitCount(req, res) {
    try {
      const count = await PatientVisit.getVisitCount(parseInt(req.params.id));
      res.json({
        success: true,
        data: { visit_count: count }
      });
    } catch (error) {
      console.error('Get visit count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit count'
      });
    }
  }

  static async markVisitCompleted(req, res) {
    try {
      const response = await axios.post(`${SESSION_SERVICE_URL}/api/sessions/patient/${req.params.id}/complete`, {
        visit_date: req.body.visit_date || new Date().toISOString().slice(0, 10)
      }, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('Mark visit completed error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to mark visit as completed'
      });
    }
  }
}

module.exports = PatientController;

