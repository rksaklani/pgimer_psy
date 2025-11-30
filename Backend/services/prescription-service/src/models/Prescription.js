const { query } = require('../../../../common/database/pool');
const { PRESCRIPTION_SCHEMA } = require('../../../../common/utils/schemas');

class Prescription {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.clinical_proforma_id = data.clinical_proforma_id;
    
    // Handle prescriptions from JSONB column
    if (data.prescriptions) {
      if (Array.isArray(data.prescriptions)) {
        this.prescription = data.prescriptions;
      } else if (typeof data.prescriptions === 'string') {
        try {
          this.prescription = JSON.parse(data.prescriptions);
        } catch (e) {
          this.prescription = [];
        }
      } else {
        this.prescription = data.prescriptions;
      }
    } else if (data.prescription && Array.isArray(data.prescription)) {
      this.prescription = data.prescription;
    } else {
      this.prescription = [];
    }
    
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(prescriptionData) {
    try {
      const { patient_id, clinical_proforma_id, prescription } = prescriptionData;

      if (!clinical_proforma_id) {
        throw new Error('clinical_proforma_id is required');
      }

      const prescriptionJson = JSON.stringify(prescription || []);

      const result = await query(
        `INSERT INTO ${PRESCRIPTION_SCHEMA.tableName} (patient_id, clinical_proforma_id, prescriptions)
         VALUES ($1, $2, $3::jsonb)
         RETURNING *`,
        [patient_id, clinical_proforma_id, prescriptionJson]
      );

      return new Prescription(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        `SELECT * FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Prescription(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByClinicalProformaId(clinical_proforma_id) {
    try {
      const result = await query(
        `SELECT * FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE clinical_proforma_id = $1`,
        [clinical_proforma_id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new Prescription(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = [];
      const params = [];
      let idx = 1;

      if (filters.patient_id) {
        where.push(`patient_id = $${idx++}`);
        params.push(filters.patient_id);
      }
      if (filters.clinical_proforma_id) {
        where.push(`clinical_proforma_id = $${idx++}`);
        params.push(filters.clinical_proforma_id);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const queryText = `
        SELECT * FROM ${PRESCRIPTION_SCHEMA.tableName}
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      const countQuery = `SELECT COUNT(*) as cnt FROM ${PRESCRIPTION_SCHEMA.tableName} ${whereClause}`;
      const countParams = params.slice(0, params.length - 2);

      const [result, countResult] = await Promise.all([
        query(queryText, params),
        query(countQuery, countParams)
      ]);

      const prescriptions = result.rows.map(row => new Prescription(row));
      const total = parseInt(countResult.rows[0].cnt, 10);

      return {
        prescriptions: prescriptions.map(p => p.toJSON()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  async update(updateData) {
    try {
      const updates = [];
      const values = [];
      let idx = 1;

      if (updateData.prescription !== undefined) {
        updates.push(`prescriptions = $${idx++}::jsonb`);
        values.push(JSON.stringify(updateData.prescription));
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await query(
        `UPDATE ${PRESCRIPTION_SCHEMA.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
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

  async delete() {
    try {
      await query(`DELETE FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE id = $1`, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      clinical_proforma_id: this.clinical_proforma_id,
      prescription: this.prescription,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = Prescription;

