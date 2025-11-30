const OutPatientRecord = require('../models/OutPatientRecord');
const OutPatientsCard = require('../models/OutPatientsCard');
const PatientVisit = require('../models/PatientVisit');
const axios = require('axios');

// Service URLs
const ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL = process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL || 'http://localhost:3003';
const OUT_PATIENT_INTAKE_RECORD_SERVICE_URL = process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_URL || 'http://localhost:3004';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3001';

/**
 * Out Patient Record Controller
 * Handles operations for patient records (extended patient details)
 */
class OutPatientRecordController {
  /**
   * Create a new patient record
   * POST /api/out-patient-records
   */
  static async createRecord(req, res) {
    try {
      // Verify that the patient card exists
      const card = await OutPatientsCard.findByCRNo(req.body.cr_no);
      if (!card) {
        return res.status(404).json({
          success: false,
          message: `Patient card with CR No ${req.body.cr_no} does not exist. Please create the patient card first.`
        });
      }

      const record = await OutPatientRecord.create(req.body);
      
      // Create visit record via session service if assigned_doctor_id is provided
      if (req.body.assigned_doctor_id) {
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
          console.warn('[OutPatientRecordController] Failed to create visit record:', error.message);
        }
      }

      res.status(201).json({
        success: true,
        message: 'Patient record created successfully',
        data: { record: record.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.createRecord] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create patient record',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  /**
   * Get patient record by ID
   * GET /api/out-patient-records/:id
   */
  static async getRecordById(req, res) {
    try {
      const record = await OutPatientRecord.findById(req.params.id);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      res.json({
        success: true,
        data: { record: record.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getRecordById] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient record'
      });
    }
  }

  /**
   * Get patient record by CR No
   * GET /api/out-patient-records/cr/:cr_no
   */
  static async getRecordByCRNo(req, res) {
    try {
      const record = await OutPatientRecord.findByCRNo(req.params.cr_no);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      res.json({
        success: true,
        data: { record: record.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getRecordByCRNo] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient record'
      });
    }
  }

  /**
   * Get all patient records with pagination and filters
   * GET /api/out-patient-records
   */
  static async getAllRecords(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        cr_no: req.query.cr_no,
        psy_no: req.query.psy_no,
        assigned_doctor_id: req.query.assigned_doctor_id
      };

      const result = await OutPatientRecord.findAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getAllRecords] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient records'
      });
    }
  }

  /**
   * Update patient record
   * PUT /api/out-patient-records/:id
   */
  static async updateRecord(req, res) {
    try {
      const record = await OutPatientRecord.update(req.params.id, req.body);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      res.json({
        success: true,
        message: 'Patient record updated successfully',
        data: { record: record.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.updateRecord] Error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update patient record'
      });
    }
  }

  /**
   * Get patient profile with related data
   * GET /api/out-patient-records/:id/profile
   */
  static async getRecordProfile(req, res) {
    try {
      const record = await OutPatientRecord.findById(req.params.id);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
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
        console.warn('[OutPatientRecordController] Failed to fetch visits:', error.message);
      }

      try {
        const clinicalRes = await axios.get(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        clinicalRecords = clinicalRes.data.data?.proformas || [];
      } catch (error) {
        console.warn('[OutPatientRecordController] Failed to fetch clinical records:', error.message);
      }

      try {
        const intakeRes = await axios.get(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records/patient/${req.params.id}`, {
          headers: { Authorization: req.headers.authorization }
        });
        intakeRecords = intakeRes.data.data?.files || [];
      } catch (error) {
        console.warn('[OutPatientRecordController] Failed to fetch intake records:', error.message);
      }

      res.json({
        success: true,
        data: {
          record: record.toJSON(),
          visits,
          clinicalRecords,
          intakeRecords
        }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getRecordProfile] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient record profile'
      });
    }
  }

  /**
   * Get patient visit count
   * GET /api/out-patient-records/:id/visits/count
   */
  static async getVisitCount(req, res) {
    try {
      const count = await PatientVisit.getVisitCount(parseInt(req.params.id));
      res.json({
        success: true,
        data: { visit_count: count }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getVisitCount] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit count'
      });
    }
  }

  /**
   * Get patient visit history
   * GET /api/out-patient-records/:id/visits
   */
  static async getVisitHistory(req, res) {
    try {
      const response = await axios.get(`${USER_SERVICE_URL}/api/sessions/patient/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getVisitHistory] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit history'
      });
    }
  }

  /**
   * Get patient clinical records
   * GET /api/out-patient-records/:id/clinical-records
   */
  static async getClinicalRecords(req, res) {
    try {
      const response = await axios.get(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/patient/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getClinicalRecords] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical records'
      });
    }
  }

  /**
   * Get patient intake records
   * GET /api/out-patient-records/:id/intake-records
   */
  static async getIntakeRecords(req, res) {
    try {
      const response = await axios.get(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records/patient/${req.params.id}`, {
        headers: { Authorization: req.headers.authorization }
      });
      
      res.json({
        success: true,
        data: response.data.data
      });
    } catch (error) {
      console.error('[OutPatientRecordController.getIntakeRecords] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get intake records'
      });
    }
  }

  /**
   * Assign patient to doctor
   * POST /api/out-patient-records/assign
   */
  static async assignPatient(req, res) {
    try {
      const { patient_id, assigned_doctor_id } = req.body;
      const record = await OutPatientRecord.findById(patient_id);
      
      if (!record) {
        return res.status(404).json({
          success: false,
          message: 'Patient record not found'
        });
      }

      const updatedRecord = await OutPatientRecord.update(patient_id, { 
        assigned_doctor_id: assigned_doctor_id 
      });
      
      res.json({
        success: true,
        message: 'Patient assigned successfully',
        data: { record: updatedRecord.toJSON() }
      });
    } catch (error) {
      console.error('[OutPatientRecordController.assignPatient] Error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to assign patient'
      });
    }
  }
}

module.exports = OutPatientRecordController;

