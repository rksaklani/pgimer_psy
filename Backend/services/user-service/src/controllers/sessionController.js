const { query } = require('../../../../common/database/pool');
const { PATIENT_VISIT_SCHEMA } = require('../../../../common/utils/schemas');

class SessionController {
  static async createSession(req, res) {
    try {
      const { patient_id, assigned_doctor_id, room_no, visit_date, visit_type, notes } = req.body;
      
      // Verify patient exists - check in registered_patient table
      const { PATIENT_SCHEMA } = require('../../../../common/utils/schemas');
      const patientCheck = await query(
        `SELECT id FROM ${PATIENT_SCHEMA.tableName} WHERE id = $1`,
        [parseInt(patient_id)]
      );
      
      if (patientCheck.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      // Get visit count
      const visitCountResult = await query(
        `SELECT COUNT(*) as count FROM ${PATIENT_VISIT_SCHEMA.tableName} WHERE patient_id = $1`,
        [parseInt(patient_id)]
      );
      const visitCount = parseInt(visitCountResult.rows[0].count);
      const finalVisitType = visit_type || (visitCount === 0 ? 'first_visit' : 'follow_up');
      
      // Create visit
      const result = await query(
        `INSERT INTO ${PATIENT_VISIT_SCHEMA.tableName} (patient_id, assigned_doctor_id, room_no, visit_date, visit_type, notes, visit_status)
         VALUES ($1, $2, $3, $4, $5, $6, 'pending')
         RETURNING *`,
        [
          parseInt(patient_id),
          assigned_doctor_id ? parseInt(assigned_doctor_id) : null,
          room_no || null,
          visit_date || new Date().toISOString().slice(0, 10),
          finalVisitType,
          notes || `Visit created - Visit #${visitCount + 1}`
        ]
      );

      res.status(201).json({
        success: true,
        message: 'Session created successfully',
        data: { visit: result.rows[0] }
      });
    } catch (error) {
      console.error('Create session error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create session'
      });
    }
  }

  static async getPatientSessions(req, res) {
    try {
      const result = await query(
        `SELECT * FROM ${PATIENT_VISIT_SCHEMA.tableName} WHERE patient_id = $1 ORDER BY visit_date DESC, created_at DESC`,
        [parseInt(req.params.patient_id)]
      );
      
      res.json({
        success: true,
        data: { visits: result.rows }
      });
    } catch (error) {
      console.error('Get patient sessions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient sessions'
      });
    }
  }

  static async getSessionById(req, res) {
    try {
      const result = await query(
        `SELECT * FROM ${PATIENT_VISIT_SCHEMA.tableName} WHERE id = $1`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.json({
        success: true,
        data: { visit: result.rows[0] }
      });
    } catch (error) {
      console.error('Get session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get session'
      });
    }
  }

  static async updateSession(req, res) {
    try {
      const allowedFields = ['visit_date', 'visit_type', 'visit_status', 'assigned_doctor_id', 'room_no', 'notes'];
      const updates = [];
      const values = [];
      let idx = 1;

      for (const [key, value] of Object.entries(req.body)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${idx++}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No valid fields to update'
        });
      }

      values.push(req.params.id);
      const result = await query(
        `UPDATE ${PATIENT_VISIT_SCHEMA.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.json({
        success: true,
        message: 'Session updated successfully',
        data: { visit: result.rows[0] }
      });
    } catch (error) {
      console.error('Update session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update session'
      });
    }
  }

  static async deleteSession(req, res) {
    try {
      const result = await query(
        `DELETE FROM ${PATIENT_VISIT_SCHEMA.tableName} WHERE id = $1 RETURNING *`,
        [req.params.id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Session not found'
        });
      }

      res.json({
        success: true,
        message: 'Session deleted successfully'
      });
    } catch (error) {
      console.error('Delete session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete session'
      });
    }
  }

  static async completeSession(req, res) {
    try {
      const visit_date = req.body.visit_date || new Date().toISOString().slice(0, 10);
      
      const result = await query(
        `UPDATE ${PATIENT_VISIT_SCHEMA.tableName} 
         SET visit_status = 'completed', updated_at = CURRENT_TIMESTAMP 
         WHERE patient_id = $1 AND visit_date = $2
         RETURNING *`,
        [req.params.patient_id, visit_date]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'Visit not found'
        });
      }

      res.json({
        success: true,
        message: 'Visit marked as completed',
        data: { visit: result.rows[0] }
      });
    } catch (error) {
      console.error('Complete session error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to complete session'
      });
    }
  }
}

module.exports = SessionController;
