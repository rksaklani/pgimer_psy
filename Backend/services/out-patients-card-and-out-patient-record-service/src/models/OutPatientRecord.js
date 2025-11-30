const { query } = require('../../../../common/database/pool');
const { OUT_PATIENT_RECORD_SCHEMA, OUT_PATIENTS_CARD_SCHEMA, USER_SCHEMA } = require('../../../../common/utils/schemas');

class OutPatientRecord {
  constructor(data = {}) {
    this.id = data.id || null;
    this.cr_no = data.cr_no || null;
    this.psy_no = data.psy_no || null;
    this.special_clinic_no = data.special_clinic_no || null;
    this.seen_in_walk_in_on = data.seen_in_walk_in_on || null;
    this.worked_up_on = data.worked_up_on || null;
    this.marital_status = data.marital_status || null;
    this.year_of_marriage = data.year_of_marriage || null;
    this.no_of_children_male = data.no_of_children_male || 0;
    this.no_of_children_female = data.no_of_children_female || 0;
    this.occupation = data.occupation || null;
    this.education = data.education || null;
    this.locality = data.locality || null;
    this.patient_income = data.patient_income || null;
    this.family_income = data.family_income || null;
    this.religion = data.religion || null;
    this.family_type = data.family_type || null;
    this.head_name = data.head_name || null;
    this.head_age = data.head_age || null;
    this.head_relationship = data.head_relationship || null;
    this.head_education = data.head_education || null;
    this.head_occupation = data.head_occupation || null;
    this.head_income = data.head_income || null;
    this.distance_from_hospital = data.distance_from_hospital || null;
    this.mobility = data.mobility || null;
    this.referred_by = data.referred_by || null;
    this.address_line = data.address_line || null;
    this.country = data.country || null;
    this.state = data.state || null;
    this.district = data.district || null;
    this.city = data.city || null;
    this.pin_code = data.pin_code || null;
    this.present_address_line_ = data.present_address_line_ || null;
    this.present_city_town_village = data.present_city_town_village || null;
    this.present_district = data.present_district || null;
    this.present_state = data.present_state || null;
    this.present_pin_code = data.present_pin_code || null;
    this.present_country = data.present_country || null;
    this.local_address = data.local_address || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_id = data.assigned_doctor_id || null;
    this.assigned_room = data.assigned_room || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async create(recordData) {
    try {
      // Verify that out_patients_card exists
      const cardCheck = await query(
        `SELECT cr_no FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} WHERE cr_no = $1`,
        [recordData.cr_no]
      );

      if (cardCheck.rows.length === 0) {
        throw new Error(`Out Patients Card with cr_no ${recordData.cr_no} does not exist`);
      }

      const result = await query(
        `INSERT INTO ${OUT_PATIENT_RECORD_SCHEMA.tableName} 
         (cr_no, psy_no, special_clinic_no, seen_in_walk_in_on, worked_up_on, marital_status,
          year_of_marriage, no_of_children_male, no_of_children_female, occupation, education,
          locality, patient_income, family_income, religion, family_type, head_name, head_age,
          head_relationship, head_education, head_occupation, head_income, distance_from_hospital,
          mobility, referred_by, address_line, country, state, district, city, pin_code,
          present_address_line_, present_city_town_village, present_district, present_state,
          present_pin_code, present_country, local_address, assigned_doctor_name, assigned_doctor_id, assigned_room)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37, $38, $39, $40)
         RETURNING *`,
        [
          recordData.cr_no,
          recordData.psy_no,
          recordData.special_clinic_no,
          recordData.seen_in_walk_in_on,
          recordData.worked_up_on,
          recordData.marital_status,
          recordData.year_of_marriage,
          recordData.no_of_children_male || 0,
          recordData.no_of_children_female || 0,
          recordData.occupation,
          recordData.education,
          recordData.locality,
          recordData.patient_income,
          recordData.family_income,
          recordData.religion,
          recordData.family_type,
          recordData.head_name,
          recordData.head_age,
          recordData.head_relationship,
          recordData.head_education,
          recordData.head_occupation,
          recordData.head_income,
          recordData.distance_from_hospital,
          recordData.mobility,
          recordData.referred_by,
          recordData.address_line,
          recordData.country,
          recordData.state,
          recordData.district,
          recordData.city,
          recordData.pin_code,
          recordData.present_address_line_,
          recordData.present_city_town_village,
          recordData.present_district,
          recordData.present_state,
          recordData.present_pin_code,
          recordData.present_country,
          recordData.local_address,
          recordData.assigned_doctor_name,
          recordData.assigned_doctor_id,
          recordData.assigned_room
        ]
      );
      return new OutPatientRecord(result.rows[0]);
    } catch (error) {
      console.error('[OutPatientRecord.create] Error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        `SELECT opr.*, opc.name, opc.mobile_no, opc.age, opc.sex, opc.category,
                u.name as assigned_doctor_name, u.role as assigned_doctor_role
         FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr
         LEFT JOIN ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc ON opr.cr_no = opc.cr_no
         LEFT JOIN ${USER_SCHEMA.tableName} u ON opr.assigned_doctor_id = u.id
         WHERE opr.id = $1`,
        [id]
      );
      return result.rows.length > 0 ? new OutPatientRecord(result.rows[0]) : null;
    } catch (error) {
      console.error('[OutPatientRecord.findById] Error:', error);
      throw error;
    }
  }

  static async findByCRNo(cr_no) {
    try {
      const result = await query(
        `SELECT opr.*, opc.name, opc.mobile_no, opc.age, opc.sex, opc.category,
                u.name as assigned_doctor_name, u.role as assigned_doctor_role
         FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr
         LEFT JOIN ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc ON opr.cr_no = opc.cr_no
         LEFT JOIN ${USER_SCHEMA.tableName} u ON opr.assigned_doctor_id = u.id
         WHERE opr.cr_no = $1`,
        [cr_no]
      );
      return result.rows.length > 0 ? new OutPatientRecord(result.rows[0]) : null;
    } catch (error) {
      console.error('[OutPatientRecord.findByCRNo] Error:', error);
      throw error;
    }
  }

  static async update(id, recordData) {
    try {
      const updates = [];
      const values = [];
      let idx = 1;

      const allowedFields = [
        'psy_no', 'special_clinic_no', 'seen_in_walk_in_on', 'worked_up_on', 'marital_status',
        'year_of_marriage', 'no_of_children_male', 'no_of_children_female', 'occupation', 'education',
        'locality', 'patient_income', 'family_income', 'religion', 'family_type', 'head_name', 'head_age',
        'head_relationship', 'head_education', 'head_occupation', 'head_income', 'distance_from_hospital',
        'mobility', 'referred_by', 'address_line', 'country', 'state', 'district', 'city', 'pin_code',
        'present_address_line_', 'present_city_town_village', 'present_district', 'present_state',
        'present_pin_code', 'present_country', 'local_address', 'assigned_doctor_name', 'assigned_doctor_id', 'assigned_room'
      ];

      for (const [key, value] of Object.entries(recordData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${idx++}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(id);

      const result = await query(
        `UPDATE ${OUT_PATIENT_RECORD_SCHEMA.tableName} 
         SET ${updates.join(', ')} 
         WHERE id = $${idx} 
         RETURNING *`,
        values
      );

      return result.rows.length > 0 ? new OutPatientRecord(result.rows[0]) : null;
    } catch (error) {
      console.error('[OutPatientRecord.update] Error:', error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      const values = [];
      let idx = 1;

      if (filters.cr_no) {
        conditions.push(`opr.cr_no = $${idx++}`);
        values.push(filters.cr_no);
      }
      if (filters.psy_no) {
        conditions.push(`opr.psy_no = $${idx++}`);
        values.push(filters.psy_no);
      }
      if (filters.assigned_doctor_id) {
        conditions.push(`opr.assigned_doctor_id = $${idx++}`);
        values.push(filters.assigned_doctor_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await query(
        `SELECT opr.*, opc.name, opc.mobile_no, opc.age, opc.sex, opc.category,
                u.name as assigned_doctor_name, u.role as assigned_doctor_role
         FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr
         LEFT JOIN ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc ON opr.cr_no = opc.cr_no
         LEFT JOIN ${USER_SCHEMA.tableName} u ON opr.assigned_doctor_id = u.id
         ${whereClause}
         ORDER BY opr.created_at DESC 
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset]
      );

      const countResult = await query(
        `SELECT COUNT(*) as total FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr ${whereClause}`,
        values
      );

      return {
        records: result.rows.map(row => new OutPatientRecord(row)),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total, 10),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limit)
        }
      };
    } catch (error) {
      console.error('[OutPatientRecord.findAll] Error:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      special_clinic_no: this.special_clinic_no,
      seen_in_walk_in_on: this.seen_in_walk_in_on,
      worked_up_on: this.worked_up_on,
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
      head_name: this.head_name,
      head_age: this.head_age,
      head_relationship: this.head_relationship,
      head_education: this.head_education,
      head_occupation: this.head_occupation,
      head_income: this.head_income,
      distance_from_hospital: this.distance_from_hospital,
      mobility: this.mobility,
      referred_by: this.referred_by,
      address_line: this.address_line,
      country: this.country,
      state: this.state,
      district: this.district,
      city: this.city,
      pin_code: this.pin_code,
      present_address_line_: this.present_address_line_,
      present_city_town_village: this.present_city_town_village,
      present_district: this.present_district,
      present_state: this.present_state,
      present_pin_code: this.present_pin_code,
      present_country: this.present_country,
      local_address: this.local_address,
      assigned_doctor_name: this.assigned_doctor_name,
      assigned_doctor_id: this.assigned_doctor_id,
      assigned_room: this.assigned_room,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = OutPatientRecord;

