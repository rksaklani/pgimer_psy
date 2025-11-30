const { query } = require('../../../../common/database/pool');
const { FILE_UPLOAD_SCHEMA, USER_SCHEMA } = require('../../../../common/utils/schemas');

class FileUpload {
  constructor(data = {}) {
    this.id = data.id || null;
    this.file_name = data.file_name || null;
    this.file_type = data.file_type || null;
    this.file_size = data.file_size || null;
    this.storage_path = data.storage_path || null;
    this.uploaded_by = data.uploaded_by || null;
    this.reference_table = data.reference_table || null;
    this.reference_id = data.reference_id || null;
    this.created_at = data.created_at || null;
    this.updated_at = data.updated_at || null;
    
    // Joined fields
    this.uploaded_by_name = data.uploaded_by_name || null;
    this.uploaded_by_role = data.uploaded_by_role || null;
  }

  static async create(uploadData) {
    try {
      const result = await query(
        `INSERT INTO ${FILE_UPLOAD_SCHEMA.tableName} 
         (file_name, file_type, file_size, storage_path, uploaded_by, reference_table, reference_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING *`,
        [
          uploadData.file_name,
          uploadData.file_type,
          uploadData.file_size,
          uploadData.storage_path,
          uploadData.uploaded_by,
          uploadData.reference_table,
          uploadData.reference_id
        ]
      );
      return new FileUpload(result.rows[0]);
    } catch (error) {
      console.error('[FileUpload.create] Error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const result = await query(
        `SELECT fu.*, u.name as uploaded_by_name, u.role as uploaded_by_role
         FROM ${FILE_UPLOAD_SCHEMA.tableName} fu
         LEFT JOIN ${USER_SCHEMA.tableName} u ON fu.uploaded_by = u.id
         WHERE fu.id = $1`,
        [id]
      );
      return result.rows.length > 0 ? new FileUpload(result.rows[0]) : null;
    } catch (error) {
      console.error('[FileUpload.findById] Error:', error);
      throw error;
    }
  }

  static async findByReference(referenceTable, referenceId) {
    try {
      const result = await query(
        `SELECT fu.*, u.name as uploaded_by_name, u.role as uploaded_by_role
         FROM ${FILE_UPLOAD_SCHEMA.tableName} fu
         LEFT JOIN ${USER_SCHEMA.tableName} u ON fu.uploaded_by = u.id
         WHERE fu.reference_table = $1 AND fu.reference_id = $2
         ORDER BY fu.created_at DESC`,
        [referenceTable, referenceId]
      );
      return result.rows.map(row => new FileUpload(row));
    } catch (error) {
      console.error('[FileUpload.findByReference] Error:', error);
      throw error;
    }
  }

  static async delete(id) {
    try {
      const result = await query(
        `DELETE FROM ${FILE_UPLOAD_SCHEMA.tableName} WHERE id = $1 RETURNING *`,
        [id]
      );
      return result.rows.length > 0 ? new FileUpload(result.rows[0]) : null;
    } catch (error) {
      console.error('[FileUpload.delete] Error:', error);
      throw error;
    }
  }

  static async deleteByReference(referenceTable, referenceId) {
    try {
      const result = await query(
        `DELETE FROM ${FILE_UPLOAD_SCHEMA.tableName} 
         WHERE reference_table = $1 AND reference_id = $2 
         RETURNING *`,
        [referenceTable, referenceId]
      );
      return result.rows.map(row => new FileUpload(row));
    } catch (error) {
      console.error('[FileUpload.deleteByReference] Error:', error);
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      file_name: this.file_name,
      file_type: this.file_type,
      file_size: this.file_size,
      storage_path: this.storage_path,
      uploaded_by: this.uploaded_by,
      uploaded_by_name: this.uploaded_by_name,
      uploaded_by_role: this.uploaded_by_role,
      reference_table: this.reference_table,
      reference_id: this.reference_id,
      created_at: this.created_at,
      updated_at: this.updated_at
    };
  }
}

module.exports = FileUpload;

