const PatientCardAndRecord = require('../models/PatientCardAndRecord');
const PatientVisit = require('../models/PatientVisit');
const axios = require('axios');

// Service URLs
const ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL = process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL || 'http://localhost:3003';
const OUT_PATIENT_INTAKE_RECORD_SERVICE_URL = process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_URL || 'http://localhost:3004';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

/**
 * Unified Patient Card and Record Controller
 * Handles operations for both patient cards and records
 * CREATE operations are separate, but VIEW/UPDATE/DELETE are unified
 */
class PatientCardAndRecordController {
  /**
   * Create a new patient card (Step 1)
   * POST /api/patient-cards
   */
  static async createCard(req, res) {
    try {
      const card = await PatientCardAndRecord.createCard(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Patient card created successfully',
        data: { patient: card.toJSON() }
      });
    } catch (error) {
      console.error('[PatientCardAndRecordController.createCard] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create patient card',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Create a new patient record (Step 2 - requires card to exist)
   * POST /api/patient-records
   */
  static async createRecord(req, res) {
    try {
      const record = await PatientCardAndRecord.createRecord(req.body);
      
      // Create visit record via session service if assigned_doctor_id is provided
      if (req.body.assigned_doctor_id && record.id) {
        try {
          await axios.post(`${USER_SERVICE_URL}/api/sessions`, {
            patient_id: record.id,
            assigned_doctor_id: req.body.assigned_doctor_id,
            visit_date: new Date().toISOString().slice(0, 10),
            visit_type: 'first_visit'
          }, {
            headers: { Authorization: req.headers.authorization }
          });
        } catch (error) {
          console.warn('[PatientCardAndRecordController] Failed to create visit record:', error.message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Patient record created successfully',
        data: { patient: record.toJSON() }
      });
    } catch (error) {
      console.error('[PatientCardAndRecordController.createRecord] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create patient record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get patient by CR No (unified - returns both card and record)
   * GET /api/patients/cr/:cr_no
   */
  static async getByCRNo(req, res) {
    try {
      const patient = await PatientCardAndRecord.findByCRNo(req.params.cr_no);
      
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
      console.error('[PatientCardAndRecordController.getByCRNo] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient data'
      });
    }
  }

  /**
   * Get patient by Record ID (unified - returns both card and record)
   * GET /api/patients/:id
   */
  static async getById(req, res) {
    try {
      const patient = await PatientCardAndRecord.findById(req.params.id);
      
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
      console.error('[PatientCardAndRecordController.getById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient data'
      });
    }
  }

  /**
   * Get all patients (unified - returns both card and record data)
   * GET /api/patients
   */
  static async getAll(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const filters = {
        name: req.query.name,
        cr_no: req.query.cr_no,
        mobile_no: req.query.mobile_no,
        psy_no: req.query.psy_no,
        assigned_doctor_id: req.query.assigned_doctor_id
      };

      const result = await PatientCardAndRecord.findAll(page, limit, filters);

      res.json({
        success: true,
        data: {
          patients: result.patients.map(p => p.toJSON()),
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error('[PatientCardAndRecordController.getAll] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patients'
      });
    }
  }

  /**
   * Update patient by CR No (unified - updates both card and record)
   * PUT /api/patients/cr/:cr_no
   */
  static async updateByCRNo(req, res) {
    try {
      const { cr_no } = req.params;
      
      const patient = await PatientCardAndRecord.findByCRNo(cr_no);
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
      console.error('[PatientCardAndRecordController.updateByCRNo] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update patient'
      });
    }
  }

  /**
   * Delete patient by CR No (unified - deletes both card and record with cascade)
   * DELETE /api/patients/cr/:cr_no
   */
  static async deleteByCRNo(req, res) {
    try {
      const { cr_no } = req.params;

      const deleted = await PatientCardAndRecord.delete(cr_no);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      res.json({
        success: true,
        message: 'Patient deleted successfully'
      });
    } catch (error) {
      console.error('[PatientCardAndRecordController.deleteByCRNo] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete patient'
      });
    }
  }

  /**
   * Get patient profile with related data
   * GET /api/patients/:id/profile
   */
  static async getProfile(req, res) {
    try {
      const patient = await PatientCardAndRecord.findById(req.params.id);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Fetch related data from other services
      let visits = [];
      let clinicalRecords = [];
      let intakeRecords = [];

      try {
        const visitsRes = await axios.get(`${USER_SERVICE_URL}/api/sessions/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        visits = visitsRes.data.data?.visits || [];
      } catch (error) {
        console.warn('[PatientCardAndRecordController] Failed to fetch visits:', error.message);
      }

      try {
        const clinicalRes = await axios.get(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        clinicalRecords = clinicalRes.data.data?.proformas || [];
      } catch (error) {
        console.warn('[PatientCardAndRecordController] Failed to fetch clinical records:', error.message);
      }

      try {
        const intakeRes = await axios.get(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        intakeRecords = intakeRes.data.data?.files || [];
      } catch (error) {
        console.warn('[PatientCardAndRecordController] Failed to fetch intake records:', error.message);
      }

      res.json({
        success: true,
        data: {
          patient: patient.toJSON(),
          visits,
          clinicalRecords,
          intakeRecords
        }
      });
    } catch (error) {
      console.error('[PatientCardAndRecordController.getProfile] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient profile'
      });
    }
  }

  /**
   * Assign patient to doctor
   * POST /api/patients/assign
   */
  static async assignPatient(req, res) {
    try {
      const { cr_no, assigned_doctor_id } = req.body;
      
      const patient = await PatientCardAndRecord.findByCRNo(cr_no);
      
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      await patient.update({ assigned_doctor_id });
      
      res.json({
        success: true,
        message: 'Patient assigned successfully',
        data: { patient: patient.toJSON() }
      });
    } catch (error) {
      console.error('[PatientCardAndRecordController.assignPatient] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign patient'
      });
    }
  }
}

module.exports = PatientCardAndRecordController;

