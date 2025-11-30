const PatientFile = require('../models/PatientFile');
const fs = require('fs');
const path = require('path');

class FileController {
  static async createPatientFiles(req, res) {
    try {
      const { patient_id, user_id } = req.body;
      const patientIdInt = parseInt(patient_id, 10);
      const userId = parseInt(user_id || req.user?.id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        // Clean up uploaded files
        const files = Array.isArray(req.files) ? req.files : [];
        files.forEach(file => {
          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.unlinkSync(file.path);
            } catch (err) {
              console.error('Error cleaning up file:', err);
            }
          }
        });
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Verify patient exists - we can use Patient model directly since we're in the same service
      const Patient = require('../models/Patient');
      try {
        const patient = await Patient.findById(patientIdInt);
        if (!patient) {
          return res.status(404).json({
            success: false,
            message: 'Patient not found'
          });
        }
      } catch (error) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const files = Array.isArray(req.files) ? req.files : [];
      if (files.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No files uploaded'
        });
      }

      const userRole = req.user?.role?.trim() || 'Admin';
      const roleFolder = userRole.replace(/\s+/g, '_');

      let patientFile = await PatientFile.findByPatientId(patientIdInt);
      let fileRecordId = patientFile ? patientFile.id : null;

      if (!patientFile) {
        patientFile = await PatientFile.create({
          patient_id: patientIdInt,
          attachment: [],
          user_id: userId
        });
        fileRecordId = patientFile.id;
      }

      const patientFilesDir = path.join(process.env.UPLOAD_DIR || './uploads', 'patient_files', roleFolder, patientIdInt.toString());
      if (!fs.existsSync(patientFilesDir)) {
        fs.mkdirSync(patientFilesDir, { recursive: true });
      }

      const filePaths = [];
      let fileIndex = 0;

      for (const file of files) {
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
        const ext = path.extname(originalName);
        const uniqueFilename = `${fileRecordId}_${roleFolder}${fileIndex > 0 ? `_${fileIndex}` : ''}${ext}`;
        const newPath = path.join(patientFilesDir, uniqueFilename);

        if (file.path && fs.existsSync(file.path)) {
          try {
            fs.renameSync(file.path, newPath);
          } catch (moveError) {
            try {
              fs.copyFileSync(file.path, newPath);
              fs.unlinkSync(file.path);
            } catch (copyError) {
              throw new Error(`Failed to save file: ${copyError.message}`);
            }
          }
        }

        const relativePath = `/uploads/patient_files/${roleFolder}/${patientIdInt}/${uniqueFilename}`;
        filePaths.push(relativePath);
        fileIndex++;
      }

      const updatedFiles = [...(patientFile.attachment || []), ...filePaths];
      patientFile = await PatientFile.update(patientFile.id, {
        attachment: updatedFiles,
        user_id: userId
      });

      res.status(201).json({
        success: true,
        message: `${files.length} file(s) uploaded successfully`,
        data: {
          files: filePaths,
          record: patientFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Create patient files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload files',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async updatePatientFiles(req, res) {
    try {
      const { patient_id } = req.params;
      let files_to_remove = req.body.files_to_remove || req.body['files_to_remove[]'] || [];
      
      if (!Array.isArray(files_to_remove)) {
        if (typeof files_to_remove === 'string') {
          try {
            files_to_remove = JSON.parse(files_to_remove);
          } catch (e) {
            files_to_remove = [files_to_remove];
          }
        } else {
          files_to_remove = [];
        }
      }

      const patientIdInt = parseInt(patient_id, 10);
      const userId = parseInt(req.user?.id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Verify patient exists - we're in the same service now
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const existing = await PatientFile.findByPatientId(patientIdInt);
      
      if (existing && !this.canEditDelete(req.user, existing)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to edit/delete these files'
        });
      }

      const userRole = req.user?.role?.trim() || 'Admin';
      const roleFolder = userRole.replace(/\s+/g, '_');

      let currentRecord = existing;
      if (!currentRecord) {
        currentRecord = await PatientFile.findByPatientId(patientIdInt);
        if (!currentRecord) {
          currentRecord = await PatientFile.create({
            patient_id: patientIdInt,
            attachment: [],
            user_id: userId
          });
        }
      }
      const recordId = currentRecord.id;

      const newFiles = [];
      const files = Array.isArray(req.files) ? req.files : [];
      
      if (files.length > 0) {
        const patientFilesDir = path.join(process.env.UPLOAD_DIR || './uploads', 'patient_files', roleFolder, patientIdInt.toString());
        if (!fs.existsSync(patientFilesDir)) {
          fs.mkdirSync(patientFilesDir, { recursive: true });
        }

        const existingFileCount = (currentRecord.attachment || []).length;
        let fileIndex = 0;

        for (const file of files) {
          const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
          const ext = path.extname(originalName);
          const uniqueFilename = `${recordId}_${roleFolder}${fileIndex > 0 || existingFileCount > 0 ? `_${existingFileCount + fileIndex}` : ''}${ext}`;
          const newPath = path.join(patientFilesDir, uniqueFilename);

          if (file.path && fs.existsSync(file.path)) {
            try {
              fs.renameSync(file.path, newPath);
            } catch (moveError) {
              try {
                fs.copyFileSync(file.path, newPath);
                fs.unlinkSync(file.path);
              } catch (copyError) {
                throw new Error(`Failed to save file: ${copyError.message}`);
              }
            }
          }

          const relativePath = `/uploads/patient_files/${roleFolder}/${patientIdInt}/${uniqueFilename}`;
          newFiles.push(relativePath);
          fileIndex++;
        }
      }

      let updatedFiles = existing ? [...(existing.attachment || [])] : [];
      updatedFiles = [...updatedFiles, ...newFiles];

      if (files_to_remove.length > 0) {
        const filesToRemoveSet = new Set(files_to_remove);
        updatedFiles = updatedFiles.filter(file => {
          if (filesToRemoveSet.has(file)) {
            const absolutePath = path.join(process.env.UPLOAD_DIR || './uploads', file.replace(/^\//, ''));
            if (fs.existsSync(absolutePath)) {
              try {
                fs.unlinkSync(absolutePath);
              } catch (unlinkError) {
                console.error('Error deleting file:', unlinkError);
              }
            }
            return false;
          }
          return true;
        });
      }

      let patientFile;
      if (existing) {
        patientFile = await PatientFile.update(existing.id, {
          attachment: updatedFiles,
          user_id: userId
        });
      } else if (newFiles.length > 0 || updatedFiles.length > 0) {
        patientFile = await PatientFile.create({
          patient_id: patientIdInt,
          attachment: updatedFiles,
          user_id: userId
        });
      } else {
        return res.status(400).json({
          success: false,
          message: 'No files to update'
        });
      }

      res.json({
        success: true,
        message: 'Files updated successfully',
        data: {
          files: updatedFiles,
          record: patientFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Update patient files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update files',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getPatientFiles(req, res) {
    try {
      const { patient_id } = req.params;
      const patientIdInt = parseInt(patient_id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Verify patient exists - we're in the same service now
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const patientFile = await PatientFile.findByPatientId(patientIdInt);

      res.json({
        success: true,
        data: {
          patient_id: patientIdInt,
          files: patientFile ? patientFile.attachment : [],
          record: patientFile ? patientFile.toJSON() : null,
          can_edit: patientFile ? this.canEditDelete(req.user, patientFile) : false
        }
      });
    } catch (error) {
      console.error('Get patient files error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get patient files'
      });
    }
  }

  static async deletePatientFile(req, res) {
    try {
      const { patient_id, file_path } = req.params;
      const patientIdInt = parseInt(patient_id, 10);

      if (isNaN(patientIdInt) || patientIdInt <= 0) {
        return res.status(400).json({
          success: false,
          message: 'Invalid patient ID format'
        });
      }

      // Verify patient exists - we're in the same service now
      const patient = await Patient.findById(patientIdInt);
      if (!patient) {
        return res.status(404).json({
          success: false,
          message: 'Patient not found'
        });
      }

      const existing = await PatientFile.findByPatientId(patientIdInt);
      if (!existing || !existing.attachment.includes(file_path)) {
        return res.status(404).json({
          success: false,
          message: 'File not found in patient record'
        });
      }

      if (!this.canEditDelete(req.user, existing)) {
        return res.status(403).json({
          success: false,
          message: 'You do not have permission to delete this file'
        });
      }

      const absolutePath = path.join(process.env.UPLOAD_DIR || './uploads', file_path.replace(/^\//, ''));
      if (fs.existsSync(absolutePath)) {
        try {
          fs.unlinkSync(absolutePath);
        } catch (unlinkError) {
          console.error('Error deleting file:', unlinkError);
        }
      }

      const updatedFiles = existing.attachment.filter(f => f !== file_path);
      const userId = parseInt(req.user?.id, 10);
      const patientFile = await PatientFile.update(existing.id, {
        attachment: updatedFiles,
        user_id: userId
      });

      res.json({
        success: true,
        message: 'File deleted successfully',
        data: {
          files: updatedFiles,
          record: patientFile.toJSON()
        }
      });
    } catch (error) {
      console.error('Delete patient file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete file'
      });
    }
  }

  static async getFileStats(req, res) {
    try {
      const stats = await PatientFile.getStats();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get file stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get file statistics'
      });
    }
  }

  static canEditDelete(user, patientFile) {
    if (!user || !patientFile) return false;
    
    const userRole = user.role?.trim();
    const userId = parseInt(user.id, 10);
    
    if (userRole === 'Admin' || userRole === 'Psychiatric Welfare Officer') {
      return true;
    }
    
    if (userRole === 'Faculty' || userRole === 'Resident') {
      const roleArray = Array.isArray(patientFile.role) ? patientFile.role : [];
      return roleArray.some(r => r.id === userId);
    }
    
    return false;
  }
}

module.exports = FileController;

