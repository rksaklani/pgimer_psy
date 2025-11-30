const ClinicalProforma = require('../models/ClinicalProforma');
const axios = require('axios');

// Service URLs
const OUT_PATIENT_INTAKE_RECORD_SERVICE_URL = process.env.OUT_PATIENT_INTAKE_RECORD_SERVICE_URL || 'http://localhost:3004';
const OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL = process.env.OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL || 'http://localhost:3002';
const PRESCRIPTION_SERVICE_URL = process.env.PRESCRIPTION_SERVICE_URL || 'http://localhost:3005';

class ClinicalController {
  static sanitizeDateField(value) {
    if (!value || value === '' || value === null || value === undefined) {
      return null;
    }
    if (typeof value === 'string' && value.length >= 8) {
      const dateRegex = /^\d{4}-\d{2}-\d{2}/;
      if (dateRegex.test(value)) {
        return value.split('T')[0];
      }
    }
    if (typeof value === 'number' || (typeof value === 'string' && value.length < 8)) {
      return null;
    }
    const date = new Date(value);
    if (isNaN(date.getTime())) {
      return null;
    }
    return date.toISOString().split('T')[0];
  }

  static async createClinicalProforma(req, res) {
    try {
      const data = req.body;

      if (!data.patient_id || !data.visit_date) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields"
        });
      }

      // Complex Case Handling - Create ADL file via ADL service
      if (data.doctor_decision === "complex_case") {
        if (data.requires_adl_file !== true && data.requires_adl_file !== "true") {
          data.requires_adl_file = true;
        }

        // Extract complex case fields for ADL file
        const complexCaseFields = [
          'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
          'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs', 'history_treatment_response',
          'informants', 'complaints_patient', 'complaints_informant',
          'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
          'past_history_psychiatric_treatment', 'past_history_psychiatric_interim', 'past_history_psychiatric_recovery',
          'family_history_father_age', 'family_history_father_education', 'family_history_father_occupation',
          'family_history_father_personality', 'family_history_father_deceased', 'family_history_father_death_age',
          'family_history_father_death_date', 'family_history_father_death_cause',
          'family_history_mother_age', 'family_history_mother_education', 'family_history_mother_occupation',
          'family_history_mother_personality', 'family_history_mother_deceased', 'family_history_mother_death_age',
          'family_history_mother_death_date', 'family_history_mother_death_cause', 'family_history_siblings',
          'diagnostic_formulation_summary', 'diagnostic_formulation_features', 'diagnostic_formulation_psychodynamic',
          'premorbid_personality_passive_active', 'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
          'premorbid_personality_traits', 'premorbid_personality_hobbies', 'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
          'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus', 'physical_oedema', 'physical_lymphadenopathy',
          'physical_pulse', 'physical_bp', 'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
          'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds', 'physical_cvs_murmurs',
          'physical_chest_expansion', 'physical_chest_percussion', 'physical_chest_adventitious',
          'physical_abdomen_tenderness', 'physical_abdomen_mass', 'physical_abdomen_bowel_sounds',
          'physical_cns_cranial', 'physical_cns_motor_sensory', 'physical_cns_rigidity', 'physical_cns_involuntary',
          'physical_cns_superficial_reflexes', 'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
          'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness', 'mse_general_cooperation',
          'mse_psychomotor_verbalization', 'mse_psychomotor_pressure', 'mse_psychomotor_tension', 'mse_psychomotor_posture',
          'mse_psychomotor_mannerism', 'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
          'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form', 'mse_thought_content',
          'mse_cognitive_consciousness', 'mse_cognitive_orientation_time', 'mse_cognitive_orientation_place',
          'mse_cognitive_orientation_person', 'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
          'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span', 'mse_cognitive_counting',
          'mse_cognitive_general_knowledge', 'mse_cognitive_calculation', 'mse_cognitive_similarities', 'mse_cognitive_proverbs',
          'mse_insight_understanding', 'mse_insight_judgement',
          'education_start_age', 'education_highest_class', 'education_performance', 'education_disciplinary',
          'education_peer_relationship', 'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
          'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education', 'sexual_masturbation',
          'sexual_contact', 'sexual_premarital_extramarital', 'sexual_marriage_arranged', 'sexual_marriage_date',
          'sexual_spouse_age', 'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
          'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation', 'religion_changes',
          'living_residents', 'living_income_sharing', 'living_expenses', 'living_kitchen', 'living_domestic_conflicts',
          'living_social_class', 'living_inlaws', 'home_situation_childhood', 'home_situation_parents_relationship',
          'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date', 'personal_birth_place',
          'personal_delivery_type', 'personal_complications_prenatal', 'personal_complications_natal', 'personal_complications_postnatal',
          'development_weaning_age', 'development_first_words', 'development_three_words', 'development_walking',
          'development_neurotic_traits', 'development_nail_biting', 'development_bedwetting', 'development_phobias',
          'development_childhood_illness', 'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
        ];

        const complexCaseData = {};
        const dateFields = [
          'family_history_father_death_date', 'family_history_mother_death_date',
          'past_history_psychiatric_dates', 'history_treatment_dates', 'personal_birth_date', 'sexual_marriage_date'
        ];

        complexCaseFields.forEach(field => {
          if (data.hasOwnProperty(field) && data[field] !== undefined && data[field] !== null) {
            if (dateFields.includes(field)) {
              complexCaseData[field] = this.sanitizeDateField(data[field]);
            } else {
              complexCaseData[field] = data[field];
            }
          }
        });

        // Step 1: Create clinical proforma first
        const clinicalData = {
          patient_id: data.patient_id,
          filled_by: req.user.id,
          visit_date: this.sanitizeDateField(data.visit_date) || new Date().toISOString().split('T')[0],
          visit_type: data.visit_type || 'first_visit',
          room_no: data.room_no || null,
          assigned_doctor: data.assigned_doctor || null,
          informant_present: data.informant_present || false,
          nature_of_information: data.nature_of_information || null,
          onset_duration: data.onset_duration || null,
          course: data.course || null,
          precipitating_factor: data.precipitating_factor || null,
          illness_duration: data.illness_duration || null,
          current_episode_since: this.sanitizeDateField(data.current_episode_since),
          mood: data.mood || null,
          behaviour: data.behaviour || null,
          speech: data.speech || null,
          thought: data.thought || null,
          perception: data.perception || null,
          somatic: data.somatic || null,
          bio_functions: data.bio_functions || null,
          adjustment: data.adjustment || null,
          cognitive_function: data.cognitive_function || null,
          fits: data.fits || null,
          sexual_problem: data.sexual_problem || null,
          substance_use: data.substance_use || null,
          past_history: data.past_history || null,
          family_history: data.family_history || null,
          associated_medical_surgical: data.associated_medical_surgical || null,
          mse_behaviour: data.mse_behaviour || null,
          mse_affect: data.mse_affect || null,
          mse_thought: data.mse_thought || null,
          mse_delusions: data.mse_delusions || null,
          mse_perception: data.mse_perception || null,
          mse_cognitive_function: data.mse_cognitive_function || null,
          gpe: data.gpe || null,
          diagnosis: data.diagnosis || null,
          icd_code: data.icd_code || null,
          disposal: data.disposal || null,
          workup_appointment: this.sanitizeDateField(data.workup_appointment),
          referred_to: data.referred_to || null,
          treatment_prescribed: data.treatment_prescribed || null,
          doctor_decision: 'complex_case',
          case_severity: data.case_severity || null,
          requires_adl_file: true,
          adl_reasoning: data.adl_reasoning || null,
          adl_file_id: null // Will be set after ADL file creation
        };

        const clinicalProforma = await ClinicalProforma.create(clinicalData);

        // Step 2: Create Outpatient Intake Record via service
        try {
          const adlResponse = await axios.post(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records`, {
            patient_id: data.patient_id,
            clinical_proforma_id: clinicalProforma.id,
            ...complexCaseData
          }, {
            headers: { Authorization: req.headers.authorization }
          });

          const adlFile = adlResponse.data.data?.adl_file;

          // Step 3: Update clinical proforma with ADL file ID
          if (adlFile) {
            await ClinicalProforma.update(clinicalProforma.id, { adl_file_id: adlFile.id });
            clinicalProforma.adl_file_id = adlFile.id;
          }

          // Step 4: Update patient status via patient service
          try {
            await axios.put(`${OUT_PATIENTS_CARD_AND_RECORD_SERVICE_URL}/api/patients/${data.patient_id}`, {
              has_adl_file: true,
              case_complexity: 'complex',
              file_status: 'created'
            }, {
              headers: { Authorization: req.headers.authorization }
            });
          } catch (error) {
            console.warn('Failed to update patient status:', error.message);
          }

          // Handle prescriptions if provided
          let prescriptions = null;
          if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
            try {
              const prescriptionResponse = await axios.post(`${PRESCRIPTION_SERVICE_URL}/api/prescriptions`, {
                patient_id: data.patient_id,
                clinical_proforma_id: clinicalProforma.id,
                prescription: data.prescriptions
              }, {
                headers: { Authorization: req.headers.authorization }
              });
              prescriptions = prescriptionResponse.data.data;
            } catch (error) {
              console.warn('Failed to create prescriptions:', error.message);
            }
          }

          return res.status(201).json({
            success: true,
            message: 'Complex case with ADL file saved successfully',
            data: {
              clinical_proforma: clinicalProforma.toJSON(),
              adl_file: adlFile,
              prescriptions
            }
          });
        } catch (adlError) {
          // Rollback: Delete clinical proforma if ADL creation fails
          await ClinicalProforma.delete(clinicalProforma.id);
          throw new Error(`Failed to create ADL file: ${adlError.message}`);
        }
      } else {
        // Simple case - just create clinical proforma
        const clinicalData = {
          patient_id: data.patient_id,
          filled_by: req.user.id,
          visit_date: this.sanitizeDateField(data.visit_date) || new Date().toISOString().split('T')[0],
          visit_type: data.visit_type || 'first_visit',
          room_no: data.room_no || null,
          assigned_doctor: data.assigned_doctor || null,
          informant_present: data.informant_present || false,
          nature_of_information: data.nature_of_information || null,
          onset_duration: data.onset_duration || null,
          course: data.course || null,
          precipitating_factor: data.precipitating_factor || null,
          illness_duration: data.illness_duration || null,
          current_episode_since: this.sanitizeDateField(data.current_episode_since),
          mood: data.mood || null,
          behaviour: data.behaviour || null,
          speech: data.speech || null,
          thought: data.thought || null,
          perception: data.perception || null,
          somatic: data.somatic || null,
          bio_functions: data.bio_functions || null,
          adjustment: data.adjustment || null,
          cognitive_function: data.cognitive_function || null,
          fits: data.fits || null,
          sexual_problem: data.sexual_problem || null,
          substance_use: data.substance_use || null,
          past_history: data.past_history || null,
          family_history: data.family_history || null,
          associated_medical_surgical: data.associated_medical_surgical || null,
          mse_behaviour: data.mse_behaviour || null,
          mse_affect: data.mse_affect || null,
          mse_thought: data.mse_thought || null,
          mse_delusions: data.mse_delusions || null,
          mse_perception: data.mse_perception || null,
          mse_cognitive_function: data.mse_cognitive_function || null,
          gpe: data.gpe || null,
          diagnosis: data.diagnosis || null,
          icd_code: data.icd_code || null,
          disposal: data.disposal || null,
          workup_appointment: this.sanitizeDateField(data.workup_appointment),
          referred_to: data.referred_to || null,
          treatment_prescribed: data.treatment_prescribed || null,
          doctor_decision: 'simple_case',
          case_severity: data.case_severity || null,
          requires_adl_file: false,
          adl_reasoning: null,
          adl_file_id: null
        };

        const clinicalProforma = await ClinicalProforma.create(clinicalData);

        // Handle prescriptions if provided
        let prescriptions = null;
        if (data.prescriptions && Array.isArray(data.prescriptions) && data.prescriptions.length > 0) {
          try {
            const prescriptionResponse = await axios.post(`${PRESCRIPTION_SERVICE_URL}/api/prescriptions`, {
              patient_id: data.patient_id,
              clinical_proforma_id: clinicalProforma.id,
              prescription: data.prescriptions
            }, {
              headers: { Authorization: req.headers.authorization }
            });
            prescriptions = prescriptionResponse.data.data;
          } catch (error) {
            console.warn('Failed to create prescriptions:', error.message);
          }
        }

        return res.status(201).json({
          success: true,
          message: 'Clinical proforma created successfully',
          data: {
            clinical_proforma: clinicalProforma.toJSON(),
            adl_file: null,
            prescriptions
          }
        });
      }
    } catch (error) {
      console.error('Create clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create clinical proforma',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  static async getAllClinicalProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      const filters = {
        visit_type: req.query.visit_type,
        doctor_decision: req.query.doctor_decision,
        case_severity: req.query.case_severity,
        requires_adl_file: req.query.requires_adl_file !== undefined ? req.query.requires_adl_file === 'true' : undefined,
        filled_by: req.query.filled_by,
        room_no: req.query.room_no,
        date_from: req.query.date_from,
        date_to: req.query.date_to
      };

      const result = await ClinicalProforma.findAll(page, limit, filters);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get all clinical proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas'
      });
    }
  }

  static async getClinicalProformaById(req, res) {
    try {
      const proforma = await ClinicalProforma.findById(req.params.id);
      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      res.json({
        success: true,
        data: { clinical_proforma: proforma.toJSON() }
      });
    } catch (error) {
      console.error('Get clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proforma'
      });
    }
  }

  static async updateClinicalProforma(req, res) {
    try {
      const proforma = await ClinicalProforma.findById(req.params.id);
      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      // Check if updating to complex case
      if (req.body.doctor_decision === 'complex_case' && proforma.doctor_decision !== 'complex_case') {
        // Create ADL file via ADL service
        const complexCaseFields = { /* same as in create */ };
        const complexCaseData = {};
        
        // Extract complex case fields
        Object.keys(complexCaseFields).forEach(field => {
          if (req.body.hasOwnProperty(field) && req.body[field] !== undefined) {
            complexCaseData[field] = req.body[field];
          }
        });

        try {
          const adlResponse = await axios.post(`${OUT_PATIENT_INTAKE_RECORD_SERVICE_URL}/api/outpatient-intake-records`, {
            patient_id: proforma.patient_id,
            clinical_proforma_id: proforma.id,
            ...complexCaseData
          }, {
            headers: { Authorization: req.headers.authorization }
          });

          const adlFile = adlResponse.data.data?.adl_file;
          if (adlFile) {
            req.body.adl_file_id = adlFile.id;
            req.body.requires_adl_file = true;
          }
        } catch (error) {
          console.warn('Failed to create ADL file:', error.message);
        }
      }

      await proforma.update(req.body);
      
      res.json({
        success: true,
        message: 'Clinical proforma updated successfully',
        data: { clinical_proforma: proforma.toJSON() }
      });
    } catch (error) {
      console.error('Update clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update clinical proforma'
      });
    }
  }

  static async deleteClinicalProforma(req, res) {
    try {
      const proforma = await ClinicalProforma.findById(req.params.id);
      if (!proforma) {
        return res.status(404).json({
          success: false,
          message: 'Clinical proforma not found'
        });
      }

      await proforma.delete();
      
      res.json({
        success: true,
        message: 'Clinical proforma deleted successfully'
      });
    } catch (error) {
      console.error('Delete clinical proforma error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete clinical proforma'
      });
    }
  }

  static async getMyProformas(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await ClinicalProforma.findByFilledBy(req.user.id, page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get my proformas error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get proformas'
      });
    }
  }

  static async getComplexCases(req, res) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;
      
      const result = await ClinicalProforma.findComplexCases(page, limit);
      
      res.json({
        success: true,
        data: result
      });
    } catch (error) {
      console.error('Get complex cases error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get complex cases'
      });
    }
  }

  static async getClinicalProformaByPatientId(req, res) {
    try {
      const proformas = await ClinicalProforma.findByPatientId(req.params.patient_id);
      
      res.json({
        success: true,
        data: { proformas: proformas.map(p => p.toJSON()) }
      });
    } catch (error) {
      console.error('Get clinical proforma by patient ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get clinical proformas'
      });
    }
  }

  static async getClinicalStats(req, res) {
    try {
      const stats = await ClinicalProforma.getStats();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get clinical stats error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get statistics'
      });
    }
  }

  static async getCasesByDecision(req, res) {
    try {
      const stats = await ClinicalProforma.getCasesByDecision();
      res.json({
        success: true,
        data: { stats }
      });
    } catch (error) {
      console.error('Get cases by decision error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get decision statistics'
      });
    }
  }

  static async getVisitTrends(req, res) {
    try {
      const period = req.query.period || 'week';
      const userId = req.query.user_id;
      
      const trends = await ClinicalProforma.getVisitTrends(period, userId);
      res.json({
        success: true,
        data: { trends }
      });
    } catch (error) {
      console.error('Get visit trends error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get visit trends'
      });
    }
  }
}

module.exports = ClinicalController;

