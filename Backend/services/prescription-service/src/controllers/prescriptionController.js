const Prescription = require('../models/Prescription');
const axios = require('axios');

// Service URLs
const ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL = process.env.ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL || 'http://localhost:3003';

class PrescriptionController {
  static async createPrescription(req, res) {
    try {
      const data = req.body;

      if (!data.clinical_proforma_id) {
        return res.status(400).json({
          success: false,
          message: 'clinical_proforma_id is required'
        });
      }

      // Verify clinical proforma exists
      try {
        await axios.get(`${ADULT_WALK_IN_CLINICAL_PERFORMA_SERVICE_URL}/api/clinical-proformas/${data.clinical_proforma_id}`, {
          headers: { Authorization: req.headers.authorization }
        });
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Handle prescription array
      let prescriptionArray = [];
      if (data.prescription && Array.isArray(data.prescription)) {
        prescriptionArray = data.prescription.map((p, index) => ({
          id: p.id || (index + 1),
          medicine: p.medicine || null,
          dosage: p.dosage || null,
          when_to_take: p.when_to_take || p.when || null,
          frequency: p.frequency || null,
          duration: p.duration || null,
          quantity: p.quantity || p.qty || null,
          details: p.details || null,
          notes: p.notes || null
        }));
      } else if (data.prescriptions && Array.isArray(data.prescriptions)) {
        prescriptionArray = data.prescriptions.map((p, index) => ({
          id: p.id || (index + 1),
          medicine: p.medicine || null,
          dosage: p.dosage || null,
          when_to_take: p.when_to_take || p.when || null,
          frequency: p.frequency || null,
          duration: p.duration || null,
          quantity: p.quantity || p.qty || null,
          details: p.details || null,
          notes: p.notes || null
        }));
      }

      const patientIdInt = parseInt(data.patient_id);
      if (isNaN(patientIdInt)) {
        return res.status(400).json({
          success: false,
          message: 'patient_id must be a valid integer'
        });
      }

      const prescription = await Prescription.create({
        patient_id: patientIdInt,
        clinical_proforma_id: data.clinical_proforma_id,
        prescription: prescriptionArray
      });

      res.status(201).json({
        success: true,
        message: `Prescription created successfully with ${prescriptionArray.length} medication(s)`,
        data: { prescription: prescription.toJSON() }
      });
    } catch (error) {
      console.error('Create prescription error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create prescription'
      });
    }
  }

  static async getAllPrescriptions(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        patient_id: req.query.patient_id,
        clinical_proforma_id: req.query.clinical_proforma_id
      };

      const result = await Prescription.findAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all prescriptions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get prescriptions'
      });
    }
  }

  static async getPrescriptionById(req, res) {
    try {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      res.json({
        success: true,
        data: { prescription: prescription.toJSON() }
      });
    } catch (error) {
      console.error('Get prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get prescription'
      });
    }
  }

  static async getPrescriptionByProformaId(req, res) {
    try {
      const prescription = await Prescription.findByClinicalProformaId(req.params.clinical_proforma_id);
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      res.json({
        success: true,
        data: { prescription: prescription.toJSON() }
      });
    } catch (error) {
      console.error('Get prescription by proforma ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get prescription'
      });
    }
  }

  static async updatePrescription(req, res) {
    try {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      // Handle prescription array update
      if (req.body.prescription && Array.isArray(req.body.prescription)) {
        await prescription.update({ prescription: req.body.prescription });
      } else {
        await prescription.update(req.body);
      }

      res.json({
        success: true,
        message: 'Prescription updated successfully',
        data: { prescription: prescription.toJSON() }
      });
    } catch (error) {
      console.error('Update prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update prescription'
      });
    }
  }

  static async deletePrescription(req, res) {
    try {
      const prescription = await Prescription.findById(req.params.id);
      if (!prescription) {
        return res.status(404).json({
          success: false,
          message: 'Prescription not found'
        });
      }

      await prescription.delete();
      
      res.json({
        success: true,
        message: 'Prescription deleted successfully'
      });
    } catch (error) {
      console.error('Delete prescription error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete prescription'
      });
    }
  }
}

module.exports = PrescriptionController;

