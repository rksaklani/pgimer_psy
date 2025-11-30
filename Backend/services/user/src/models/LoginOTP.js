const { query } = require('../../../../common/database/pool');
const { LOGIN_OTP_SCHEMA } = require('../../../../common/utils/schemas');

class LoginOTP {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
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
      const otp = this.generateOTP();
      // OTP expiration in milliseconds (default: 5 minutes)
      const otpExpirationMs = parseInt(process.env.OTP_EXPIRATION_MS) || (5 * 60 * 1000);
      const expiresAt = new Date(Date.now() + otpExpirationMs);

      // Delete old OTPs for this user
      await query(
        `DELETE FROM ${LOGIN_OTP_SCHEMA.tableName} WHERE user_id = $1`,
        [userId]
      );

      const result = await query(
        `INSERT INTO ${LOGIN_OTP_SCHEMA.tableName} (user_id, otp, expires_at)
         VALUES ($1, $2, $3)
         RETURNING *`,
        [userId, otp, expiresAt]
      );

      return new LoginOTP(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async verify(userId, otp) {
    try {
      const result = await query(
        `SELECT * FROM ${LOGIN_OTP_SCHEMA.tableName} 
         WHERE user_id = $1 AND otp = $2 AND used = false AND expires_at > CURRENT_TIMESTAMP`,
        [userId, otp]
      );

      if (result.rows.length === 0) {
        return false;
      }

      // Mark OTP as used
      await query(
        `UPDATE ${LOGIN_OTP_SCHEMA.tableName} SET used = true WHERE id = $1`,
        [result.rows[0].id]
      );

      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = LoginOTP;

