const { query } = require('../../../../common/database/pool');
const { v4: uuidv4 } = require('uuid');
const { REFRESH_TOKEN_SCHEMA } = require('../../../../common/utils/schemas');

class RefreshToken {
  constructor(data) {
    this.id = data.id;
    this.user_id = data.user_id;
    this.token = data.token;
    this.device_info = data.device_info;
    this.ip_address = data.ip_address;
    this.last_activity = data.last_activity;
    this.expires_at = data.expires_at;
    this.created_at = data.created_at;
  }

  static async create({ userId, deviceInfo, ipAddress }) {
    try {
      const token = uuidv4();
      // Refresh token expiration in milliseconds (default: 7 days)
      const refreshTokenExpirationMs = parseInt(process.env.REFRESH_TOKEN_EXPIRATION_MS) || (7 * 24 * 60 * 60 * 1000);
      const expiresAt = new Date(Date.now() + refreshTokenExpirationMs);
      
      const result = await query(
        `INSERT INTO ${REFRESH_TOKEN_SCHEMA.tableName} (user_id, token, device_info, ip_address, last_activity, expires_at)
         VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, $5)
         RETURNING *`,
        [userId, token, deviceInfo, ipAddress, expiresAt]
      );

      return new RefreshToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByToken(token) {
    try {
      const result = await query(
        `SELECT * FROM ${REFRESH_TOKEN_SCHEMA.tableName} WHERE token = $1`,
        [token]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new RefreshToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        `SELECT * FROM ${REFRESH_TOKEN_SCHEMA.tableName} WHERE id = $1`,
        [id]
      );

      if (result.rows.length === 0) {
        return null;
      }

      return new RefreshToken(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async revoke(tokenOrId) {
    try {
      // Try to revoke by token (UUID) first, then by ID
      await query(
        `UPDATE ${REFRESH_TOKEN_SCHEMA.tableName} SET expires_at = CURRENT_TIMESTAMP WHERE token = $1 OR id = $1`,
        [tokenOrId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async updateActivity(tokenOrId) {
    try {
      // Update by token (UUID) or ID
      await query(
        `UPDATE ${REFRESH_TOKEN_SCHEMA.tableName} SET last_activity = CURRENT_TIMESTAMP WHERE token = $1 OR id = $1`,
        [tokenOrId]
      );
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async isExpired(tokenOrId) {
    try {
      // Check by token (UUID) or ID
      const result = await query(
        `SELECT expires_at, last_activity FROM ${REFRESH_TOKEN_SCHEMA.tableName} WHERE token = $1 OR id = $1`,
        [tokenOrId]
      );

      if (result.rows.length === 0) {
        return true;
      }

      const { expires_at, last_activity } = result.rows[0];
      const now = new Date();
      const expiresAt = new Date(expires_at);
      const lastActivity = new Date(last_activity);
      
      // Check if token expired or user inactive for more than configured timeout
      // Inactivity timeout in milliseconds (default: 15 minutes)
      const inactivityTimeoutMs = parseInt(process.env.SESSION_INACTIVITY_TIMEOUT_MS) || (15 * 60 * 1000);
      const inactiveTime = now - lastActivity;

      return now > expiresAt || inactiveTime > inactivityTimeoutMs;
    } catch (error) {
      return true;
    }
  }
}

module.exports = RefreshToken;

