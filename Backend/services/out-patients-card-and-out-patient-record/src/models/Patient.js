const { query, getClient } = require('../../../../common/database/pool');
const { PATIENT_SCHEMA, PATIENT_VISIT_SCHEMA, USER_SCHEMA, CLINICAL_PROFORMA_SCHEMA, OUTPATIENT_INTAKE_RECORD_SCHEMA, PRESCRIPTION_SCHEMA } = require('../../../../common/utils/schemas');

class Patient {
  constructor(data = {}) {
    this.id = data.id || null;
    this.cr_no = data.cr_no || null;
    this.psy_no = data.psy_no || null;
    this.outpatient_intake_record_no = data.outpatient_intake_record_no || data.adl_no || null; // Support both for backward compatibility
    this.adl_no = this.outpatient_intake_record_no; // Legacy alias
    this.special_clinic_no = data.special_clinic_no || null;
    this.date = data.date || null;
    this.name = data.name || null;
    this.age = data.age || null;
    this.sex = data.sex || null;
    this.category = data.category || null;
    this.father_name = data.father_name || null;
    this.department = data.department || null;
    this.unit_consit = data.unit_consit || null;
    this.room_no = data.room_no || null;
    this.serial_no = data.serial_no || null;
    this.file_no = data.file_no || null;
    this.unit_days = data.unit_days || null;
    this.contact_number = data.contact_number || null;
    this.seen_in_walk_in_on = data.seen_in_walk_in_on || null;
    this.worked_up_on = data.worked_up_on || null;
    this.age_group = data.age_group || null;
    this.marital_status = data.marital_status || null;
    this.year_of_marriage = data.year_of_marriage || null;
    this.no_of_children_male = data.no_of_children_male || null;
    this.no_of_children_female = data.no_of_children_female || null;
    this.occupation = data.occupation || null;
    this.education = data.education || null;
    this.locality = data.locality || null;
    this.patient_income = data.patient_income || null;
    this.family_income = data.family_income || null;
    this.religion = data.religion || null;
    this.family_type = data.family_type || null;
    this.head_name = data.head_name || data.father_name || null;
    this.head_age = data.head_age || null;
    this.head_relationship = data.head_relationship || null;
    this.head_education = data.head_education || null;
    this.head_occupation = data.head_occupation || null;
    this.head_income = data.head_income || null;
    this.distance_from_hospital = data.distance_from_hospital || null;
    this.mobility = data.mobility || null;
    this.referred_by = data.referred_by || null;
    this.assigned_room = data.assigned_room || null;
    this.address_line = data.address_line || null;
    this.country = data.country || null;
    this.state = data.state || null;
    this.district = data.district || null;
    this.city = data.city || null;
    this.pin_code = data.pin_code || null;
    this.permanent_address_line_1 = data.permanent_address_line_1 || null;
    this.permanent_city_town_village = data.permanent_city_town_village || null;
    this.permanent_district = data.permanent_district || null;
    this.permanent_state = data.permanent_state || null;
    this.permanent_pin_code = data.permanent_pin_code || null;
    this.permanent_country = data.permanent_country || null;
    this.present_address_line_1 = data.present_address_line_1 || null;
    this.present_address_line_2 = data.present_address_line_2 || null;
    this.present_city_town_village = data.present_city_town_village || null;
    this.present_city_town_village_2 = data.present_city_town_village_2 || null;
    this.present_district = data.present_district || null;
    this.present_district_2 = data.present_district_2 || null;
    this.present_state = data.present_state || null;
    this.present_state_2 = data.present_state_2 || null;
    this.present_pin_code = data.present_pin_code || null;
    this.present_pin_code_2 = data.present_pin_code_2 || null;
    this.present_country = data.present_country || null;
    this.present_country_2 = data.present_country_2 || null;
    this.local_address = data.local_address || null;
    this.has_outpatient_intake_record = data.has_outpatient_intake_record !== undefined ? data.has_outpatient_intake_record : (data.has_adl_file || false);
    this.has_adl_file = this.has_outpatient_intake_record; // Legacy alias
    this.file_status = data.file_status || null;
    this.case_complexity = data.case_complexity || null;
    this.filled_by = data.filled_by || null;
    this.filled_by_name = data.filled_by_name || null;
    this.filled_by_role = data.filled_by_role || null;
    this.patient_files = data.patient_files || [];
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    this.patient_name = data.patient_name || this.name || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.last_assigned_date = data.last_assigned_date || null;
    this.assigned_doctor_id = data.assigned_doctor_id || null;
  }

  static generateCRNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `CR${year}${timestamp}`;
  }

  static generatePSYNo() {
    const year = new Date().getFullYear();
    const timestamp = Date.now().toString().slice(-6);
    return `PSY${year}${timestamp}`;
  }

  static generateADLNo() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `ADL${year}${random}`;
  }

  static async create(patientData) {
    try {
      const { name, sex, age, assigned_room, cr_no, psy_no, filled_by } = patientData;

      if (!name || name.trim() === '') {
        throw new Error('Patient name is required');
      }

      const final_cr_no = cr_no || Patient.generateCRNo();
      const final_psy_no = psy_no || Patient.generatePSYNo();

      const fields = ['cr_no', 'psy_no', 'name', 'created_at'];
      const placeholders = ['$1', '$2', '$3', 'CURRENT_TIMESTAMP'];
      const values = [final_cr_no, final_psy_no, name.trim()];
      let paramCount = 3;

      if (sex !== undefined && sex !== null && sex !== '') {
        fields.push('sex');
        placeholders.push(`$${++paramCount}`);
        values.push(sex);
      }

      if (age !== undefined && age !== null && age !== '') {
        fields.push('age');
        placeholders.push(`$${++paramCount}`);
        values.push(age);
      }

      // Add other optional fields
      const optionalFields = {
        date: patientData.date,
        contact_number: patientData.contact_number,
        category: patientData.category,
        father_name: patientData.father_name,
        department: patientData.department,
        unit_consit: patientData.unit_consit,
        room_no: patientData.room_no,
        serial_no: patientData.serial_no,
        file_no: patientData.file_no,
        unit_days: patientData.unit_days,
        assigned_room: assigned_room,
        filled_by: filled_by,
        // Add all other fields from patientData
        ...Object.fromEntries(
          Object.entries(patientData).filter(([key]) => 
            !['name', 'sex', 'age', 'cr_no', 'psy_no'].includes(key)
          )
        )
      };

      for (const [fieldName, fieldValue] of Object.entries(optionalFields)) {
        if (fieldValue !== undefined && fieldValue !== null && fieldValue !== '') {
          fields.push(fieldName);
          placeholders.push(`$${++paramCount}`);
          values.push(fieldValue);
        }
      }

      const queryText = `
        INSERT INTO ${PATIENT_SCHEMA.tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await query(queryText, values);
      return new Patient(result.rows[0]);
    } catch (error) {
      console.error('[Patient.create] Error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      if (!id) return null;
      const patientId = parseInt(id, 10);
      if (isNaN(patientId) || patientId <= 0) return null;

      const queryText = `
        SELECT 
          p.*,
          (SELECT u.role FROM ${USER_SCHEMA.tableName} u WHERE u.id = p.filled_by LIMIT 1) AS filled_by_role,
          (SELECT u.name FROM ${USER_SCHEMA.tableName} u WHERE u.id = p.filled_by LIMIT 1) AS filled_by_name,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END AS has_adl_file,
          CASE WHEN af.id IS NOT NULL THEN 'complex' ELSE 'simple' END AS case_complexity,
          COALESCE(
            p.assigned_doctor_id,
            (SELECT pv.assigned_doctor_id FROM ${PATIENT_VISIT_SCHEMA.tableName} pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1)
          ) AS assigned_doctor_id,
          COALESCE(
            NULLIF(NULLIF(p.assigned_doctor_name, ''), 'Unknown Doctor'),
            (SELECT u.name FROM ${USER_SCHEMA.tableName} u WHERE u.id = COALESCE(p.assigned_doctor_id, (SELECT pv.assigned_doctor_id FROM ${PATIENT_VISIT_SCHEMA.tableName} pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1)) LIMIT 1)
          ) AS assigned_doctor_name,
          (SELECT u.role FROM ${USER_SCHEMA.tableName} u WHERE u.id = COALESCE(p.assigned_doctor_id, (SELECT pv.assigned_doctor_id FROM ${PATIENT_VISIT_SCHEMA.tableName} pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1)) LIMIT 1) AS assigned_doctor_role,
          (SELECT pv.visit_date FROM ${PATIENT_VISIT_SCHEMA.tableName} pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1) AS last_assigned_date
        FROM ${PATIENT_SCHEMA.tableName} p
        LEFT JOIN ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af ON af.patient_id = p.id
        WHERE p.id = $1
        LIMIT 1
      `;

      const result = await query(queryText, [patientId]);
      if (result.rows.length === 0) return null;

      return new Patient(result.rows[0]);
    } catch (error) {
      console.error('[Patient.findById] Error:', error);
      throw error;
    }
  }

  static async findByCRNo(cr_no) {
    try {
      const result = await query(`SELECT * FROM ${PATIENT_SCHEMA.tableName} WHERE cr_no = $1`, [cr_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByPSYNo(psy_no) {
    try {
      const result = await query(`SELECT * FROM ${PATIENT_SCHEMA.tableName} WHERE psy_no = $1`, [psy_no]);
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByADLNo(adl_no) {
    try {
      // Support both new and legacy column names
      const result = await query(
        `SELECT * FROM ${PATIENT_SCHEMA.tableName} WHERE outpatient_intake_record_no = $1 OR adl_no = $1`, 
        [adl_no]
      );
      if (result.rows.length === 0) return null;
      return new Patient(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }
  
  static async findByOutpatientIntakeRecordNo(outpatient_intake_record_no) {
    return this.findByADLNo(outpatient_intake_record_no);
  }

  static async search(searchTerm = '', page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = `%${searchTerm}%`;

      const queryText = `
        SELECT
          p.*,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity
        FROM ${PATIENT_SCHEMA.tableName} p
        LEFT JOIN ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af ON af.patient_id = p.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.outpatient_intake_record_no ILIKE $1 OR p.adl_no ILIKE $1
        GROUP BY p.id, af.id
        ORDER BY p.created_at DESC
        LIMIT $2 OFFSET $3
      `;

      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM ${PATIENT_SCHEMA.tableName} p
        LEFT JOIN ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af ON af.patient_id = p.id
        WHERE p.name ILIKE $1 OR p.cr_no ILIKE $1 OR p.psy_no ILIKE $1 OR p.outpatient_intake_record_no ILIKE $1 OR p.adl_no ILIKE $1
      `;

      const [result, countResult] = await Promise.all([
        query(queryText, [searchPattern, limit, offset]),
        query(countQuery, [searchPattern])
      ]);

      const total = parseInt(countResult.rows[0].cnt, 10);
      const patients = result.rows.map(row => new Patient(row));

      return {
        patients: patients.map(p => p.toJSON()),
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('[Patient.search] Error:', error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = [];
      const params = [];
      let idx = 1;

      if (filters.sex) {
        where.push(`p.sex = $${idx++}`);
        params.push(filters.sex);
      }
      if (filters.case_complexity) {
        if (filters.case_complexity === 'complex') {
          where.push(`(p.case_complexity = 'complex' OR af.id IS NOT NULL)`);
        } else {
          where.push(`p.case_complexity = $${idx++}`);
          params.push(filters.case_complexity);
        }
      }
      if (filters.has_outpatient_intake_record !== undefined || filters.has_adl_file !== undefined) {
        const hasFile = filters.has_outpatient_intake_record !== undefined ? filters.has_outpatient_intake_record : filters.has_adl_file;
        if (hasFile) {
          where.push(`(p.has_outpatient_intake_record = true OR p.has_adl_file = true OR af.id IS NOT NULL)`);
        } else {
          where.push(`(p.has_outpatient_intake_record = false AND p.has_adl_file = false AND af.id IS NULL)`);
        }
      }
      if (filters.file_status) {
        where.push(`p.file_status = $${idx++}`);
        params.push(filters.file_status);
      }
      if (filters.assigned_room) {
        where.push(`p.assigned_room = $${idx++}`);
        params.push(filters.assigned_room);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const queryText = `
        SELECT 
          p.*,
          CASE WHEN af.id IS NOT NULL THEN true ELSE COALESCE(p.has_adl_file, false) END as has_adl_file,
          CASE 
            WHEN af.id IS NOT NULL THEN 'complex'
            WHEN p.case_complexity IS NOT NULL THEN p.case_complexity
            ELSE 'simple'
          END as case_complexity,
          COALESCE(
            p.assigned_doctor_id,
            (SELECT pv.assigned_doctor_id FROM ${PATIENT_VISIT_SCHEMA.tableName} pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1)
          ) AS assigned_doctor_id,
          COALESCE(
            NULLIF(NULLIF(p.assigned_doctor_name, ''), 'Unknown Doctor'),
            (SELECT u.name FROM ${USER_SCHEMA.tableName} u WHERE u.id = COALESCE(p.assigned_doctor_id, (SELECT pv.assigned_doctor_id FROM ${PATIENT_VISIT_SCHEMA.tableName} pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1)) LIMIT 1)
          ) AS assigned_doctor_name,
          (SELECT u.role FROM users u WHERE u.id = COALESCE(p.assigned_doctor_id, (SELECT pv.assigned_doctor_id FROM patient_visits pv WHERE pv.patient_id = p.id ORDER BY pv.visit_date DESC LIMIT 1)) LIMIT 1) AS assigned_doctor_role,
          (SELECT u.name FROM ${USER_SCHEMA.tableName} u WHERE u.id = p.filled_by LIMIT 1) AS filled_by_name,
          (SELECT u.role FROM users u WHERE u.id = p.filled_by LIMIT 1) AS filled_by_role
        FROM ${PATIENT_SCHEMA.tableName} p
        LEFT JOIN ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af ON af.patient_id = p.id
        ${whereClause}
        GROUP BY p.id, af.id
        ORDER BY p.created_at DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      const countParams = params.slice(0, params.length - 2);
      const countQuery = `
        SELECT COUNT(DISTINCT p.id) as cnt FROM ${PATIENT_SCHEMA.tableName} p
        LEFT JOIN ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af ON af.patient_id = p.id
        ${whereClause}
      `;

      const [patientsResult, countResult] = await Promise.all([
        query(queryText, params),
        query(countQuery, countParams)
      ]);

      const patients = patientsResult.rows.map(r => {
        const patient = new Patient(r);
        const doctorName = r.assigned_doctor_name && r.assigned_doctor_name !== 'Unknown Doctor' 
          ? r.assigned_doctor_name 
          : null;
        patient.assigned_doctor_name = doctorName;
        patient.assigned_doctor_role = r.assigned_doctor_role || null;
        if (r.filled_by_name) patient.filled_by_name = r.filled_by_name;
        if (r.filled_by_role) patient.filled_by_role = r.filled_by_role;
        if (r.assigned_doctor_id) patient.assigned_doctor_id = r.assigned_doctor_id;
        return patient.toJSON();
      });
      
      const total = parseInt(countResult.rows[0].cnt, 10);

      return {
        patients,
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

  async update(updateData = {}) {
    try {
      const allowedFields = [
        'name', 'sex', 'age', 'date', 'contact_number', 'category', 'father_name',
        'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
        'seen_in_walk_in_on', 'worked_up_on', 'age_group',
        'marital_status', 'year_of_marriage', 'no_of_children_male', 'no_of_children_female',
        'occupation', 'education', 'locality','patient_income', 'family_income', 
        'religion', 'family_type',
        'head_name', 'head_age', 'head_relationship', 
        'head_education', 'head_occupation', 'head_income',
        'distance_from_hospital', 'mobility', 'referred_by',
        'address_line', 'country', 'state', 'district', 'city', 'pin_code',
        'permanent_address_line_1', 'permanent_city_town_village',
        'permanent_district', 'permanent_state', 'permanent_pin_code', 'permanent_country',
        'present_address_line_1', 'present_address_line_2', 'present_city_town_village', 'present_city_town_village_2',
        'present_district', 'present_district_2', 'present_state', 'present_state_2',
        'present_pin_code', 'present_pin_code_2', 'present_country', 'present_country_2',
        'local_address',
        'assigned_room', 'assigned_doctor_id', 'assigned_doctor_name', 'file_status', 'has_outpatient_intake_record', 'has_adl_file', 
        'special_clinic_no', 'psy_no'
      ];

      const updates = [];
      const values = [];
      let idx = 1;

      for (const [k, v] of Object.entries(updateData)) {
        if (allowedFields.includes(k) && v !== undefined) {
          updates.push(`${k} = $${idx++}`);
          values.push(v);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await query(
        `UPDATE ${PATIENT_SCHEMA.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
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
    const client = await getClient();
    try {
      await client.query('BEGIN');
      
      const clinicalProformasResult = await client.query(
        `SELECT id FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} WHERE patient_id = $1`,
        [this.id]
      );
      
      const clinicalProformaIds = clinicalProformasResult.rows.map(cp => cp.id);
      
      if (clinicalProformaIds.length > 0) {
        await client.query(
          `DELETE FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE clinical_proforma_id = ANY($1)`,
          [clinicalProformaIds]
        );
      }
      
      await client.query(`DELETE FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} WHERE patient_id = $1`, [this.id]);
      await client.query(`DELETE FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} WHERE patient_id = $1`, [this.id]);
      await client.query(`DELETE FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE patient_id = $1`, [this.id]);
      await client.query(`DELETE FROM ${PATIENT_VISIT_SCHEMA.tableName} WHERE patient_id = $1`, [this.id]);
      await client.query(`DELETE FROM ${PATIENT_SCHEMA.tableName} WHERE id = $1`, [this.id]);
      
      await client.query('COMMIT');
      return true;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_patients,
          COUNT(CASE WHEN sex = 'M' THEN 1 END) as male_patients,
          COUNT(CASE WHEN sex = 'F' THEN 1 END) as female_patients,
          COUNT(CASE WHEN sex NOT IN ('M','F') THEN 1 END) as other_patients,
          COUNT(CASE WHEN has_outpatient_intake_record = true OR has_adl_file = true THEN 1 END) as patients_with_outpatient_intake_record,
          COUNT(CASE WHEN has_adl_file = true THEN 1 END) as patients_with_adl, // Legacy alias
          COUNT(CASE WHEN case_complexity = 'complex' THEN 1 END) as complex_cases,
          COUNT(CASE WHEN case_complexity = 'simple' THEN 1 END) as simple_cases
        FROM ${PATIENT_SCHEMA.tableName}
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getAgeDistribution() {
    try {
      const result = await query(`
        WITH age_groups AS (
          SELECT 
            CASE 
              WHEN age < 18 THEN 'Under 18'
              WHEN age BETWEEN 18 AND 25 THEN '18-25'
              WHEN age BETWEEN 26 AND 35 THEN '26-35'
              WHEN age BETWEEN 36 AND 45 THEN '36-45'
              WHEN age BETWEEN 46 AND 55 THEN '46-55'
              WHEN age BETWEEN 56 AND 65 THEN '56-65'
              WHEN age > 65 THEN '65+'
              ELSE 'Unknown'
            END as age_group
          FROM ${PATIENT_SCHEMA.tableName}
          WHERE age IS NOT NULL
        )
        SELECT 
          age_group,
          COUNT(*) as count
        FROM age_groups
        GROUP BY age_group
        ORDER BY 
          CASE age_group
            WHEN 'Under 18' THEN 1
            WHEN '18-25' THEN 2
            WHEN '26-35' THEN 3
            WHEN '36-45' THEN 4
            WHEN '46-55' THEN 5
            WHEN '56-65' THEN 6
            WHEN '65+' THEN 7
            ELSE 8
          END
      `);
      return result.rows;
    } catch (error) {
      console.error('[Patient.getAgeDistribution] Error:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      outpatient_intake_record_no: this.outpatient_intake_record_no,
      adl_no: this.adl_no, // Legacy alias
      special_clinic_no: this.special_clinic_no,
      date: this.date,
      name: this.name,
      age: this.age,
      sex: this.sex,
      category: this.category,
      father_name: this.father_name,
      department: this.department,
      unit_consit: this.unit_consit,
      room_no: this.room_no,
      serial_no: this.serial_no,
      file_no: this.file_no,
      unit_days: this.unit_days,
      contact_number: this.contact_number,
      seen_in_walk_in_on: this.seen_in_walk_in_on,
      worked_up_on: this.worked_up_on,
      age_group: this.age_group,
      marital_status: this.marital_status,
      year_of_marriage: this.year_of_marriage,
      no_of_children_male: this.no_of_children_male,
      no_of_children_female: this.no_of_children_female,
      occupation: this.occupation,
      education: this.education,
      locality: this.locality,
      patient_income: this.patient_income,
      family_income: this.family_income,
      religion: this.religion,
      family_type: this.family_type,
      head_name: this.head_name || this.father_name,
      head_age: this.head_age,
      head_relationship: this.head_relationship,
      head_education: this.head_education,
      head_occupation: this.head_occupation,
      head_income: this.head_income,
      distance_from_hospital: this.distance_from_hospital,
      mobility: this.mobility,
      referred_by: this.referred_by,
      assigned_room: this.assigned_room,
      address_line: this.address_line,
      country: this.country,
      state: this.state,
      district: this.district,
      city: this.city,
      pin_code: this.pin_code,
      permanent_address_line_1: this.permanent_address_line_1,
      permanent_city_town_village: this.permanent_city_town_village,
      permanent_district: this.permanent_district,
      permanent_state: this.permanent_state,
      permanent_pin_code: this.permanent_pin_code,
      permanent_country: this.permanent_country,
      present_address_line_1: this.present_address_line_1,
      present_address_line_2: this.present_address_line_2,
      present_city_town_village: this.present_city_town_village,
      present_city_town_village_2: this.present_city_town_village_2,
      present_district: this.present_district,
      present_district_2: this.present_district_2,
      present_state: this.present_state,
      present_state_2: this.present_state_2,
      present_pin_code: this.present_pin_code,
      present_pin_code_2: this.present_pin_code_2,
      present_country: this.present_country,
      present_country_2: this.present_country_2,
      local_address: this.local_address,
      has_outpatient_intake_record: this.has_outpatient_intake_record,
      has_adl_file: this.has_adl_file, // Legacy alias
      file_status: this.file_status,
      filled_by: this.filled_by,
      filled_by_name: this.filled_by_name,
      filled_by_role: this.filled_by_role,
      created_at: this.created_at,
      updated_at: this.updated_at,
      patient_files: this.patient_files || [],
      assigned_doctor_name: this.assigned_doctor_name,
      assigned_doctor_role: this.assigned_doctor_role,
      last_assigned_date: this.last_assigned_date,
      assigned_doctor_id: this.assigned_doctor_id
    };
  }
}

module.exports = Patient;

