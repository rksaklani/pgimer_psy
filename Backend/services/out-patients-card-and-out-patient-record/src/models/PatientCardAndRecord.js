const { query, getClient } = require('../../../../common/database/pool');
const { OUT_PATIENTS_CARD_SCHEMA, OUT_PATIENT_RECORD_SCHEMA, USER_SCHEMA, CLINICAL_PROFORMA_SCHEMA, PRESCRIPTION_SCHEMA, OUTPATIENT_INTAKE_RECORD_SCHEMA, PATIENT_VISIT_SCHEMA } = require('../../../../common/utils/schemas');

/**
 * Unified Patient Card and Record Model
 * Treats out_patients_card and out_patient_record as one logical entity
 */
class PatientCardAndRecord {
  constructor(data = {}) {
    // Card fields
    this.cr_no = data.cr_no || null;
    this.date = data.date || null;
    this.name = data.name || null;
    this.mobile_no = data.mobile_no || null;
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
    this.address_line = data.address_line || null;
    this.country = data.country || null;
    this.state = data.state || null;
    this.district = data.district || null;
    this.city = data.city || null;
    this.pin_code = data.pin_code || null;
    
    // Record fields
    this.id = data.id || null;
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
    this.present_address_line_ = data.present_address_line_ || null;
    this.present_city_town_village = data.present_city_town_village || null;
    this.present_district = data.present_district || null;
    this.present_state = data.present_state || null;
    this.present_pin_code = data.present_pin_code || null;
    this.present_country = data.present_country || null;
    this.local_address = data.local_address || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_id = data.assigned_doctor_id || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.assigned_room = data.assigned_room || null;
    
    // Timestamps
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  /**
   * Create patient card (Step 1)
   */
  static async createCard(cardData) {
    try {
      const result = await query(
        `INSERT INTO ${OUT_PATIENTS_CARD_SCHEMA.tableName} 
         (cr_no, date, name, mobile_no, age, sex, category, father_name, department, 
          unit_consit, room_no, serial_no, file_no, unit_days, contact_number, 
          address_line, country, state, district, city, pin_code)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)
         RETURNING *`,
        [
          cardData.cr_no,
          cardData.date || new Date().toISOString().slice(0, 10),
          cardData.name,
          cardData.mobile_no || cardData.contact_number,
          cardData.age,
          cardData.sex,
          cardData.category,
          cardData.father_name,
          cardData.department,
          cardData.unit_consit,
          cardData.room_no,
          cardData.serial_no,
          cardData.file_no,
          cardData.unit_days,
          cardData.contact_number || cardData.mobile_no,
          cardData.address_line,
          cardData.country,
          cardData.state,
          cardData.district,
          cardData.city,
          cardData.pin_code
        ]
      );
      return new PatientCardAndRecord(result.rows[0]);
    } catch (error) {
      console.error('[PatientCardAndRecord.createCard] Error:', error);
      throw error;
    }
  }

  /**
   * Create patient record (Step 2 - requires card to exist)
   */
  static async createRecord(recordData) {
    try {
      // Verify that the patient card exists
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
      return new PatientCardAndRecord(result.rows[0]);
    } catch (error) {
      console.error('[PatientCardAndRecord.createRecord] Error:', error);
      throw error;
    }
  }

  /**
   * Find by CR No (returns unified data from both tables)
   */
  static async findByCRNo(cr_no) {
    try {
      const result = await query(
        `SELECT 
          opc.*,
          opr.id, opr.psy_no, opr.special_clinic_no, opr.seen_in_walk_in_on, opr.worked_up_on,
          opr.marital_status, opr.year_of_marriage, opr.no_of_children_male, opr.no_of_children_female,
          opr.occupation, opr.education, opr.locality, opr.patient_income, opr.family_income,
          opr.religion, opr.family_type, opr.head_name, opr.head_age, opr.head_relationship,
          opr.head_education, opr.head_occupation, opr.head_income, opr.distance_from_hospital,
          opr.mobility, opr.referred_by, opr.present_address_line_, opr.present_city_town_village,
          opr.present_district, opr.present_state, opr.present_pin_code, opr.present_country,
          opr.local_address, opr.assigned_doctor_name, opr.assigned_doctor_id, opr.assigned_room,
          u.name as assigned_doctor_name_from_user, u.role as assigned_doctor_role
         FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc
         LEFT JOIN ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr ON opc.cr_no = opr.cr_no
         LEFT JOIN ${USER_SCHEMA.tableName} u ON opr.assigned_doctor_id = u.id
         WHERE opc.cr_no = $1`,
        [cr_no]
      );
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      // Merge doctor name from user table if available
      if (row.assigned_doctor_name_from_user) {
        row.assigned_doctor_name = row.assigned_doctor_name_from_user;
      }
      return new PatientCardAndRecord(row);
    } catch (error) {
      console.error('[PatientCardAndRecord.findByCRNo] Error:', error);
      throw error;
    }
  }

  /**
   * Find by Record ID (returns unified data from both tables)
   */
  static async findById(id) {
    try {
      const result = await query(
        `SELECT 
          opc.*,
          opr.id, opr.psy_no, opr.special_clinic_no, opr.seen_in_walk_in_on, opr.worked_up_on,
          opr.marital_status, opr.year_of_marriage, opr.no_of_children_male, opr.no_of_children_female,
          opr.occupation, opr.education, opr.locality, opr.patient_income, opr.family_income,
          opr.religion, opr.family_type, opr.head_name, opr.head_age, opr.head_relationship,
          opr.head_education, opr.head_occupation, opr.head_income, opr.distance_from_hospital,
          opr.mobility, opr.referred_by, opr.present_address_line_, opr.present_city_town_village,
          opr.present_district, opr.present_state, opr.present_pin_code, opr.present_country,
          opr.local_address, opr.assigned_doctor_name, opr.assigned_doctor_id, opr.assigned_room,
          u.name as assigned_doctor_name_from_user, u.role as assigned_doctor_role
         FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr
         LEFT JOIN ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc ON opr.cr_no = opc.cr_no
         LEFT JOIN ${USER_SCHEMA.tableName} u ON opr.assigned_doctor_id = u.id
         WHERE opr.id = $1`,
        [id]
      );
      
      if (result.rows.length === 0) return null;
      
      const row = result.rows[0];
      if (row.assigned_doctor_name_from_user) {
        row.assigned_doctor_name = row.assigned_doctor_name_from_user;
      }
      return new PatientCardAndRecord(row);
    } catch (error) {
      console.error('[PatientCardAndRecord.findById] Error:', error);
      throw error;
    }
  }

  /**
   * Find all (returns unified data from both tables)
   */
  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      const values = [];
      let idx = 1;

      if (filters.name) {
        conditions.push(`opc.name ILIKE $${idx++}`);
        values.push(`%${filters.name}%`);
      }
      if (filters.cr_no) {
        conditions.push(`opc.cr_no = $${idx++}`);
        values.push(filters.cr_no);
      }
      if (filters.mobile_no) {
        conditions.push(`(opc.mobile_no = $${idx++} OR opc.contact_number = $${idx})`);
        values.push(filters.mobile_no);
        idx++;
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
        `SELECT 
          opc.*,
          opr.id, opr.psy_no, opr.special_clinic_no, opr.seen_in_walk_in_on, opr.worked_up_on,
          opr.marital_status, opr.year_of_marriage, opr.no_of_children_male, opr.no_of_children_female,
          opr.occupation, opr.education, opr.locality, opr.patient_income, opr.family_income,
          opr.religion, opr.family_type, opr.head_name, opr.head_age, opr.head_relationship,
          opr.head_education, opr.head_occupation, opr.head_income, opr.distance_from_hospital,
          opr.mobility, opr.referred_by, opr.present_address_line_, opr.present_city_town_village,
          opr.present_district, opr.present_state, opr.present_pin_code, opr.present_country,
          opr.local_address, opr.assigned_doctor_name, opr.assigned_doctor_id, opr.assigned_room,
          u.name as assigned_doctor_name_from_user, u.role as assigned_doctor_role
         FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc
         LEFT JOIN ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr ON opc.cr_no = opr.cr_no
         LEFT JOIN ${USER_SCHEMA.tableName} u ON opr.assigned_doctor_id = u.id
         ${whereClause}
         ORDER BY COALESCE(opr.created_at, opc.created_at) DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset]
      );

      const countResult = await query(
        `SELECT COUNT(DISTINCT opc.cr_no) as total 
         FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} opc
         LEFT JOIN ${OUT_PATIENT_RECORD_SCHEMA.tableName} opr ON opc.cr_no = opr.cr_no
         ${whereClause}`,
        values
      );

      const patients = result.rows.map(row => {
        if (row.assigned_doctor_name_from_user) {
          row.assigned_doctor_name = row.assigned_doctor_name_from_user;
        }
        return new PatientCardAndRecord(row);
      });

      return {
        patients,
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total, 10),
          pages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limit)
        }
      };
    } catch (error) {
      console.error('[PatientCardAndRecord.findAll] Error:', error);
      throw error;
    }
  }

  /**
   * Update (updates both card and record tables)
   */
  async update(updateData = {}) {
    try {
      const cardFields = [
        'date', 'name', 'mobile_no', 'age', 'sex', 'category', 'father_name',
        'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
        'contact_number', 'address_line', 'country', 'state', 'district', 'city', 'pin_code'
      ];
      
      const recordFields = [
        'psy_no', 'special_clinic_no', 'seen_in_walk_in_on', 'worked_up_on', 'marital_status',
        'year_of_marriage', 'no_of_children_male', 'no_of_children_female', 'occupation', 'education',
        'locality', 'patient_income', 'family_income', 'religion', 'family_type', 'head_name', 'head_age',
        'head_relationship', 'head_education', 'head_occupation', 'head_income', 'distance_from_hospital',
        'mobility', 'referred_by', 'address_line', 'country', 'state', 'district', 'city', 'pin_code',
        'present_address_line_', 'present_city_town_village', 'present_district', 'present_state',
        'present_pin_code', 'present_country', 'local_address', 'assigned_doctor_name', 'assigned_doctor_id', 'assigned_room'
      ];

      const cardData = {};
      const recordData = {};

      Object.keys(updateData).forEach(key => {
        if (cardFields.includes(key)) {
          cardData[key] = updateData[key];
        }
        if (recordFields.includes(key)) {
          recordData[key] = updateData[key];
        }
      });

      // Update card
      if (Object.keys(cardData).length > 0 && this.cr_no) {
        const cardUpdates = [];
        const cardValues = [];
        let cardIdx = 1;

        for (const [key, value] of Object.entries(cardData)) {
          if (value !== undefined) {
            cardUpdates.push(`${key} = $${cardIdx++}`);
            cardValues.push(value);
          }
        }

        if (cardUpdates.length > 0) {
          cardUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
          cardValues.push(this.cr_no);
          
          await query(
            `UPDATE ${OUT_PATIENTS_CARD_SCHEMA.tableName} 
             SET ${cardUpdates.join(', ')} 
             WHERE cr_no = $${cardIdx} 
             RETURNING *`,
            cardValues
          );
        }
      }

      // Update record if it exists
      if (Object.keys(recordData).length > 0 && this.id) {
        const recordUpdates = [];
        const recordValues = [];
        let recordIdx = 1;

        for (const [key, value] of Object.entries(recordData)) {
          if (value !== undefined) {
            recordUpdates.push(`${key} = $${recordIdx++}`);
            recordValues.push(value);
          }
        }

        if (recordUpdates.length > 0) {
          recordUpdates.push(`updated_at = CURRENT_TIMESTAMP`);
          recordValues.push(this.id);
          
          await query(
            `UPDATE ${OUT_PATIENT_RECORD_SCHEMA.tableName} 
             SET ${recordUpdates.join(', ')} 
             WHERE id = $${recordIdx} 
             RETURNING *`,
            recordValues
          );
        }
      }

      // Reload the data
      if (this.cr_no) {
        const updated = await PatientCardAndRecord.findByCRNo(this.cr_no);
        if (updated) {
          Object.assign(this, updated);
        }
      }

      return this;
    } catch (error) {
      console.error('[PatientCardAndRecord.update] Error:', error);
      throw error;
    }
  }

  /**
   * Delete (deletes both card and record with cascade)
   */
  static async delete(cr_no) {
    try {
      const client = await getClient();
      try {
        await client.query('BEGIN');
        
        // Get record first to get its ID for cascade deletion
        const recordResult = await client.query(
          `SELECT id FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} WHERE cr_no = $1`,
          [cr_no]
        );
        
        // Delete record and related data if it exists
        if (recordResult.rows.length > 0) {
          const recordId = recordResult.rows[0].id;
          
          // Get clinical proformas for this patient
          const clinicalProformasResult = await client.query(
            `SELECT id FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} WHERE patient_id = $1`,
            [recordId]
          );
          
          const clinicalProformaIds = clinicalProformasResult.rows.map(cp => cp.id);
          
          // Delete prescriptions linked to clinical proformas
          if (clinicalProformaIds.length > 0) {
            await client.query(
              `DELETE FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE clinical_proforma_id = ANY($1)`,
              [clinicalProformaIds]
            );
          }
          
          // Delete prescriptions directly linked to patient
          await client.query(
            `DELETE FROM ${PRESCRIPTION_SCHEMA.tableName} WHERE patient_id = $1`,
            [recordId]
          );
          
          // Delete intake records
          await client.query(
            `DELETE FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} WHERE patient_id = $1`,
            [recordId]
          );
          
          // Delete clinical proformas
          await client.query(
            `DELETE FROM ${CLINICAL_PROFORMA_SCHEMA.tableName} WHERE patient_id = $1`,
            [recordId]
          );
          
          // Delete patient visits
          await client.query(
            `DELETE FROM ${PATIENT_VISIT_SCHEMA.tableName} WHERE patient_id = $1`,
            [recordId]
          );
          
          // Delete the record itself
          await client.query(
            `DELETE FROM ${OUT_PATIENT_RECORD_SCHEMA.tableName} WHERE id = $1`,
            [recordId]
          );
        }
        
        // Delete the card
        const cardResult = await client.query(
          `DELETE FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} WHERE cr_no = $1 RETURNING *`,
          [cr_no]
        );
        
        await client.query('COMMIT');
        return cardResult.rows.length > 0;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      console.error('[PatientCardAndRecord.delete] Error:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      // Card fields
      cr_no: this.cr_no,
      date: this.date,
      name: this.name,
      mobile_no: this.mobile_no,
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
      address_line: this.address_line,
      country: this.country,
      state: this.state,
      district: this.district,
      city: this.city,
      pin_code: this.pin_code,
      
      // Record fields
      id: this.id,
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
      present_address_line_: this.present_address_line_,
      present_city_town_village: this.present_city_town_village,
      present_district: this.present_district,
      present_state: this.present_state,
      present_pin_code: this.present_pin_code,
      present_country: this.present_country,
      local_address: this.local_address,
      assigned_doctor_name: this.assigned_doctor_name,
      assigned_doctor_id: this.assigned_doctor_id,
      assigned_doctor_role: this.assigned_doctor_role,
      assigned_room: this.assigned_room,
      
      // Timestamps
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = PatientCardAndRecord;

