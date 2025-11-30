const { query } = require('../../../../common/database/pool');
const { v4: uuidv4 } = require('uuid');
const { PASSWORD_RESET_TOKEN_SCHEMA } = require('../../../../common/utils/schemas');

class PasswordResetToken {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.otp = data.otp;
    this.expires_at = data.expires_at;
    this.used = data.used;
    this.created_at = data.created_at;
  }

  static generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  static async create(userId) {
    try {
      const token = uuidv4();
      const otp = this.generateOTP();
      // Password reset token expiration in milliseconds (default: 15 minutes)
      const passwordResetTokenExpirationMs = parseInt(process.env.PASSWORD_RESET_TOKEN_EXPIRATION_MS) || (15 * 60 * 1000);
      const expiresAt = new Date(Date.now() + passwordResetTokenExpirationMs);

      // Delete old tokens for this user
      await query(
        `DELETE FROM ${PASSWORD_RESET_TOKEN_SCHEMA.tableName} WHERE user_id = $1`,
        [userId]
      );

      const result = await query(
        `INSERT INTO ${PASSWORD_RESET_TOKEN_SCHEMA.tableName} (user_id, token, otp, expires_at)
         VALUES ($1, $2, $3, $4)
         RETURNING *`,
        [userId, token, otp, expiresAt]
      );

      return new PasswordResetToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByToken(token) {
    try {
      const result = await query(
        `SELECT * FROM ${PASSWORD_RESET_TOKEN_SCHEMA.tableName} WHERE token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new PasswordResetToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async verify(token, otp) {
    try {
      const result = await query(
        `SELECT * FROM ${PASSWORD_RESET_TOKEN_SCHEMA.tableName} 
         WHERE token = $1 AND otp = $2 AND used = false AND expires_at > CURRENT_TIMESTAMP`,
        [token, otp]
      );

      if (result.rows.length === 0) {
        return false;
      }

      return true;
    } catch (error) {
      return false;
    }
  }

  static async markAsUsed(token) {
    try {
      await query(
        `UPDATE ${PASSWORD_RESET_TOKEN_SCHEMA.tableName} SET used = true WHERE token = $1`,
        [token]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  get is_valid() {
    return !this.used && new Date() < new Date(this.expires_at);
  }
}

module.exports = PasswordResetToken;

