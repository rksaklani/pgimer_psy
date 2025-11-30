const { query } = require('../../../../common/database/pool');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { USER_SCHEMA, CLINICAL_PROFORMA_SCHEMA, OUTPATIENT_INTAKE_RECORD_SCHEMA, PRESCRIPTION_SCHEMA } = require('../../../../common/utils/schemas');

class User {
  constructor(data) {
    this.id = data.id;
    this.name = data.name;
    this.role = data.role;
    this.email = data.email;
    this.mobile = data.mobile;
    this.password_hash = data.password_hash;
    this.two_factor_secret = data.two_factor_secret;
    this.two_factor_enabled = data.two_factor_enabled;
    this.backup_codes = data.backup_codes;
    this.is_active = data.is_active;
    this.last_login = data.last_login;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;
  }

  static async create(userData) {
    try {
      const { name, role, email, password, mobile } = userData;
      
      const existingUser = await query(
        `SELECT id FROM ${USER_SCHEMA.tableName} WHERE email = $1`,
        [email]
      );

      if (existingUser.rows.length > 0) {
        throw new Error('User with this email already exists');
      }

      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const password_hash = await bcrypt.hash(password, saltRounds);

      const result = await query(
        `INSERT INTO ${USER_SCHEMA.tableName} (name, role, email, password_hash, mobile) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING id, name, role, email, mobile, created_at`,
        [name, role, email, password_hash, mobile]
      );

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        `SELECT * FROM ${USER_SCHEMA.tableName} WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByEmail(email) {
    try {
      const result = await query(
        `SELECT * FROM ${USER_SCHEMA.tableName} WHERE email = $1`,
        [email]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new User(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10, role = null) {
    try {
      const offset = (page - 1) * limit;
      let queryText = `SELECT id, name, role, email, mobile, created_at FROM ${USER_SCHEMA.tableName}`;
      let countQuery = `SELECT COUNT(*) FROM ${USER_SCHEMA.tableName}`;
      const params = [];
      let paramCount = 0;

      if (role) {
        paramCount++;
        queryText += ` WHERE role = $${paramCount}`;
        countQuery += ` WHERE role = $${paramCount}`;
        params.push(role);
      }

      queryText += ` ORDER BY created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
      params.push(limit, offset);

      const [usersResult, countResult] = await Promise.all([
        query(queryText, params),
        query(countQuery, role ? [role] : [])
      ]);

      const users = usersResult.rows.map(row => new User(row));
      const total = parseInt(countResult.rows[0].count);

      return {
        users,
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
      const allowedFields = ['name', 'role', 'email', 'mobile'];
      const updates = [];
      const values = [];
      let paramCount = 0;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          paramCount++;
          updates.push(`${key} = $${paramCount}`);
          values.push(value);
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      paramCount++;
      values.push(this.id);

      const result = await query(
        `UPDATE ${USER_SCHEMA.tableName} SET ${updates.join(', ')} 
         WHERE id = $${paramCount} 
         RETURNING id, name, role, email, mobile, created_at`,
        values
      );

      if (result.rows.length > 0) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  async activate() {
    try {
      const result = await query(
        `UPDATE ${USER_SCHEMA.tableName} SET is_active = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, role, mobile, is_active, created_at`,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_active = true;
        return this;
      }
      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }

  async deactivate() {
    try {
      const result = await query(
        `UPDATE ${USER_SCHEMA.tableName} SET is_active = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, name, email, role, is_active, created_at`,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.is_active = false;
        return this;
      }
      throw new Error('User not found');
    } catch (error) {
      throw error;
    }
  }

  async changePassword(currentPassword, newPassword) {
    try {
      const isValidPassword = await bcrypt.compare(currentPassword, this.password_hash);
      if (!isValidPassword) {
        throw new Error('Current password is incorrect');
      }

      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      await query(
        `UPDATE ${USER_SCHEMA.tableName} SET password_hash = $1 WHERE id = $2`,
        [newPasswordHash, this.id]
      );

      this.password_hash = newPasswordHash;
      return true;
    } catch (error) {
      throw error;
    }
  }

  async updatePassword(newPassword) {
    try {
      const saltRounds = parseInt(process.env.BCRYPT_ROUNDS) || 12;
      const newPasswordHash = await bcrypt.hash(newPassword, saltRounds);

      await query(
        `UPDATE ${USER_SCHEMA.tableName} SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
        [newPasswordHash, this.id]
      );

      this.password_hash = newPasswordHash;
      return true;
    } catch (error) {
      throw error;
    }
  }

  async verifyPassword(password) {
    try {
      return await bcrypt.compare(password, this.password_hash);
    } catch (error) {
      throw error;
    }
  }

  generateToken() {
    try {
      return jwt.sign(
        {
          userId: this.id,
          email: this.email,
          role: this.role
        },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRE || '7d' }
      );
    } catch (error) {
      throw error;
    }
  }

  async delete() {
    try {
      await query(`UPDATE ${CLINICAL_PROFORMA_SCHEMA.tableName} SET filled_by = NULL WHERE filled_by = $1`, [this.id]);
      await query(`UPDATE ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} SET created_by = NULL WHERE created_by = $1`, [this.id]);
      await query(`UPDATE ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} SET last_accessed_by = NULL WHERE last_accessed_by = $1`, [this.id]);
      await query('UPDATE patient_assignments SET assigned_doctor = NULL WHERE assigned_doctor = $1', [this.id]);
      await query('UPDATE audit_logs SET changed_by = NULL WHERE changed_by = $1', [this.id]);
      await query(`UPDATE ${PRESCRIPTION_SCHEMA.tableName} SET filled_by = NULL WHERE filled_by = $1`, [this.id]);
      await query(`DELETE FROM ${USER_SCHEMA.tableName} WHERE id = $1`, [this.id]);
      
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          role,
          COUNT(*) as count
        FROM ${USER_SCHEMA.tableName} 
        GROUP BY role
        ORDER BY role
      `);

      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  async updateLastLogin() {
    try {
      await query(
        `UPDATE ${USER_SCHEMA.tableName} SET last_login = CURRENT_TIMESTAMP WHERE id = $1`,
        [this.id]
      );
      this.last_login = new Date().toISOString();
      return true;
    } catch (error) {
      throw error;
    }
  }

  async enable2FA() {
    try {
      const result = await query(
        `UPDATE ${USER_SCHEMA.tableName} SET two_factor_enabled = true, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING two_factor_enabled`,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.two_factor_enabled = result.rows[0].two_factor_enabled;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  async disable2FA() {
    try {
      const result = await query(
        `UPDATE ${USER_SCHEMA.tableName} SET two_factor_enabled = false, updated_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING two_factor_enabled`,
        [this.id]
      );

      if (result.rows.length > 0) {
        this.two_factor_enabled = result.rows[0].two_factor_enabled;
      }

      return true;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      role: this.role,
      mobile: this.mobile,
      email: this.email,
      two_factor_enabled: this.two_factor_enabled,
      created_at: this.created_at
    };
  }
}

module.exports = User;

