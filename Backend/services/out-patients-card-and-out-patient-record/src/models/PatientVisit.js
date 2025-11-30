const { query } = require('../../../../common/database/pool');
const { PATIENT_VISIT_SCHEMA, USER_SCHEMA } = require('../../../../common/utils/schemas');

class PatientVisit {
  static async getVisitCount(patient_id) {
    try {
      const result = await query(
        `SELECT COUNT(*) as visit_count 
         FROM ${PATIENT_VISIT_SCHEMA.tableName} 
         WHERE patient_id = $1`,
        [patient_id]
      );
      return parseInt(result.rows[0]?.visit_count || 0, 10);
    } catch (error) {
      console.error('[PatientVisit.getVisitCount] Error:', error);
      throw error;
    }
  }

  static async getPatientVisits(patient_id) {
    try {
      const result = await query(
        `SELECT pv.*, u.name as doctor_name, u.role as doctor_role
         FROM ${PATIENT_VISIT_SCHEMA.tableName} pv
         LEFT JOIN ${USER_SCHEMA.tableName} u ON pv.assigned_doctor_id = u.id
         WHERE pv.patient_id = $1
         ORDER BY pv.visit_date DESC, pv.created_at DESC`,
        [patient_id]
      );
      return result.rows || [];
    } catch (error) {
      console.error('[PatientVisit.getPatientVisits] Error:', error);
      throw error;
    }
  }

  static async assignPatient({ patient_id, assigned_doctor_id, room_no, visit_date, visit_type, notes }) {
    try {
      const dateToUse = visit_date || new Date().toISOString().slice(0, 10);
      
      let finalVisitType = visit_type;
      if (!finalVisitType) {
        const visitCount = await this.getVisitCount(patient_id);
        finalVisitType = visitCount === 0 ? 'first_visit' : 'follow_up';
      }

      const result = await query(
        `INSERT INTO ${PATIENT_VISIT_SCHEMA.tableName} (patient_id, visit_date, visit_type, has_file, assigned_doctor_id, room_no, visit_status, notes)
         VALUES ($1, $2, $3, false, $4, $5, 'pending', $6)
         RETURNING *`,
        [patient_id, dateToUse, finalVisitType, assigned_doctor_id, room_no, notes || null]
      );

      return result.rows[0];
    } catch (error) {
      console.error('[PatientVisit.assignPatient] Error:', error);
      throw error;
    }
  }
}

module.exports = PatientVisit;

