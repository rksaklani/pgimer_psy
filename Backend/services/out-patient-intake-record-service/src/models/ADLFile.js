const { query, getClient } = require('../../../../common/database/pool');
const { OUTPATIENT_INTAKE_RECORD_SCHEMA } = require('../../../../common/utils/schemas');

class ADLFile {
  constructor(data) {
    // Basic fields
    this.id = data.id;
    this.patient_id = data.patient_id;
    this.outpatient_intake_record_no = data.outpatient_intake_record_no || data.adl_no; // Support both for backward compatibility
    this.adl_no = this.outpatient_intake_record_no; // Legacy alias
    this.created_by = data.created_by;
    this.clinical_proforma_id = data.clinical_proforma_id;
    this.file_status = data.file_status || 'created';
    this.physical_file_location = data.physical_file_location;
    this.file_created_date = data.file_created_date;
    this.last_accessed_date = data.last_accessed_date;
    this.last_accessed_by = data.last_accessed_by;
    this.total_visits = data.total_visits || 0;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.notes = data.notes;
    this.created_at = data.created_at;
    this.updated_at = data.updated_at;

    // Joined fields
    this.patient_name = data.patient_name || null;
    this.cr_no = data.cr_no;
    this.psy_no = data.psy_no;
    this.created_by_name = data.created_by_name;
    this.created_by_role = data.created_by_role;
    this.last_accessed_by_name = data.last_accessed_by_name;
    this.assigned_doctor = data.assigned_doctor || null;
    this.assigned_doctor_name = data.assigned_doctor_name || null;
    this.assigned_doctor_role = data.assigned_doctor_role || null;
    this.proforma_visit_date = data.proforma_visit_date || null;

    // Complex case data fields (all stored in ADL file)
    // History fields
    this.history_narrative = data.history_narrative;
    this.history_specific_enquiry = data.history_specific_enquiry;
    this.history_drug_intake = data.history_drug_intake;
    this.history_treatment_place = data.history_treatment_place;
    this.history_treatment_dates = data.history_treatment_dates;
    this.history_treatment_drugs = data.history_treatment_drugs;
    this.history_treatment_response = data.history_treatment_response;

    // Informants and complaints (JSONB)
    this.informants = data.informants ? (typeof data.informants === 'string' ? JSON.parse(data.informants) : data.informants) : [];
    this.complaints_patient = data.complaints_patient ? (typeof data.complaints_patient === 'string' ? JSON.parse(data.complaints_patient) : data.complaints_patient) : [];
    this.complaints_informant = data.complaints_informant ? (typeof data.complaints_informant === 'string' ? JSON.parse(data.complaints_informant) : data.complaints_informant) : [];

    // Past history
    this.past_history_medical = data.past_history_medical;
    this.past_history_psychiatric_dates = data.past_history_psychiatric_dates;
    this.past_history_psychiatric_diagnosis = data.past_history_psychiatric_diagnosis;
    this.past_history_psychiatric_treatment = data.past_history_psychiatric_treatment;
    this.past_history_psychiatric_interim = data.past_history_psychiatric_interim;
    this.past_history_psychiatric_recovery = data.past_history_psychiatric_recovery;

    // Family history
    this.family_history_father_age = data.family_history_father_age;
    this.family_history_father_education = data.family_history_father_education;
    this.family_history_father_occupation = data.family_history_father_occupation;
    this.family_history_father_personality = data.family_history_father_personality;
    this.family_history_father_deceased = data.family_history_father_deceased || false;
    this.family_history_father_death_age = data.family_history_father_death_age;
    this.family_history_father_death_date = data.family_history_father_death_date;
    this.family_history_father_death_cause = data.family_history_father_death_cause;
    this.family_history_mother_age = data.family_history_mother_age;
    this.family_history_mother_education = data.family_history_mother_education;
    this.family_history_mother_occupation = data.family_history_mother_occupation;
    this.family_history_mother_personality = data.family_history_mother_personality;
    this.family_history_mother_deceased = data.family_history_mother_deceased || false;
    this.family_history_mother_death_age = data.family_history_mother_death_age;
    this.family_history_mother_death_date = data.family_history_mother_death_date;
    this.family_history_mother_death_cause = data.family_history_mother_death_cause;
    this.family_history_siblings = data.family_history_siblings ? (typeof data.family_history_siblings === 'string' ? JSON.parse(data.family_history_siblings) : data.family_history_siblings) : [];

    // Diagnostic formulation
    this.diagnostic_formulation_summary = data.diagnostic_formulation_summary;
    this.diagnostic_formulation_features = data.diagnostic_formulation_features;
    this.diagnostic_formulation_psychodynamic = data.diagnostic_formulation_psychodynamic;

    // Premorbid personality
    this.premorbid_personality_passive_active = data.premorbid_personality_passive_active;
    this.premorbid_personality_assertive = data.premorbid_personality_assertive;
    this.premorbid_personality_introvert_extrovert = data.premorbid_personality_introvert_extrovert;
    this.premorbid_personality_traits = data.premorbid_personality_traits ? (typeof data.premorbid_personality_traits === 'string' ? JSON.parse(data.premorbid_personality_traits) : data.premorbid_personality_traits) : [];
    this.premorbid_personality_hobbies = data.premorbid_personality_hobbies;
    this.premorbid_personality_habits = data.premorbid_personality_habits;
    this.premorbid_personality_alcohol_drugs = data.premorbid_personality_alcohol_drugs;

    // Physical examination (subset of key fields)
    this.physical_appearance = data.physical_appearance;
    this.physical_body_build = data.physical_body_build;
    this.physical_pallor = data.physical_pallor || false;
    this.physical_icterus = data.physical_icterus || false;
    this.physical_oedema = data.physical_oedema || false;
    this.physical_lymphadenopathy = data.physical_lymphadenopathy || false;
    this.physical_pulse = data.physical_pulse;
    this.physical_bp = data.physical_bp;
    this.physical_height = data.physical_height;
    this.physical_weight = data.physical_weight;
    this.physical_waist = data.physical_waist;
    this.physical_fundus = data.physical_fundus;
    this.physical_cvs_apex = data.physical_cvs_apex;
    this.physical_cvs_regularity = data.physical_cvs_regularity;
    this.physical_cvs_heart_sounds = data.physical_cvs_heart_sounds;
    this.physical_cvs_murmurs = data.physical_cvs_murmurs;
    this.physical_chest_expansion = data.physical_chest_expansion;
    this.physical_chest_percussion = data.physical_chest_percussion;
    this.physical_chest_adventitious = data.physical_chest_adventitious;
    this.physical_abdomen_tenderness = data.physical_abdomen_tenderness;
    this.physical_abdomen_mass = data.physical_abdomen_mass;
    this.physical_abdomen_bowel_sounds = data.physical_abdomen_bowel_sounds;
    this.physical_cns_cranial = data.physical_cns_cranial;
    this.physical_cns_motor_sensory = data.physical_cns_motor_sensory;
    this.physical_cns_rigidity = data.physical_cns_rigidity;
    this.physical_cns_involuntary = data.physical_cns_involuntary;
    this.physical_cns_superficial_reflexes = data.physical_cns_superficial_reflexes;
    this.physical_cns_dtrs = data.physical_cns_dtrs;
    this.physical_cns_plantar = data.physical_cns_plantar;
    this.physical_cns_cerebellar = data.physical_cns_cerebellar;

    // MSE fields (subset)
    this.mse_general_demeanour = data.mse_general_demeanour;
    this.mse_general_tidy = data.mse_general_tidy;
    this.mse_general_awareness = data.mse_general_awareness;
    this.mse_general_cooperation = data.mse_general_cooperation;
    this.mse_psychomotor_verbalization = data.mse_psychomotor_verbalization;
    this.mse_psychomotor_pressure = data.mse_psychomotor_pressure;
    this.mse_psychomotor_tension = data.mse_psychomotor_tension;
    this.mse_psychomotor_posture = data.mse_psychomotor_posture;
    this.mse_psychomotor_mannerism = data.mse_psychomotor_mannerism;
    this.mse_psychomotor_catatonic = data.mse_psychomotor_catatonic;
    this.mse_affect_subjective = data.mse_affect_subjective;
    this.mse_affect_tone = data.mse_affect_tone;
    this.mse_affect_resting = data.mse_affect_resting;
    this.mse_affect_fluctuation = data.mse_affect_fluctuation;
    this.mse_thought_flow = data.mse_thought_flow;
    this.mse_thought_form = data.mse_thought_form;
    this.mse_thought_content = data.mse_thought_content;
    this.mse_cognitive_consciousness = data.mse_cognitive_consciousness;
    this.mse_cognitive_orientation_time = data.mse_cognitive_orientation_time;
    this.mse_cognitive_orientation_place = data.mse_cognitive_orientation_place;
    this.mse_cognitive_orientation_person = data.mse_cognitive_orientation_person;
    this.mse_cognitive_memory_immediate = data.mse_cognitive_memory_immediate;
    this.mse_cognitive_memory_recent = data.mse_cognitive_memory_remote;
    this.mse_cognitive_memory_remote = data.mse_cognitive_memory_remote;
    this.mse_cognitive_subtraction = data.mse_cognitive_subtraction;
    this.mse_cognitive_digit_span = data.mse_cognitive_digit_span;
    this.mse_cognitive_counting = data.mse_cognitive_counting;
    this.mse_cognitive_general_knowledge = data.mse_cognitive_general_knowledge;
    this.mse_cognitive_calculation = data.mse_cognitive_calculation;
    this.mse_cognitive_similarities = data.mse_cognitive_similarities;
    this.mse_cognitive_proverbs = data.mse_cognitive_proverbs;
    this.mse_insight_understanding = data.mse_insight_understanding;
    this.mse_insight_judgement = data.mse_insight_judgement;

    // Education
    this.education_start_age = data.education_start_age;
    this.education_highest_class = data.education_highest_class;
    this.education_performance = data.education_performance;
    this.education_disciplinary = data.education_disciplinary;
    this.education_peer_relationship = data.education_peer_relationship;
    this.education_hobbies = data.education_hobbies;
    this.education_special_abilities = data.education_special_abilities;
    this.education_discontinue_reason = data.education_discontinue_reason;

    // Occupation (JSONB)
    this.occupation_jobs = data.occupation_jobs ? (typeof data.occupation_jobs === 'string' ? JSON.parse(data.occupation_jobs) : data.occupation_jobs) : [];

    // Sexual and marital history
    this.sexual_menarche_age = data.sexual_menarche_age;
    this.sexual_menarche_reaction = data.sexual_menarche_reaction;
    this.sexual_education = data.sexual_education;
    this.sexual_masturbation = data.sexual_masturbation;
    this.sexual_contact = data.sexual_contact;
    this.sexual_premarital_extramarital = data.sexual_premarital_extramarital;
    this.sexual_marriage_arranged = data.sexual_marriage_arranged;
    this.sexual_marriage_date = data.sexual_marriage_date;
    this.sexual_spouse_age = data.sexual_spouse_age;
    this.sexual_spouse_occupation = data.sexual_spouse_occupation;
    this.sexual_adjustment_general = data.sexual_adjustment_general;
    this.sexual_adjustment_sexual = data.sexual_adjustment_sexual;
    this.sexual_children = data.sexual_children ? (typeof data.sexual_children === 'string' ? JSON.parse(data.sexual_children) : data.sexual_children) : [];
    this.sexual_problems = data.sexual_problems;

    // Religion
    this.religion_type = data.religion_type;
    this.religion_participation = data.religion_participation;
    this.religion_changes = data.religion_changes;

    // Living situation (JSONB)
    this.living_residents = data.living_residents ? (typeof data.living_residents === 'string' ? JSON.parse(data.living_residents) : data.living_residents) : [];
    this.living_income_sharing = data.living_income_sharing;
    this.living_expenses = data.living_expenses;
    this.living_kitchen = data.living_kitchen;
    this.living_domestic_conflicts = data.living_domestic_conflicts;
    this.living_social_class = data.living_social_class;
    this.living_inlaws = data.living_inlaws ? (typeof data.living_inlaws === 'string' ? JSON.parse(data.living_inlaws) : data.living_inlaws) : [];

    // Home situation and development
    this.home_situation_childhood = data.home_situation_childhood;
    this.home_situation_parents_relationship = data.home_situation_parents_relationship;
    this.home_situation_socioeconomic = data.home_situation_socioeconomic;
    this.home_situation_interpersonal = data.home_situation_interpersonal;
    this.personal_birth_date = data.personal_birth_date;
    this.personal_birth_place = data.personal_birth_place;
    this.personal_delivery_type = data.personal_delivery_type;
    this.personal_complications_prenatal = data.personal_complications_prenatal;
    this.personal_complications_natal = data.personal_complications_natal;
    this.personal_complications_postnatal = data.personal_complications_postnatal;
    this.development_weaning_age = data.development_weaning_age;
    this.development_first_words = data.development_first_words;
    this.development_three_words = data.development_three_words;
    this.development_walking = data.development_walking;
    this.development_neurotic_traits = data.development_neurotic_traits;
    this.development_nail_biting = data.development_nail_biting;
    this.development_bedwetting = data.development_bedwetting;
    this.development_phobias = data.development_phobias;
    this.development_childhood_illness = data.development_childhood_illness;

    // Diagnosis and treatment
    this.provisional_diagnosis = data.provisional_diagnosis;
    this.treatment_plan = data.treatment_plan;
    this.consultant_comments = data.consultant_comments;
  }

  static generateOutpatientIntakeRecordNo() {
    const year = new Date().getFullYear();
    const random = Math.random().toString(36).substring(2, 10).toUpperCase();
    return `OIR${year}${random}`;
  }
  
  // Legacy method for backward compatibility
  static generateADLNo() {
    return this.generateOutpatientIntakeRecordNo();
  }

  static async create(adlData) {
    try {
      const outpatient_intake_record_no = adlData.outpatient_intake_record_no || adlData.adl_no || this.generateOutpatientIntakeRecordNo();
      const fields = ['patient_id', 'outpatient_intake_record_no', 'created_by', 'file_status', 'file_created_date', 'total_visits', 'is_active'];
      const values = [
        adlData.patient_id,
        outpatient_intake_record_no,
        adlData.created_by,
        adlData.file_status || 'created',
        adlData.file_created_date || new Date().toISOString().slice(0, 10),
        adlData.total_visits || 0,
        adlData.is_active !== undefined ? adlData.is_active : true
      ];
      let paramCount = values.length;

      // Add optional fields
      const optionalFields = {
        clinical_proforma_id: adlData.clinical_proforma_id,
        physical_file_location: adlData.physical_file_location,
        notes: adlData.notes,
        // All complex case fields
        history_narrative: adlData.history_narrative,
        history_specific_enquiry: adlData.history_specific_enquiry,
        history_drug_intake: adlData.history_drug_intake,
        history_treatment_place: adlData.history_treatment_place,
        history_treatment_dates: adlData.history_treatment_dates,
        history_treatment_drugs: adlData.history_treatment_drugs,
        history_treatment_response: adlData.history_treatment_response,
        informants: adlData.informants ? (typeof adlData.informants === 'string' ? adlData.informants : JSON.stringify(adlData.informants)) : null,
        complaints_patient: adlData.complaints_patient ? (typeof adlData.complaints_patient === 'string' ? adlData.complaints_patient : JSON.stringify(adlData.complaints_patient)) : null,
        complaints_informant: adlData.complaints_informant ? (typeof adlData.complaints_informant === 'string' ? adlData.complaints_informant : JSON.stringify(adlData.complaints_informant)) : null,
        past_history_medical: adlData.past_history_medical,
        past_history_psychiatric_dates: adlData.past_history_psychiatric_dates,
        past_history_psychiatric_diagnosis: adlData.past_history_psychiatric_diagnosis,
        past_history_psychiatric_treatment: adlData.past_history_psychiatric_treatment,
        past_history_psychiatric_interim: adlData.past_history_psychiatric_interim,
        past_history_psychiatric_recovery: adlData.past_history_psychiatric_recovery,
        family_history_father_age: adlData.family_history_father_age,
        family_history_father_education: adlData.family_history_father_education,
        family_history_father_occupation: adlData.family_history_father_occupation,
        family_history_father_personality: adlData.family_history_father_personality,
        family_history_father_deceased: adlData.family_history_father_deceased,
        family_history_father_death_age: adlData.family_history_father_death_age,
        family_history_father_death_date: adlData.family_history_father_death_date,
        family_history_father_death_cause: adlData.family_history_father_death_cause,
        family_history_mother_age: adlData.family_history_mother_age,
        family_history_mother_education: adlData.family_history_mother_education,
        family_history_mother_occupation: adlData.family_history_mother_occupation,
        family_history_mother_personality: adlData.family_history_mother_personality,
        family_history_mother_deceased: adlData.family_history_mother_deceased,
        family_history_mother_death_age: adlData.family_history_mother_death_age,
        family_history_mother_death_date: adlData.family_history_mother_death_date,
        family_history_mother_death_cause: adlData.family_history_mother_death_cause,
        family_history_siblings: adlData.family_history_siblings ? (typeof adlData.family_history_siblings === 'string' ? adlData.family_history_siblings : JSON.stringify(adlData.family_history_siblings)) : null,
        diagnostic_formulation_summary: adlData.diagnostic_formulation_summary,
        diagnostic_formulation_features: adlData.diagnostic_formulation_features,
        diagnostic_formulation_psychodynamic: adlData.diagnostic_formulation_psychodynamic,
        premorbid_personality_passive_active: adlData.premorbid_personality_passive_active,
        premorbid_personality_assertive: adlData.premorbid_personality_assertive,
        premorbid_personality_introvert_extrovert: adlData.premorbid_personality_introvert_extrovert,
        premorbid_personality_traits: adlData.premorbid_personality_traits ? (typeof adlData.premorbid_personality_traits === 'string' ? adlData.premorbid_personality_traits : JSON.stringify(adlData.premorbid_personality_traits)) : null,
        premorbid_personality_hobbies: adlData.premorbid_personality_hobbies,
        premorbid_personality_habits: adlData.premorbid_personality_habits,
        premorbid_personality_alcohol_drugs: adlData.premorbid_personality_alcohol_drugs,
        physical_appearance: adlData.physical_appearance,
        physical_body_build: adlData.physical_body_build,
        physical_pallor: adlData.physical_pallor,
        physical_icterus: adlData.physical_icterus,
        physical_oedema: adlData.physical_oedema,
        physical_lymphadenopathy: adlData.physical_lymphadenopathy,
        physical_pulse: adlData.physical_pulse,
        physical_bp: adlData.physical_bp,
        physical_height: adlData.physical_height,
        physical_weight: adlData.physical_weight,
        physical_waist: adlData.physical_waist,
        physical_fundus: adlData.physical_fundus,
        physical_cvs_apex: adlData.physical_cvs_apex,
        physical_cvs_regularity: adlData.physical_cvs_regularity,
        physical_cvs_heart_sounds: adlData.physical_cvs_heart_sounds,
        physical_cvs_murmurs: adlData.physical_cvs_murmurs,
        physical_chest_expansion: adlData.physical_chest_expansion,
        physical_chest_percussion: adlData.physical_chest_percussion,
        physical_chest_adventitious: adlData.physical_chest_adventitious,
        physical_abdomen_tenderness: adlData.physical_abdomen_tenderness,
        physical_abdomen_mass: adlData.physical_abdomen_mass,
        physical_abdomen_bowel_sounds: adlData.physical_abdomen_bowel_sounds,
        physical_cns_cranial: adlData.physical_cns_cranial,
        physical_cns_motor_sensory: adlData.physical_cns_motor_sensory,
        physical_cns_rigidity: adlData.physical_cns_rigidity,
        physical_cns_involuntary: adlData.physical_cns_involuntary,
        physical_cns_superficial_reflexes: adlData.physical_cns_superficial_reflexes,
        physical_cns_dtrs: adlData.physical_cns_dtrs,
        physical_cns_plantar: adlData.physical_cns_plantar,
        physical_cns_cerebellar: adlData.physical_cns_cerebellar,
        mse_general_demeanour: adlData.mse_general_demeanour,
        mse_general_tidy: adlData.mse_general_tidy,
        mse_general_awareness: adlData.mse_general_awareness,
        mse_general_cooperation: adlData.mse_general_cooperation,
        mse_psychomotor_verbalization: adlData.mse_psychomotor_verbalization,
        mse_psychomotor_pressure: adlData.mse_psychomotor_pressure,
        mse_psychomotor_tension: adlData.mse_psychomotor_tension,
        mse_psychomotor_posture: adlData.mse_psychomotor_posture,
        mse_psychomotor_mannerism: adlData.mse_psychomotor_mannerism,
        mse_psychomotor_catatonic: adlData.mse_psychomotor_catatonic,
        mse_affect_subjective: adlData.mse_affect_subjective,
        mse_affect_tone: adlData.mse_affect_tone,
        mse_affect_resting: adlData.mse_affect_resting,
        mse_affect_fluctuation: adlData.mse_affect_fluctuation,
        mse_thought_flow: adlData.mse_thought_flow,
        mse_thought_form: adlData.mse_thought_form,
        mse_thought_content: adlData.mse_thought_content,
        mse_cognitive_consciousness: adlData.mse_cognitive_consciousness,
        mse_cognitive_orientation_time: adlData.mse_cognitive_orientation_time,
        mse_cognitive_orientation_place: adlData.mse_cognitive_orientation_place,
        mse_cognitive_orientation_person: adlData.mse_cognitive_orientation_person,
        mse_cognitive_memory_immediate: adlData.mse_cognitive_memory_immediate,
        mse_cognitive_memory_recent: adlData.mse_cognitive_memory_recent,
        mse_cognitive_memory_remote: adlData.mse_cognitive_memory_remote,
        mse_cognitive_subtraction: adlData.mse_cognitive_subtraction,
        mse_cognitive_digit_span: adlData.mse_cognitive_digit_span,
        mse_cognitive_counting: adlData.mse_cognitive_counting,
        mse_cognitive_general_knowledge: adlData.mse_cognitive_general_knowledge,
        mse_cognitive_calculation: adlData.mse_cognitive_calculation,
        mse_cognitive_similarities: adlData.mse_cognitive_similarities,
        mse_cognitive_proverbs: adlData.mse_cognitive_proverbs,
        mse_insight_understanding: adlData.mse_insight_understanding,
        mse_insight_judgement: adlData.mse_insight_judgement,
        education_start_age: adlData.education_start_age,
        education_highest_class: adlData.education_highest_class,
        education_performance: adlData.education_performance,
        education_disciplinary: adlData.education_disciplinary,
        education_peer_relationship: adlData.education_peer_relationship,
        education_hobbies: adlData.education_hobbies,
        education_special_abilities: adlData.education_special_abilities,
        education_discontinue_reason: adlData.education_discontinue_reason,
        occupation_jobs: adlData.occupation_jobs ? (typeof adlData.occupation_jobs === 'string' ? adlData.occupation_jobs : JSON.stringify(adlData.occupation_jobs)) : null,
        sexual_menarche_age: adlData.sexual_menarche_age,
        sexual_menarche_reaction: adlData.sexual_menarche_reaction,
        sexual_education: adlData.sexual_education,
        sexual_masturbation: adlData.sexual_masturbation,
        sexual_contact: adlData.sexual_contact,
        sexual_premarital_extramarital: adlData.sexual_premarital_extramarital,
        sexual_marriage_arranged: adlData.sexual_marriage_arranged,
        sexual_marriage_date: adlData.sexual_marriage_date,
        sexual_spouse_age: adlData.sexual_spouse_age,
        sexual_spouse_occupation: adlData.sexual_spouse_occupation,
        sexual_adjustment_general: adlData.sexual_adjustment_general,
        sexual_adjustment_sexual: adlData.sexual_adjustment_sexual,
        sexual_children: adlData.sexual_children ? (typeof adlData.sexual_children === 'string' ? adlData.sexual_children : JSON.stringify(adlData.sexual_children)) : null,
        sexual_problems: adlData.sexual_problems,
        religion_type: adlData.religion_type,
        religion_participation: adlData.religion_participation,
        religion_changes: adlData.religion_changes,
        living_residents: adlData.living_residents ? (typeof adlData.living_residents === 'string' ? adlData.living_residents : JSON.stringify(adlData.living_residents)) : null,
        living_income_sharing: adlData.living_income_sharing,
        living_expenses: adlData.living_expenses,
        living_kitchen: adlData.living_kitchen,
        living_domestic_conflicts: adlData.living_domestic_conflicts,
        living_social_class: adlData.living_social_class,
        living_inlaws: adlData.living_inlaws ? (typeof adlData.living_inlaws === 'string' ? adlData.living_inlaws : JSON.stringify(adlData.living_inlaws)) : null,
        home_situation_childhood: adlData.home_situation_childhood,
        home_situation_parents_relationship: adlData.home_situation_parents_relationship,
        home_situation_socioeconomic: adlData.home_situation_socioeconomic,
        home_situation_interpersonal: adlData.home_situation_interpersonal,
        personal_birth_date: adlData.personal_birth_date,
        personal_birth_place: adlData.personal_birth_place,
        personal_delivery_type: adlData.personal_delivery_type,
        personal_complications_prenatal: adlData.personal_complications_prenatal,
        personal_complications_natal: adlData.personal_complications_natal,
        personal_complications_postnatal: adlData.personal_complications_postnatal,
        development_weaning_age: adlData.development_weaning_age,
        development_first_words: adlData.development_first_words,
        development_three_words: adlData.development_three_words,
        development_walking: adlData.development_walking,
        development_neurotic_traits: adlData.development_neurotic_traits,
        development_nail_biting: adlData.development_nail_biting,
        development_bedwetting: adlData.development_bedwetting,
        development_phobias: adlData.development_phobias,
        development_childhood_illness: adlData.development_childhood_illness,
        provisional_diagnosis: adlData.provisional_diagnosis,
        treatment_plan: adlData.treatment_plan,
        consultant_comments: adlData.consultant_comments
      };

      for (const [key, value] of Object.entries(optionalFields)) {
        if (value !== undefined && value !== null) {
          fields.push(key);
          values.push(value);
          paramCount++;
        }
      }

      const placeholders = values.map((_, i) => `$${i + 1}`);

      const queryText = `
        INSERT INTO ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} (${fields.join(', ')})
        VALUES (${placeholders.join(', ')})
        RETURNING *
      `;

      const result = await query(queryText, values);
      return new ADLFile(result.rows[0]);
    } catch (error) {
      console.error('[ADLFile.create] Error:', error);
      throw error;
    }
  }

  static async findById(id) {
    try {
      const queryText = `
        SELECT 
          af.*,
          p.name as patient_name,
          p.cr_no,
          p.psy_no,
          u1.name as created_by_name,
          u1.role as created_by_role,
          u2.name as last_accessed_by_name,
          cp.assigned_doctor,
          u3.name as assigned_doctor_name,
          u3.role as assigned_doctor_role,
          cp.visit_date as proforma_visit_date
        FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af
        LEFT JOIN registered_patient p ON af.patient_id = p.id
        LEFT JOIN users u1 ON af.created_by = u1.id
        LEFT JOIN users u2 ON af.last_accessed_by = u2.id
        LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
        LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
        WHERE af.id = $1
      `;

      const result = await query(queryText, [id]);
      if (result.rows.length === 0) return null;

      return new ADLFile(result.rows[0]);
    } catch (error) {
      throw error;
    }
  }

  static async findByPatientId(patient_id) {
    try {
      const queryText = `
        SELECT 
          af.*,
          p.name as patient_name,
          p.cr_no,
          p.psy_no,
          u1.name as created_by_name,
          u1.role as created_by_role
        FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af
        LEFT JOIN registered_patient p ON af.patient_id = p.id
        LEFT JOIN users u1 ON af.created_by = u1.id
        WHERE af.patient_id = $1
        ORDER BY af.file_created_date DESC
      `;

      const result = await query(queryText, [patient_id]);
      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  static async findAll(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      const where = [];
      const params = [];
      let idx = 1;

      // By default, only show complex cases (with clinical_proforma_id)
      if (!filters.include_all) {
        where.push(`af.clinical_proforma_id IS NOT NULL`);
      }

      if (filters.file_status) {
        where.push(`af.file_status = $${idx++}`);
        params.push(filters.file_status);
      }
      if (filters.is_active !== undefined) {
        where.push(`af.is_active = $${idx++}`);
        params.push(filters.is_active);
      }
      if (filters.created_by) {
        where.push(`af.created_by = $${idx++}`);
        params.push(filters.created_by);
      }
      if (filters.last_accessed_by) {
        where.push(`af.last_accessed_by = $${idx++}`);
        params.push(filters.last_accessed_by);
      }
      if (filters.date_from) {
        where.push(`af.file_created_date >= $${idx++}`);
        params.push(filters.date_from);
      }
      if (filters.date_to) {
        where.push(`af.file_created_date <= $${idx++}`);
        params.push(filters.date_to);
      }

      const whereClause = where.length ? `WHERE ${where.join(' AND ')}` : '';

      const queryText = `
        SELECT 
          af.*,
          p.name as patient_name,
          p.cr_no,
          p.psy_no,
          u1.name as created_by_name,
          u1.role as created_by_role,
          cp.assigned_doctor,
          u3.name as assigned_doctor_name,
          u3.role as assigned_doctor_role,
          cp.visit_date as proforma_visit_date
        FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af
        LEFT JOIN registered_patient p ON af.patient_id = p.id
        LEFT JOIN users u1 ON af.created_by = u1.id
        LEFT JOIN clinical_proforma cp ON af.clinical_proforma_id = cp.id
        LEFT JOIN users u3 ON cp.assigned_doctor = u3.id
        ${whereClause}
        ORDER BY af.file_created_date DESC
        LIMIT $${idx++} OFFSET $${idx++}
      `;
      params.push(limit, offset);

      const countQuery = `
        SELECT COUNT(*) as cnt FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} af ${whereClause}
      `;
      const countParams = params.slice(0, params.length - 2);

      const [result, countResult] = await Promise.all([
        query(queryText, params),
        query(countQuery, countParams)
      ]);

      const files = result.rows.map(row => new ADLFile(row));
      const total = parseInt(countResult.rows[0].cnt, 10);

      return {
        files: files.map(f => f.toJSON()),
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

  static async findActive() {
    try {
      const result = await query(
        `SELECT * FROM ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} WHERE file_status = 'retrieved' AND is_active = true ORDER BY last_accessed_date DESC`
      );
      return result.rows.map(row => new ADLFile(row));
    } catch (error) {
      throw error;
    }
  }

  async update(updateData) {
    try {
      const allowedFields = [
        'file_status', 'physical_file_location', 'last_accessed_date', 'last_accessed_by',
        'total_visits', 'is_active', 'notes', 'clinical_proforma_id',
        // All complex case fields can be updated
        'history_narrative', 'history_specific_enquiry', 'history_drug_intake',
        'history_treatment_place', 'history_treatment_dates', 'history_treatment_drugs',
        'history_treatment_response', 'informants', 'complaints_patient', 'complaints_informant',
        'past_history_medical', 'past_history_psychiatric_dates', 'past_history_psychiatric_diagnosis',
        'past_history_psychiatric_treatment', 'past_history_psychiatric_interim',
        'past_history_psychiatric_recovery', 'family_history_father_age',
        'family_history_father_education', 'family_history_father_occupation',
        'family_history_father_personality', 'family_history_father_deceased',
        'family_history_father_death_age', 'family_history_father_death_date',
        'family_history_father_death_cause', 'family_history_mother_age',
        'family_history_mother_education', 'family_history_mother_occupation',
        'family_history_mother_personality', 'family_history_mother_deceased',
        'family_history_mother_death_age', 'family_history_mother_death_date',
        'family_history_mother_death_cause', 'family_history_siblings',
        'diagnostic_formulation_summary', 'diagnostic_formulation_features',
        'diagnostic_formulation_psychodynamic', 'premorbid_personality_passive_active',
        'premorbid_personality_assertive', 'premorbid_personality_introvert_extrovert',
        'premorbid_personality_traits', 'premorbid_personality_hobbies',
        'premorbid_personality_habits', 'premorbid_personality_alcohol_drugs',
        'physical_appearance', 'physical_body_build', 'physical_pallor', 'physical_icterus',
        'physical_oedema', 'physical_lymphadenopathy', 'physical_pulse', 'physical_bp',
        'physical_height', 'physical_weight', 'physical_waist', 'physical_fundus',
        'physical_cvs_apex', 'physical_cvs_regularity', 'physical_cvs_heart_sounds',
        'physical_cvs_murmurs', 'physical_chest_expansion', 'physical_chest_percussion',
        'physical_chest_adventitious', 'physical_abdomen_tenderness', 'physical_abdomen_mass',
        'physical_abdomen_bowel_sounds', 'physical_cns_cranial', 'physical_cns_motor_sensory',
        'physical_cns_rigidity', 'physical_cns_involuntary', 'physical_cns_superficial_reflexes',
        'physical_cns_dtrs', 'physical_cns_plantar', 'physical_cns_cerebellar',
        'mse_general_demeanour', 'mse_general_tidy', 'mse_general_awareness',
        'mse_general_cooperation', 'mse_psychomotor_verbalization', 'mse_psychomotor_pressure',
        'mse_psychomotor_tension', 'mse_psychomotor_posture', 'mse_psychomotor_mannerism',
        'mse_psychomotor_catatonic', 'mse_affect_subjective', 'mse_affect_tone',
        'mse_affect_resting', 'mse_affect_fluctuation', 'mse_thought_flow', 'mse_thought_form',
        'mse_thought_content', 'mse_cognitive_consciousness', 'mse_cognitive_orientation_time',
        'mse_cognitive_orientation_place', 'mse_cognitive_orientation_person',
        'mse_cognitive_memory_immediate', 'mse_cognitive_memory_recent',
        'mse_cognitive_memory_remote', 'mse_cognitive_subtraction', 'mse_cognitive_digit_span',
        'mse_cognitive_counting', 'mse_cognitive_general_knowledge', 'mse_cognitive_calculation',
        'mse_cognitive_similarities', 'mse_cognitive_proverbs', 'mse_insight_understanding',
        'mse_insight_judgement', 'education_start_age', 'education_highest_class',
        'education_performance', 'education_disciplinary', 'education_peer_relationship',
        'education_hobbies', 'education_special_abilities', 'education_discontinue_reason',
        'occupation_jobs', 'sexual_menarche_age', 'sexual_menarche_reaction', 'sexual_education',
        'sexual_masturbation', 'sexual_contact', 'sexual_premarital_extramarital',
        'sexual_marriage_arranged', 'sexual_marriage_date', 'sexual_spouse_age',
        'sexual_spouse_occupation', 'sexual_adjustment_general', 'sexual_adjustment_sexual',
        'sexual_children', 'sexual_problems', 'religion_type', 'religion_participation',
        'religion_changes', 'living_residents', 'living_income_sharing', 'living_expenses',
        'living_kitchen', 'living_domestic_conflicts', 'living_social_class', 'living_inlaws',
        'home_situation_childhood', 'home_situation_parents_relationship',
        'home_situation_socioeconomic', 'home_situation_interpersonal', 'personal_birth_date',
        'personal_birth_place', 'personal_delivery_type', 'personal_complications_prenatal',
        'personal_complications_natal', 'personal_complications_postnatal',
        'development_weaning_age', 'development_first_words', 'development_three_words',
        'development_walking', 'development_neurotic_traits', 'development_nail_biting',
        'development_bedwetting', 'development_phobias', 'development_childhood_illness',
        'provisional_diagnosis', 'treatment_plan', 'consultant_comments'
      ];

      const updates = [];
      const values = [];
      let idx = 1;

      for (const [key, value] of Object.entries(updateData)) {
        if (allowedFields.includes(key) && value !== undefined) {
          // Handle JSONB fields
          if (['informants', 'complaints_patient', 'complaints_informant', 'family_history_siblings',
               'premorbid_personality_traits', 'occupation_jobs', 'sexual_children',
               'living_residents', 'living_inlaws'].includes(key)) {
            updates.push(`${key} = $${idx++}::jsonb`);
            values.push(typeof value === 'string' ? value : JSON.stringify(value));
          } else {
            updates.push(`${key} = $${idx++}`);
            values.push(value);
          }
        }
      }

      if (updates.length === 0) {
        throw new Error('No valid fields to update');
      }

      values.push(this.id);
      const result = await query(
        `UPDATE ${OUTPATIENT_INTAKE_RECORD_SCHEMA.tableName} SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${idx} RETURNING *`,
        values
      );

      if (result.rows.length) {
        Object.assign(this, result.rows[0]);
      }

      return this;
    } catch (error) {
      throw error;
    }
  }

  async delete() {
    try {
      await query(`UPDATE ${ADL_FILE_SCHEMA.tableName} SET is_active = false, file_status = 'archived' WHERE id = $1`, [this.id]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  static async getStats() {
    try {
      const result = await query(`
        SELECT 
          COUNT(*) as total_files,
          COUNT(CASE WHEN file_status = 'created' THEN 1 END) as created_files,
          COUNT(CASE WHEN file_status = 'stored' THEN 1 END) as stored_files,
          COUNT(CASE WHEN file_status = 'retrieved' THEN 1 END) as retrieved_files,
          COUNT(CASE WHEN file_status = 'active' THEN 1 END) as active_files,
          COUNT(CASE WHEN is_active = true THEN 1 END) as active_count
        FROM ${ADL_FILE_SCHEMA.tableName}
      `);
      return result.rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async getFilesByStatus() {
    try {
      const result = await query(`
        SELECT 
          file_status,
          COUNT(*) as count
        FROM ${ADL_FILE_SCHEMA.tableName}
        GROUP BY file_status
        ORDER BY file_status
      `);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }

  toJSON() {
    return {
      id: this.id,
      patient_id: this.patient_id,
      outpatient_intake_record_no: this.outpatient_intake_record_no,
      adl_no: this.adl_no, // Legacy alias
      created_by: this.created_by,
      clinical_proforma_id: this.clinical_proforma_id,
      file_status: this.file_status,
      physical_file_location: this.physical_file_location,
      file_created_date: this.file_created_date,
      last_accessed_date: this.last_accessed_date,
      last_accessed_by: this.last_accessed_by,
      total_visits: this.total_visits,
      is_active: this.is_active,
      notes: this.notes,
      created_at: this.created_at,
      updated_at: this.updated_at,
      patient_name: this.patient_name,
      cr_no: this.cr_no,
      psy_no: this.psy_no,
      created_by_name: this.created_by_name,
      created_by_role: this.created_by_role,
      last_accessed_by_name: this.last_accessed_by_name,
      assigned_doctor: this.assigned_doctor,
      assigned_doctor_name: this.assigned_doctor_name,
      assigned_doctor_role: this.assigned_doctor_role,
      proforma_visit_date: this.proforma_visit_date,
      // Include all complex case fields
      history_narrative: this.history_narrative,
      history_specific_enquiry: this.history_specific_enquiry,
      history_drug_intake: this.history_drug_intake,
      history_treatment_place: this.history_treatment_place,
      history_treatment_dates: this.history_treatment_dates,
      history_treatment_drugs: this.history_treatment_drugs,
      history_treatment_response: this.history_treatment_response,
      informants: this.informants,
      complaints_patient: this.complaints_patient,
      complaints_informant: this.complaints_informant,
      past_history_medical: this.past_history_medical,
      past_history_psychiatric_dates: this.past_history_psychiatric_dates,
      past_history_psychiatric_diagnosis: this.past_history_psychiatric_diagnosis,
      past_history_psychiatric_treatment: this.past_history_psychiatric_treatment,
      past_history_psychiatric_interim: this.past_history_psychiatric_interim,
      past_history_psychiatric_recovery: this.past_history_psychiatric_recovery,
      family_history_father_age: this.family_history_father_age,
      family_history_father_education: this.family_history_father_education,
      family_history_father_occupation: this.family_history_father_occupation,
      family_history_father_personality: this.family_history_father_personality,
      family_history_father_deceased: this.family_history_father_deceased,
      family_history_father_death_age: this.family_history_father_death_age,
      family_history_father_death_date: this.family_history_father_death_date,
      family_history_father_death_cause: this.family_history_father_death_cause,
      family_history_mother_age: this.family_history_mother_age,
      family_history_mother_education: this.family_history_mother_education,
      family_history_mother_occupation: this.family_history_mother_occupation,
      family_history_mother_personality: this.family_history_mother_personality,
      family_history_mother_deceased: this.family_history_mother_deceased,
      family_history_mother_death_age: this.family_history_mother_death_age,
      family_history_mother_death_date: this.family_history_mother_death_date,
      family_history_mother_death_cause: this.family_history_mother_death_cause,
      family_history_siblings: this.family_history_siblings,
      diagnostic_formulation_summary: this.diagnostic_formulation_summary,
      diagnostic_formulation_features: this.diagnostic_formulation_features,
      diagnostic_formulation_psychodynamic: this.diagnostic_formulation_psychodynamic,
      premorbid_personality_passive_active: this.premorbid_personality_passive_active,
      premorbid_personality_assertive: this.premorbid_personality_assertive,
      premorbid_personality_introvert_extrovert: this.premorbid_personality_introvert_extrovert,
      premorbid_personality_traits: this.premorbid_personality_traits,
      premorbid_personality_hobbies: this.premorbid_personality_hobbies,
      premorbid_personality_habits: this.premorbid_personality_habits,
      premorbid_personality_alcohol_drugs: this.premorbid_personality_alcohol_drugs,
      physical_appearance: this.physical_appearance,
      physical_body_build: this.physical_body_build,
      physical_pallor: this.physical_pallor,
      physical_icterus: this.physical_icterus,
      physical_oedema: this.physical_oedema,
      physical_lymphadenopathy: this.physical_lymphadenopathy,
      physical_pulse: this.physical_pulse,
      physical_bp: this.physical_bp,
      physical_height: this.physical_height,
      physical_weight: this.physical_weight,
      physical_waist: this.physical_waist,
      physical_fundus: this.physical_fundus,
      physical_cvs_apex: this.physical_cvs_apex,
      physical_cvs_regularity: this.physical_cvs_regularity,
      physical_cvs_heart_sounds: this.physical_cvs_heart_sounds,
      physical_cvs_murmurs: this.physical_cvs_murmurs,
      physical_chest_expansion: this.physical_chest_expansion,
      physical_chest_percussion: this.physical_chest_percussion,
      physical_chest_adventitious: this.physical_chest_adventitious,
      physical_abdomen_tenderness: this.physical_abdomen_tenderness,
      physical_abdomen_mass: this.physical_abdomen_mass,
      physical_abdomen_bowel_sounds: this.physical_abdomen_bowel_sounds,
      physical_cns_cranial: this.physical_cns_cranial,
      physical_cns_motor_sensory: this.physical_cns_motor_sensory,
      physical_cns_rigidity: this.physical_cns_rigidity,
      physical_cns_involuntary: this.physical_cns_involuntary,
      physical_cns_superficial_reflexes: this.physical_cns_superficial_reflexes,
      physical_cns_dtrs: this.physical_cns_dtrs,
      physical_cns_plantar: this.physical_cns_plantar,
      physical_cns_cerebellar: this.physical_cns_cerebellar,
      mse_general_demeanour: this.mse_general_demeanour,
      mse_general_tidy: this.mse_general_tidy,
      mse_general_awareness: this.mse_general_awareness,
      mse_general_cooperation: this.mse_general_cooperation,
      mse_psychomotor_verbalization: this.mse_psychomotor_verbalization,
      mse_psychomotor_pressure: this.mse_psychomotor_pressure,
      mse_psychomotor_tension: this.mse_psychomotor_tension,
      mse_psychomotor_posture: this.mse_psychomotor_posture,
      mse_psychomotor_mannerism: this.mse_psychomotor_mannerism,
      mse_psychomotor_catatonic: this.mse_psychomotor_catatonic,
      mse_affect_subjective: this.mse_affect_subjective,
      mse_affect_tone: this.mse_affect_tone,
      mse_affect_resting: this.mse_affect_resting,
      mse_affect_fluctuation: this.mse_affect_fluctuation,
      mse_thought_flow: this.mse_thought_flow,
      mse_thought_form: this.mse_thought_form,
      mse_thought_content: this.mse_thought_content,
      mse_cognitive_consciousness: this.mse_cognitive_consciousness,
      mse_cognitive_orientation_time: this.mse_cognitive_orientation_time,
      mse_cognitive_orientation_place: this.mse_cognitive_orientation_place,
      mse_cognitive_orientation_person: this.mse_cognitive_orientation_person,
      mse_cognitive_memory_immediate: this.mse_cognitive_memory_immediate,
      mse_cognitive_memory_recent: this.mse_cognitive_memory_recent,
      mse_cognitive_memory_remote: this.mse_cognitive_memory_remote,
      mse_cognitive_subtraction: this.mse_cognitive_subtraction,
      mse_cognitive_digit_span: this.mse_cognitive_digit_span,
      mse_cognitive_counting: this.mse_cognitive_counting,
      mse_cognitive_general_knowledge: this.mse_cognitive_general_knowledge,
      mse_cognitive_calculation: this.mse_cognitive_calculation,
      mse_cognitive_similarities: this.mse_cognitive_similarities,
      mse_cognitive_proverbs: this.mse_cognitive_proverbs,
      mse_insight_understanding: this.mse_insight_understanding,
      mse_insight_judgement: this.mse_insight_judgement,
      education_start_age: this.education_start_age,
      education_highest_class: this.education_highest_class,
      education_performance: this.education_performance,
      education_disciplinary: this.education_disciplinary,
      education_peer_relationship: this.education_peer_relationship,
      education_hobbies: this.education_hobbies,
      education_special_abilities: this.education_special_abilities,
      education_discontinue_reason: this.education_discontinue_reason,
      occupation_jobs: this.occupation_jobs,
      sexual_menarche_age: this.sexual_menarche_age,
      sexual_menarche_reaction: this.sexual_menarche_reaction,
      sexual_education: this.sexual_education,
      sexual_masturbation: this.sexual_masturbation,
      sexual_contact: this.sexual_contact,
      sexual_premarital_extramarital: this.sexual_premarital_extramarital,
      sexual_marriage_arranged: this.sexual_marriage_arranged,
      sexual_marriage_date: this.sexual_marriage_date,
      sexual_spouse_age: this.sexual_spouse_age,
      sexual_spouse_occupation: this.sexual_spouse_occupation,
      sexual_adjustment_general: this.sexual_adjustment_general,
      sexual_adjustment_sexual: this.sexual_adjustment_sexual,
      sexual_children: this.sexual_children,
      sexual_problems: this.sexual_problems,
      religion_type: this.religion_type,
      religion_participation: this.religion_participation,
      religion_changes: this.religion_changes,
      living_residents: this.living_residents,
      living_income_sharing: this.living_income_sharing,
      living_expenses: this.living_expenses,
      living_kitchen: this.living_kitchen,
      living_domestic_conflicts: this.living_domestic_conflicts,
      living_social_class: this.living_social_class,
      living_inlaws: this.living_inlaws,
      home_situation_childhood: this.home_situation_childhood,
      home_situation_parents_relationship: this.home_situation_parents_relationship,
      home_situation_socioeconomic: this.home_situation_socioeconomic,
      home_situation_interpersonal: this.home_situation_interpersonal,
      personal_birth_date: this.personal_birth_date,
      personal_birth_place: this.personal_birth_place,
      personal_delivery_type: this.personal_delivery_type,
      personal_complications_prenatal: this.personal_complications_prenatal,
      personal_complications_natal: this.personal_complications_natal,
      personal_complications_postnatal: this.personal_complications_postnatal,
      development_weaning_age: this.development_weaning_age,
      development_first_words: this.development_first_words,
      development_three_words: this.development_three_words,
      development_walking: this.development_walking,
      development_neurotic_traits: this.development_neurotic_traits,
      development_nail_biting: this.development_nail_biting,
      development_bedwetting: this.development_bedwetting,
      development_phobias: this.development_phobias,
      development_childhood_illness: this.development_childhood_illness,
      provisional_diagnosis: this.provisional_diagnosis,
      treatment_plan: this.treatment_plan,
      consultant_comments: this.consultant_comments
    };
  }
}

module.exports = ADLFile;

