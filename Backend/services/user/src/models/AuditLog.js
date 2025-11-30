const { query } = require('../../../../common/database/pool');
const { AUDIT_LOG_SCHEMA, USER_SCHEMA } = require('../../../../common/utils/schemas');

class AuditLog {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.table_name = data.table_name || null;
    this.record_id = data.record_id || null;
    this.action = data.action || null;
    this.old_data = data.old_data || null;
    this.new_data = data.new_data || null;
    this.created_at = data.created_at || null;
    
    // Joined fields
    this.user_name = data.user_name || null;
    this.user_role = data.user_role || null;
  }

  static async create(logData) {
    try {
      const result = await query(
        `INSERT INTO ${AUDIT_LOG_SCHEMA.tableName} 
         (user_id, table_name, record_id, action, old_data, new_data)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [
          logData.user_id,
          logData.table_name,
          logData.record_id,
          logData.action,
          logData.old_data ? JSON.stringify(logData.old_data) : null,
          logData.new_data ? JSON.stringify(logData.new_data) : null
        ]
      );
      return new AuditLog(result.rows[0]);
    } catch (error) {
      console.error('[AuditLog.create] Error:', error);
      throw error;
    }
  }

  static async findByTableAndRecord(tableName, recordId) {
    try {
      const result = await query(
        `SELECT al.*, u.name as user_name, u.role as user_role
         FROM ${AUDIT_LOG_SCHEMA.tableName} al
         LEFT JOIN ${USER_SCHEMA.tableName} u ON al.user_id = u.id
         WHERE al.table_name = $1 AND al.record_id = $2
         ORDER BY al.created_at DESC`,
        [tableName, recordId]
      );
      return result.rows.map(row => new AuditLog(row));
    } catch (error) {
      console.error('[AuditLog.findByTableAndRecord] Error:', error);
      throw error;
    }
  }

  static async findByUser(userId, page = 1, limit = 50) {
    try {
      const offset = (page - 1) * limit;
      const result = await query(
        `SELECT al.*, u.name as user_name, u.role as user_role
         FROM ${AUDIT_LOG_SCHEMA.tableName} al
         LEFT JOIN ${USER_SCHEMA.tableName} u ON al.user_id = u.id
         WHERE al.user_id = $1
         ORDER BY al.created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );
      return result.rows.map(row => new AuditLog(row));
    } catch (error) {
      console.error('[AuditLog.findByUser] Error:', error);
      throw error;
    }
  }

  static async findAll(page = 1, limit = 50, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const conditions = [];
      const values = [];
      let idx = 1;

      if (filters.table_name) {
        conditions.push(`al.table_name = $${idx++}`);
        values.push(filters.table_name);
      }
      if (filters.action) {
        conditions.push(`al.action = $${idx++}`);
        values.push(filters.action);
      }
      if (filters.user_id) {
        conditions.push(`al.user_id = $${idx++}`);
        values.push(filters.user_id);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      const result = await query(
        `SELECT al.*, u.name as user_name, u.role as user_role
         FROM ${AUDIT_LOG_SCHEMA.tableName} al
         LEFT JOIN ${USER_SCHEMA.tableName} u ON al.user_id = u.id
         ${whereClause}
         ORDER BY al.created_at DESC
         LIMIT $${idx} OFFSET $${idx + 1}`,
        [...values, limit, offset]
      );

      const countResult = await query(
        `SELECT COUNT(*) as total FROM ${AUDIT_LOG_SCHEMA.tableName} al ${whereClause}`,
        values
      );

      return {
        logs: result.rows.map(row => {
          const log = new AuditLog(row);
          // Parse JSONB fields
          if (log.old_data && typeof log.old_data === 'string') {
            try {
              log.old_data = JSON.parse(log.old_data);
            } catch (e) {
              // Keep as string if parsing fails
            }
          }
          if (log.new_data && typeof log.new_data === 'string') {
            try {
              log.new_data = JSON.parse(log.new_data);
            } catch (e) {
              // Keep as string if parsing fails
            }
          }
          return log;
        }),
        pagination: {
          page,
          limit,
          total: parseInt(countResult.rows[0].total, 10),
          totalPages: Math.ceil(parseInt(countResult.rows[0].total, 10) / limit)
        }
      };
    } catch (error) {
      console.error('[AuditLog.findAll] Error:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      user_id: this.user_id,
      user_name: this.user_name,
      user_role: this.user_role,
      table_name: this.table_name,
      record_id: this.record_id,
      action: this.action,
      old_data: this.old_data,
      new_data: this.new_data,
      created_at: this.created_at
    };
  }
}

module.exports = AuditLog;

