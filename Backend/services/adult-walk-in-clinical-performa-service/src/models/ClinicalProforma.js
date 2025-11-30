const { query, getClient } = require('../../../../common/database/pool');
const { CLINICAL_PROFORMA_SCHEMA } = require('../../../../common/utils/schemas');

class ClinicalProforma {
  constructor(data) {
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.filled_by = data.filled_by;
    this.visit_date = data.visit_date;
    this.visit_type = data.visit_type;
    this.room_no = data.room_no;
    this.assigned_doctor = data.assigned_doctor;
    this.informant_present = data.informant_present;
    this.nature_of_information = data.nature_of_information;
    this.onset_duration = data.onset_duration;
    this.course = data.course;
    this.precipitating_factor = data.precipitating_factor;
    this.illness_duration = data.illness_duration;
    this.current_episode_since = data.current_episode_since;
    this.mood = data.mood;
    this.behaviour = data.behaviour;
    this.speech = data.speech;
    this.thought = data.thought;
    this.perception = data.perception;
    this.somatic = data.somatic;
    this.bio_functions = data.bio_functions;
    this.adjustment = data.adjustment;
    this.cognitive_function = data.cognitive_function;
    this.fits = data.fits;
    this.sexual_problem = data.sexual_problem;
    this.substance_use = data.substance_use;
    this.past_history = data.past_history;
    this.family_history = data.family_history;
    this.associated_medical_surgical = data.associated_medical_surgical;
    this.mse_behaviour = data.mse_behaviour;
    this.mse_affect = data.mse_affect;
    this.mse_thought = data.mse_thought;
    this.mse_delusions = data.mse_delusions;
    this.mse_perception = data.mse_perception;
    this.mse_cognitive_function = data.mse_cognitive_function;
    this.gpe = data.gpe;
    this.diagnosis = data.diagnosis;
    this.icd_code = data.icd_code;
    this.disposal = data.disposal;
    this.workup_appointment = data.workup_appointment;
    this.referred_to = data.referred_to;
    this.treatment_prescribed = data.treatment_prescribed;
    this.doctor_decision = data.doctor_decision;
    this.requires_adl_file = data.requires_adl_file;
    this.adl_reasoning = data.adl_reasoning;
    this.adl_file_id = data.adl_file_id;
    this.case_severity = data.case_severity;
    this.created_at = data.created_at;
    this.patient_name = data.patient_name || null;
    this.cr_no = data.cr_no;
    this.psy_no = data.psy_no;
    this.doctor_name = data.doctor_name;
    this.doctor_role = data.doctor_role;
  }

  static async create(proformaData) {
    try {
      const fields = [];
      const values = [];
      let paramCount = 0;

      // Required fields
      fields.push('patient_id');
      values.push(proformaData.patient_id);
      paramCount++;

      fields.push('filled_by');
      values.push(proformaData.filled_by);
      paramCount++;

      fields.push('visit_date');
      values.push(proformaData.visit_date);
      paramCount++;

      // Optional fields
      const optionalFields = {
        visit_type: proformaData.visit_type,
        room_no: proformaData.room_no,
        assigned_doctor: proformaData.assigned_doctor,
        informant_present: proformaData.informant_present,
        nature_of_information: proformaData.nature_of_information,
        onset_duration: proformaData.onset_duration,
        course: proformaData.course,
        precipitating_factor: proformaData.precipitating_factor,
        illness_duration: proformaData.illness_duration,
        current_episode_since: proformaData.current_episode_since,
        mood: proformaData.mood,
        behaviour: proformaData.behaviour,
        speech: proformaData.speech,
        thought: proformaData.thought,
        perception: proformaData.perception,
        somatic: proformaData.somatic,
        bio_functions: proformaData.bio_functions,
        adjustment: proformaData.adjustment,
        cognitive_function: proformaData.cognitive_function,
        fits: proformaData.fits,
        sexual_problem: proformaData.sexual_problem,
        substance_use: proformaData.substance_use,
        past_history: proformaData.past_history,
        family_history: proformaData.family_history,
        associated_medical_surgical: proformaData.associated_medical_surgical,
        mse_behaviour: proformaData.mse_behaviour,
        mse_affect: proformaData.mse_affect,
        mse_thought: proformaData.mse_thought,
        mse_delusions: proformaData.mse_delusions,
        mse_perception: proformaData.mse_perception,
        mse_cognitive_function: proformaData.mse_cognitive_function,
        gpe: proformaData.gpe,
        diagnosis: proformaData.diagnosis,
        icd_code: proformaData.icd_code,
        disposal: proformaData.disposal,
        workup_appointment: proformaData.workup_appointment,
        referred_to: proformaData.referred_to,
        treatment_prescribed: proformaData.treatment_prescribed,
        doctor_decision: proformaData.doctor_decision,
        requires_adl_file: proformaData.requires_adl_file,
        adl_reasoning: proformaData.adl_reasoning,
        adl_file_id: proformaData.adl_file_id,
        case_severity: proformaData.case_severity
      };

      for (const [key, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null) {
          fields.push(key);
          values.push(value);
          paramCount++;
        }
      }

      fields.push('created_at');
      const placeholders = values.map((_, i) => `$${i + 1}`).concat(['CURRENT_TIMESTAMP']);

      const queryText = `
        INSERT INTO ${CLINICAL_PROFORMA_SCHEMA.tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await query(queryText, values);
      return new ClinicalProforma(result.rows[0]);
    } catch (error) {
      console.error('[ClinicalProforma.create] Error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const queryText = `
        SELECT 
          cp.*,
          p.name as patient_name,
          p.cr_no,
          p.psy_no,
          u.name as doctor_name,
          u.role as doctor_role
        FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} cp
        LEFT JOIN registered_patient p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        WHERE cp.id = $1
      `;

      const result = await query(queryText, [id]);
      if (result.rows.length === 0) return null;

      return new ClinicalProforma(result.rows[0]);
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

      if (filters.visit_type) {
        where.push(`cp.visit_type = $${idx++}`);
        params.push(filters.visit_type);
      }
      if (filters.doctor_decision) {
        where.push(`cp.doctor_decision = $${idx++}`);
        params.push(filters.doctor_decision);
      }
      if (filters.case_severity) {
        where.push(`cp.case_severity = $${idx++}`);
        params.push(filters.case_severity);
      }
      if (filters.requires_adl_file !== undefined) {
        where.push(`cp.requires_adl_file = $${idx++}`);
        params.push(filters.requires_adl_file);
      }
      if (filters.filled_by) {
        where.push(`cp.filled_by = $${idx++}`);
        params.push(filters.filled_by);
      }
      if (filters.room_no) {
        where.push(`cp.room_no = $${idx++}`);
        params.push(filters.room_no);
      }
      if (filters.date_from) {
        where.push(`cp.visit_date >= $${idx++}`);
        params.push(filters.date_from);
      }
      if (filters.date_to) {
        where.push(`cp.visit_date <= $${idx++}`);
        params.push(filters.date_to);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const queryText = `
        SELECT 
          cp.*,
          p.name as patient_name,
          p.cr_no,
          p.psy_no,
          u.name as doctor_name,
          u.role as doctor_role
        FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} cp
        LEFT JOIN registered_patient p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        ${whereClause}
        ORDER BY cp.visit_date DESC, cp.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      const countQuery = `
        SELECT COUNT(*) as cnt FROM clinical_proforma cp ${whereClause}
      `;
      const countParams = params.slice(0, params.length - 2);

      const [result, countResult] = await Promise.all([
        query(queryText, params),
        query(countQuery, countParams)
      ]);

      const proformas = result.rows.map(row => new ClinicalProforma(row));
      const total = parseInt(countResult.rows[0].cnt, 10);

      return {
        proformas: proformas.map(p => p.toJSON()),
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

  static async findByFilledBy(filledBy, page = 1, limit = 10) {
    try {
      return await this.findAll(page, limit, { filled_by: filledBy });
    } catch (error) {
      throw error;
    }
  }

  static async findComplexCases(page = 1, limit = 10) {
    try {
      return await this.findAll(page, limit, { doctor_decision: 'complex_case' });
    } catch (error) {
      throw error;
    }
  }

  static async findByPatientId(patient_id) {
    try {
      const queryText = `
        SELECT 
          cp.*,
          p.name as patient_name,
          p.cr_no,
          p.psy_no,
          u.name as doctor_name,
          u.role as doctor_role
        FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} cp
        LEFT JOIN registered_patient p ON cp.patient_id = p.id
        LEFT JOIN users u ON cp.filled_by = u.id
        WHERE cp.patient_id = $1
        ORDER BY cp.visit_date DESC
      `;

      const result = await query(queryText, [patient_id]);
      return result.rows.map(row => new ClinicalProforma(row));
    } catch (error) {
      throw error;
    }
  }

  async update(updateData) {
    try {
      const allowedFields = [
        'visit_date', 'visit_type', 'room_no', 'assigned_doctor',
        'informant_present', 'nature_of_information', 'onset_duration',
        'course', 'precipitating_factor', 'illness_duration', 'current_episode_since',
        'mood', 'behaviour', 'speech', 'thought', 'perception', 'somatic',
        'bio_functions', 'adjustment', 'cognitive_function', 'fits',
        'sexual_problem', 'substance_use', 'past_history', 'family_history',
        'associated_medical_surgical', 'mse_behaviour', 'mse_affect', 'mse_thought',
        'mse_delusions', 'mse_perception', 'mse_cognitive_function', 'gpe',
        'diagnosis', 'icd_code', 'disposal', 'workup_appointment', 'referred_to',
        'treatment_prescribed', 'doctor_decision', 'case_severity',
        'requires_adl_file', 'adl_reasoning', 'adl_file_id'
      ];

      const updates = [];
      const values = [];
      let idx = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${idx++}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await query(
        `UPDATE ${CLINICAL_PROFORMA_SCHEMA.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
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
      await query(`DELETE FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} WHERE id = $1`, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_proformas,
          COUNT(CASE WHEN doctor_decision = 'simple_case' THEN 1 END) as simple_cases,
          COUNT(CASE WHEN doctor_decision = 'complex_case' THEN 1 END) as complex_cases,
          COUNT(CASE WHEN visit_type = 'first_visit' THEN 1 END) as first_visits,
          COUNT(CASE WHEN visit_type = 'follow_up' THEN 1 END) as follow_ups
        FROM ${CLINICAL_PROFORMA_SCHEMA.tableName}
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getCasesByDecision() {
    try {
      const result = await query(`
        SELECT 
          doctor_decision,
          COUNT(*) as count
        FROM ${CLINICAL_PROFORMA_SCHEMA.tableName}
        GROUP BY doctor_decision
      `);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  static async getVisitTrends(period = 'week', userId = null) {
    try {
      let dateFilter = '';
      const params = [];
      let idx = 1;

      if (period === 'day') {
        dateFilter = `AND visit_date = CURRENT_DATE`;
      } else if (period === 'week') {
        dateFilter = `AND visit_date >= CURRENT_DATE - INTERVAL '7 days'`;
      } else if (period === 'month') {
        dateFilter = `AND visit_date >= CURRENT_DATE - INTERVAL '30 days'`;
      }

      if (userId) {
        dateFilter += ` AND filled_by = $${idx++}`;
        params.push(userId);
      }

      const queryText = `
        SELECT 
          visit_date,
          COUNT(*) as count
        FROM ${CLINICAL_PROFORMA_SCHEMA.tableName}
        WHERE 1=1 ${dateFilter}
        GROUP BY visit_date
        ORDER BY visit_date DESC
      `;

      const result = await query(queryText, params);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      filled_by: this.filled_by,
      visit_date: this.visit_date,
      visit_type: this.visit_type,
      room_no: this.room_no,
      assigned_doctor: this.assigned_doctor,
      informant_present: this.informant_present,
      nature_of_information: this.nature_of_information,
      onset_duration: this.onset_duration,
      course: this.course,
      precipitating_factor: this.precipitating_factor,
      illness_duration: this.illness_duration,
      current_episode_since: this.current_episode_since,
      mood: this.mood,
      behaviour: this.behaviour,
      speech: this.speech,
      thought: this.thought,
      perception: this.perception,
      somatic: this.somatic,
      bio_functions: this.bio_functions,
      adjustment: this.adjustment,
      cognitive_function: this.cognitive_function,
      fits: this.fits,
      sexual_problem: this.sexual_problem,
      substance_use: this.substance_use,
      past_history: this.past_history,
      family_history: this.family_history,
      associated_medical_surgical: this.associated_medical_surgical,
      mse_behaviour: this.mse_behaviour,
      mse_affect: this.mse_affect,
      mse_thought: this.mse_thought,
      mse_delusions: this.mse_delusions,
      mse_perception: this.mse_perception,
      mse_cognitive_function: this.mse_cognitive_function,
      gpe: this.gpe,
      diagnosis: this.diagnosis,
      icd_code: this.icd_code,
      disposal: this.disposal,
      workup_appointment: this.workup_appointment,
      referred_to: this.referred_to,
      treatment_prescribed: this.treatment_prescribed,
      doctor_decision: this.doctor_decision,
      requires_adl_file: this.requires_adl_file,
      adl_reasoning: this.adl_reasoning,
      adl_file_id: this.adl_file_id,
      case_severity: this.case_severity,
      created_at: this.created_at,
      patient_name: this.patient_name,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      doctor_name: this.doctor_name,
      doctor_role: this.doctor_role
    };
  }
}

module.exports = ClinicalProforma;

