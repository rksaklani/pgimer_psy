const { query } = require('../../../../common/database/pool');
const { OUT_PATIENTS_CARD_SCHEMA } = require('../../../../common/utils/schemas');

class OutPatientsCard {
  constructor(data = {}) {
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
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
  }

  static async create(cardData) {
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
      return new OutPatientsCard(result.rows[0]);
    } catch (error) {
      console.error('[OutPatientsCard.create] Error:', error);
      throw error;
    }
  }

  static async findByCRNo(cr_no) {
    try {
      const result = await query(
        `SELECT * FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} WHERE cr_no = $1`,
        [cr_no]
      );
      return result.rows.length > 0 ? new OutPatientsCard(result.rows[0]) : null;
    } catch (error) {
      console.error('[OutPatientsCard.findByCRNo] Error:', error);
      throw error;
    }
  }

  static async update(cr_no, cardData) {
    try {
      const updates = [];
      const values = [];
      let idx = 1;

      const allowedFields = [
        'date', 'name', 'mobile_no', 'age', 'sex', 'category', 'father_name',
        'department', 'unit_consit', 'room_no', 'serial_no', 'file_no', 'unit_days',
        'contact_number', 'address_line', 'country', 'state', 'district', 'city', 'pin_code'
      ];

      for (const [key, value] of Object.entries(cardData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          updates.push(`${key} = $${idx++}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      updates.push(`updated_at = CURRENT_TIMESTAMP`);
      values.push(cr_no);

      const result = await query(
        `UPDATE ${OUT_PATIENTS_CARD_SCHEMA.tableName} 
         SET ${updates.join(', ')} 
         WHERE cr_no = $${idx} 
         RETURNING *`,
        values
      );

      return result.rows.length > 0 ? new OutPatientsCard(result.rows[0]) : null;
    } catch (error) {
      console.error('[OutPatientsCard.update] Error:', error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      const values = [];
      let idx = 1;

      if (filters.name) {
        conditions.push(`name ILIKE $${idx++}`);
        values.push(`%${filters.name}%`);
      }
      if (filters.cr_no) {
        conditions.push(`cr_no = $${idx++}`);
        values.push(filters.cr_no);
      }
      if (filters.mobile_no) {
        conditions.push(`(mobile_no = $${idx++} OR contact_number = $${idx})`);
        values.push(filters.mobile_no);
        idx++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await query(
        `SELECT * FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} 
         ${whereClause}
         ORDER BY created_at DESC 
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset]
      );

      const countResult = await query(
        `SELECT COUNT(*) as total FROM ${OUT_PATIENTS_CARD_SCHEMA.tableName} ${whereClause}`,
        values
      );

      return {
        cards: result.rows.map(row => new OutPatientsCard(row)),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total, 10),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limit)
        }
      };
    } catch (error) {
      console.error('[OutPatientsCard.findAll] Error:', error);
      throw error;
    }
  }

  toJSON() {
    return {
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
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = OutPatientsCard;

