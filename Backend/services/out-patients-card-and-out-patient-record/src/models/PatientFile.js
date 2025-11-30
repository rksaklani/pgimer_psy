const { query } = require('../../../../common/database/pool');
const { PATIENT_FILE_SCHEMA } = require('../../../../common/utils/schemas');

class PatientFile {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.attachment = data.attachment ? (typeof data.attachment === 'string' ? JSON.parse(data.attachment) : data.attachment) : [];
    this.user_id = data.user_id;
    this.role = data.role ? (typeof data.role === 'string' ? JSON.parse(data.role) : data.role) : [];
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(fileData) {
    try {
      const { patient_id, attachment = [], user_id } = fileData;

      const result = await query(
        `INSERT INTO ${PATIENT_FILE_SCHEMA.tableName} (patient_id, attachment, user_id)
         VALUES ($1, $2::jsonb, $3)
         RETURNING *`,
        [patient_id, JSON.stringify(attachment), user_id]
      );

      return new PatientFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByPatientId(patient_id) {
    try {
      const result = await query(
        `SELECT * FROM ${PATIENT_FILE_SCHEMA.tableName} WHERE patient_id = $1`,
        [patient_id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new PatientFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  async update(updateData) {
    try {
      const updates = [];
      const values = [];
      let idx = 1;

      if (updateData.attachment !== undefined) {
        updates.push(`attachment = $${idx++}::jsonb`);
        values.push(JSON.stringify(updateData.attachment));
      }

      if (updateData.user_id !== undefined) {
        updates.push(`user_id = $${idx++}`);
        values.push(updateData.user_id);
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await query(
        `UPDATE ${PATIENT_FILE_SCHEMA.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_records,
          SUM(jsonb_array_length(attachment)) as total_files
        FROM ${PATIENT_FILE_SCHEMA.tableName}
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      attachment: this.attachment,
      user_id: this.user_id,
      role: this.role,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PatientFile;

