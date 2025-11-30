/**
 * Centralized Database Schema Definitions
 * 
 * This file contains all database table schemas used across microservices.
 * Import and use these schemas instead of repeating them in each service.
 * 
 * Usage:
 *   const { USER_SCHEMA, PATIENT_SCHEMA } = require('../../../common/utils/schemas');
 */

/**
 * Users Table Schema
 */
const USER_SCHEMA = {
  tableName: 'users',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    name: 'VARCHAR(255) NOT NULL',
    role: 'VARCHAR(50) NOT NULL',
    email: 'VARCHAR(255) NOT NULL UNIQUE',
    password_hash: 'TEXT NOT NULL',
    two_factor_secret: 'VARCHAR(32)',
    two_factor_enabled: 'BOOLEAN DEFAULT false',
    backup_codes: 'TEXT[]',
    is_active: 'BOOLEAN DEFAULT true',
    last_login: 'TIMESTAMP',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    mobile: 'VARCHAR(15)'
  },
  constraints: [
    "CHECK (role IN ('Admin', 'Faculty', 'Resident', 'Psychiatric Welfare Officer'))"
  ],
  indexes: ['email', 'role', 'is_active']
};

/**
 * Out Patients Card Table Schema (Master patient demographic + registration)
 */
const OUT_PATIENTS_CARD_SCHEMA = {
  tableName: 'out_patients_card',
  columns: {
    cr_no: 'VARCHAR(50) PRIMARY KEY',
    date: 'DATE',
    name: 'TEXT NOT NULL',
    mobile_no: 'VARCHAR(15)',
    age: 'INTEGER',
    sex: 'VARCHAR(10)',
    category: 'VARCHAR(50)',
    father_name: 'TEXT',
    department: 'TEXT',
    unit_consit: 'TEXT',
    room_no: 'TEXT',
    serial_no: 'TEXT',
    file_no: 'TEXT',
    unit_days: 'TEXT',
    contact_number: 'VARCHAR(15)',
    address_line: 'TEXT',
    country: 'TEXT',
    state: 'TEXT',
    district: 'TEXT',
    city: 'TEXT',
    pin_code: 'VARCHAR(10)',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  indexes: ['cr_no', 'name', 'mobile_no']
};

/**
 * Out Patient Record Table Schema (Extends out_patients_card)
 */
const OUT_PATIENT_RECORD_SCHEMA = {
  tableName: 'out_patient_record',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    cr_no: 'VARCHAR(50) NOT NULL',
    psy_no: 'TEXT',
    special_clinic_no: 'TEXT',
    seen_in_walk_in_on: 'DATE',
    worked_up_on: 'DATE',
    marital_status: 'TEXT',
    year_of_marriage: 'INTEGER',
    no_of_children_male: 'INTEGER DEFAULT 0',
    no_of_children_female: 'INTEGER DEFAULT 0',
    occupation: 'TEXT',
    education: 'TEXT',
    locality: 'TEXT',
    patient_income: 'NUMERIC(12,2)',
    family_income: 'NUMERIC(12,2)',
    religion: 'TEXT',
    family_type: 'TEXT',
    head_name: 'TEXT',
    head_age: 'INTEGER',
    head_relationship: 'TEXT',
    head_education: 'TEXT',
    head_occupation: 'TEXT',
    head_income: 'NUMERIC(12,2)',
    distance_from_hospital: 'TEXT',
    mobility: 'TEXT',
    referred_by: 'TEXT',
    address_line: 'TEXT',
    country: 'TEXT',
    state: 'TEXT',
    district: 'TEXT',
    city: 'TEXT',
    pin_code: 'VARCHAR(10)',
    present_address_line_: 'TEXT',
    present_city_town_village: 'TEXT',
    present_district: 'TEXT',
    present_state: 'TEXT',
    present_pin_code: 'VARCHAR(10)',
    present_country: 'TEXT',
    local_address: 'TEXT',
    assigned_doctor_name: 'TEXT',
    assigned_doctor_id: 'INTEGER',
    assigned_room: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (cr_no) REFERENCES out_patients_card(cr_no)',
    'FOREIGN KEY (assigned_doctor_id) REFERENCES users(id)'
  ],
  indexes: ['cr_no', 'psy_no', 'assigned_doctor_id']
};

/**
 * Registered Patient Table Schema (Legacy - kept for backward compatibility)
 */
const PATIENT_SCHEMA = {
  tableName: 'registered_patient',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    cr_no: 'VARCHAR(50)',
    psy_no: 'TEXT',
    special_clinic_no: 'TEXT',
    outpatient_intake_record_no: 'VARCHAR(50)',
    date: 'DATE',
    name: 'TEXT NOT NULL',
    contact_number: 'TEXT',
    age: 'INTEGER',
    sex: 'VARCHAR(10)',
    category: 'VARCHAR(50)',
    father_name: 'TEXT',
    department: 'TEXT',
    unit_consit: 'TEXT',
    room_no: 'TEXT',
    serial_no: 'TEXT',
    file_no: 'TEXT',
    unit_days: 'TEXT',
    seen_in_walk_in_on: 'DATE',
    worked_up_on: 'DATE',
    age_group: 'TEXT',
    marital_status: 'TEXT',
    year_of_marriage: 'INTEGER',
    no_of_children_male: 'INTEGER DEFAULT 0',
    no_of_children_female: 'INTEGER DEFAULT 0',
    occupation: 'TEXT',
    education: 'TEXT',
    locality: 'TEXT',
    income: 'NUMERIC(12,2)',
    religion: 'TEXT',
    family_type: 'TEXT',
    head_name: 'TEXT',
    head_age: 'INTEGER',
    head_relationship: 'TEXT',
    head_education: 'TEXT',
    head_occupation: 'TEXT',
    head_income: 'NUMERIC(12,2)',
    distance_from_hospital: 'TEXT',
    mobility: 'TEXT',
    referred_by: 'TEXT',
    address_line: 'TEXT',
    country: 'TEXT',
    state: 'TEXT',
    district: 'TEXT',
    city: 'TEXT',
    pin_code: 'TEXT',
    permanent_address_line_1: 'TEXT',
    permanent_city_town_village: 'TEXT',
    permanent_district: 'TEXT',
    permanent_state: 'TEXT',
    permanent_pin_code: 'TEXT',
    permanent_country: 'TEXT',
    present_address_line_1: 'TEXT',
    present_address_line_2: 'TEXT',
    present_city_town_village: 'TEXT',
    present_city_town_village_2: 'TEXT',
    present_district: 'TEXT',
    present_district_2: 'TEXT',
    present_state: 'TEXT',
    present_state_2: 'TEXT',
    present_pin_code: 'TEXT',
    present_pin_code_2: 'TEXT',
    present_country: 'TEXT',
    present_country_2: 'TEXT',
    local_address: 'TEXT',
    assigned_doctor_id: 'INTEGER',
    assigned_doctor_name: 'TEXT',
    assigned_room: 'TEXT',
    filled_by: 'INTEGER',
    has_outpatient_intake_record: 'BOOLEAN DEFAULT false',
    file_status: 'VARCHAR(20)',
    case_complexity: 'VARCHAR(20)',
    patient_income: 'NUMERIC(12,2)',
    family_income: 'NUMERIC(12,2)',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (assigned_doctor_id) REFERENCES users(id)',
    'FOREIGN KEY (filled_by) REFERENCES users(id)'
  ],
  indexes: ['cr_no', 'psy_no', 'outpatient_intake_record_no', 'assigned_doctor_id', 'filled_by']
};

/**
 * Adult Walk-in Clinical Proforma Table Schema
 */
const ADULT_WALK_IN_CLINICAL_PERFORMA_SCHEMA = {
  tableName: 'adult_walk_in_clinical_performa',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    patient_id: 'INTEGER NOT NULL',
    date: 'DATE',
    name: 'TEXT',
    age: 'INTEGER',
    sex: 'VARCHAR(10)',
    visit_date: 'DATE NOT NULL',
    visit_type: 'VARCHAR(50)',
    room_no: 'VARCHAR(50)',
    assigned_doctor: 'INTEGER',
    attachment: 'TEXT',
    informant_present: 'BOOLEAN',
    nature_of_information: 'TEXT',
    onset_duration: 'TEXT',
    course: 'TEXT',
    precipitating_factor: 'TEXT',
    illness_duration: 'TEXT',
    current_episode_since: 'DATE',
    mood: 'TEXT',
    behaviour: 'TEXT',
    speech: 'TEXT',
    thought: 'TEXT',
    perception: 'TEXT',
    somatic: 'TEXT',
    bio_functions: 'TEXT',
    adjustment: 'TEXT',
    cognitive_function: 'TEXT',
    fits: 'TEXT',
    sexual_problem: 'TEXT',
    substance_use: 'TEXT',
    past_history: 'TEXT',
    family_history: 'TEXT',
    associated_medical_surgical: 'TEXT',
    mse_behaviour: 'TEXT',
    mse_affect: 'TEXT',
    mse_thought: 'TEXT',
    mse_delusions: 'TEXT',
    mse_perception: 'TEXT',
    mse_cognitive_function: 'TEXT',
    gpe: 'TEXT',
    diagnosis: 'TEXT',
    icd_code: 'VARCHAR(20)',
    disposal: 'TEXT',
    workup_appointment: 'DATE',
    referred_to: 'TEXT',
    treatment_prescribed: 'TEXT',
    prescriptions: 'TEXT',
    doctor_decision: 'VARCHAR(50)',
    requires_adl_file: 'BOOLEAN DEFAULT false',
    adl_reasoning: 'TEXT',
    adl_file_id: 'INTEGER',
    patient_name: 'TEXT',
    cr_no: 'VARCHAR(50)',
    psy_no: 'TEXT',
    doctor_name: 'TEXT',
    doctor_role: 'VARCHAR(50)',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (patient_id) REFERENCES out_patient_record(id)',
    'FOREIGN KEY (assigned_doctor) REFERENCES users(id)',
    'FOREIGN KEY (adl_file_id) REFERENCES out_patient_intake_record(id)'
  ],
  indexes: ['patient_id', 'visit_date', 'assigned_doctor', 'adl_file_id', 'cr_no']
};

/**
 * Clinical Proforma Table Schema (Legacy alias for backward compatibility)
 */
const CLINICAL_PROFORMA_SCHEMA = ADULT_WALK_IN_CLINICAL_PERFORMA_SCHEMA;

/**
 * Out Patient Intake Record Table Schema
 */
const OUT_PATIENT_INTAKE_RECORD_SCHEMA = {
  tableName: 'out_patient_intake_record',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    patient_id: 'INTEGER NOT NULL',
    adl_no: 'VARCHAR(50)',
    created_by: 'INTEGER NOT NULL',
    clinical_proforma_id: 'INTEGER',
    file_status: 'VARCHAR(20) DEFAULT \'created\'',
    physical_file_location: 'TEXT',
    file_created_date: 'DATE',
    last_accessed_date: 'DATE',
    last_accessed_by: 'INTEGER',
    total_visits: 'INTEGER DEFAULT 1',
    is_active: 'BOOLEAN DEFAULT true',
    notes: 'TEXT',
    attachment: 'TEXT',
    date: 'DATE',
    name: 'TEXT',
    age: 'INTEGER',
    sex: 'VARCHAR(10)',
    patient_name: 'TEXT',
    cr_no: 'VARCHAR(50)',
    psy_no: 'TEXT',
    created_by_name: 'TEXT',
    created_by_role: 'VARCHAR(50)',
    last_accessed_by_name: 'TEXT',
    assigned_doctor: 'INTEGER',
    assigned_doctor_name: 'TEXT',
    assigned_doctor_role: 'VARCHAR(50)',
    proforma_visit_date: 'DATE',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    
    // History fields
    history_narrative: 'TEXT',
    history_specific_enquiry: 'TEXT',
    history_drug_intake: 'TEXT',
    history_treatment_place: 'TEXT',
    history_treatment_dates: 'DATE',
    history_treatment_drugs: 'TEXT',
    history_treatment_response: 'TEXT',
    
    // Informants and complaints (JSONB)
    informants: 'JSONB DEFAULT \'[]\'::jsonb',
    complaints_patient: 'JSONB DEFAULT \'[]\'::jsonb',
    complaints_informant: 'JSONB DEFAULT \'[]\'::jsonb',
    
    // Onset and course
    onset_duration: 'TEXT',
    precipitating_factor: 'TEXT',
    course: 'TEXT',
    
    // Past history
    past_history_medical: 'TEXT',
    past_history_psychiatric_dates: 'DATE',
    past_history_psychiatric_diagnosis: 'TEXT',
    past_history_psychiatric_treatment: 'TEXT',
    past_history_psychiatric_interim: 'TEXT',
    past_history_psychiatric_recovery: 'TEXT',
    
    // Family History - Father
    family_history_father_age: 'INTEGER',
    family_history_father_education: 'TEXT',
    family_history_father_occupation: 'TEXT',
    family_history_father_personality: 'TEXT',
    family_history_father_deceased: 'BOOLEAN DEFAULT false',
    family_history_father_death_age: 'INTEGER',
    family_history_father_death_date: 'DATE',
    family_history_father_death_cause: 'TEXT',
    
    // Family History - Mother
    family_history_mother_age: 'INTEGER',
    family_history_mother_education: 'TEXT',
    family_history_mother_occupation: 'TEXT',
    family_history_mother_personality: 'TEXT',
    family_history_mother_deceased: 'BOOLEAN DEFAULT false',
    family_history_mother_death_age: 'INTEGER',
    family_history_mother_death_date: 'DATE',
    family_history_mother_death_cause: 'TEXT',
    
    // Family History - Siblings and Others
    family_history_siblings: 'JSONB DEFAULT \'[]\'::jsonb',
    family_history_other_relatives: 'JSONB DEFAULT \'[]\'::jsonb',
    
    // Diagnostic Formulation
    diagnostic_formulation_summary: 'TEXT',
    diagnostic_formulation_features: 'TEXT',
    diagnostic_formulation_psychodynamic: 'TEXT',
    
    // Premorbid Personality
    premorbid_personality_passive_active: 'TEXT',
    premorbid_personality_assertive: 'TEXT',
    premorbid_personality_introvert_extrovert: 'TEXT',
    premorbid_personality_traits: 'JSONB DEFAULT \'[]\'::jsonb',
    premorbid_personality_hobbies: 'TEXT',
    premorbid_personality_habits: 'TEXT',
    premorbid_personality_alcohol_drugs: 'TEXT',
    
    // Physical Examination - General
    physical_appearance: 'TEXT',
    physical_body_build: 'TEXT',
    physical_pallor: 'BOOLEAN DEFAULT false',
    physical_icterus: 'BOOLEAN DEFAULT false',
    physical_oedema: 'BOOLEAN DEFAULT false',
    physical_lymphadenopathy: 'BOOLEAN DEFAULT false',
    physical_pulse: 'TEXT',
    physical_bp: 'TEXT',
    physical_height: 'TEXT',
    physical_weight: 'TEXT',
    physical_waist: 'TEXT',
    physical_fundus: 'TEXT',
    
    // Physical Examination - CVS
    physical_cvs_apex: 'TEXT',
    physical_cvs_regularity: 'TEXT',
    physical_cvs_heart_sounds: 'TEXT',
    physical_cvs_murmurs: 'TEXT',
    
    // Physical Examination - Chest
    physical_chest_expansion: 'TEXT',
    physical_chest_percussion: 'TEXT',
    physical_chest_adventitious: 'TEXT',
    
    // Physical Examination - Abdomen
    physical_abdomen_tenderness: 'TEXT',
    physical_abdomen_mass: 'TEXT',
    physical_abdomen_bowel_sounds: 'TEXT',
    
    // Physical Examination - CNS
    physical_cns_cranial: 'TEXT',
    physical_cns_motor_sensory: 'TEXT',
    physical_cns_rigidity: 'TEXT',
    physical_cns_involuntary: 'TEXT',
    physical_cns_superficial_reflexes: 'TEXT',
    physical_cns_dtrs: 'TEXT',
    physical_cns_plantar: 'TEXT',
    physical_cns_cerebellar: 'TEXT',
    
    // MSE - General
    mse_general_demeanour: 'TEXT',
    mse_general_tidy: 'TEXT',
    mse_general_awareness: 'TEXT',
    mse_general_cooperation: 'TEXT',
    
    // MSE - Psychomotor
    mse_psychomotor_verbalization: 'TEXT',
    mse_psychomotor_pressure: 'TEXT',
    mse_psychomotor_tension: 'TEXT',
    mse_psychomotor_posture: 'TEXT',
    mse_psychomotor_mannerism: 'TEXT',
    mse_psychomotor_catatonic: 'TEXT',
    
    // MSE - Affect
    mse_affect_subjective: 'TEXT',
    mse_affect_tone: 'TEXT',
    mse_affect_resting: 'TEXT',
    mse_affect_fluctuation: 'TEXT',
    
    // MSE - Thought
    mse_thought_flow: 'TEXT',
    mse_thought_form: 'TEXT',
    mse_thought_content: 'TEXT',
    
    // MSE - Cognitive
    mse_cognitive_consciousness: 'TEXT',
    mse_cognitive_orientation_time: 'TEXT',
    mse_cognitive_orientation_place: 'TEXT',
    mse_cognitive_orientation_person: 'TEXT',
    mse_cognitive_memory_immediate: 'TEXT',
    mse_cognitive_memory_recent: 'TEXT',
    mse_cognitive_memory_remote: 'TEXT',
    mse_cognitive_subtraction: 'TEXT',
    mse_cognitive_digit_span: 'TEXT',
    mse_cognitive_counting: 'TEXT',
    mse_cognitive_general_knowledge: 'TEXT',
    mse_cognitive_calculation: 'TEXT',
    mse_cognitive_similarities: 'TEXT',
    mse_cognitive_proverbs: 'TEXT',
    mse_insight_understanding: 'TEXT',
    mse_insight_judgement: 'TEXT',
    
    // Education History
    education_start_age: 'TEXT',
    education_highest_class: 'TEXT',
    education_performance: 'TEXT',
    education_disciplinary: 'TEXT',
    education_peer_relationship: 'TEXT',
    education_hobbies: 'TEXT',
    education_special_abilities: 'TEXT',
    education_discontinue_reason: 'TEXT',
    
    // Occupation History
    occupation_jobs: 'JSONB DEFAULT \'[]\'::jsonb',
    
    // Sexual History
    sexual_menarche_age: 'TEXT',
    sexual_menarche_reaction: 'TEXT',
    sexual_education: 'TEXT',
    sexual_masturbation: 'TEXT',
    sexual_contact: 'TEXT',
    sexual_premarital_extramarital: 'TEXT',
    sexual_marriage_arranged: 'TEXT',
    sexual_marriage_date: 'DATE',
    sexual_spouse_age: 'TEXT',
    sexual_spouse_occupation: 'TEXT',
    sexual_adjustment_general: 'TEXT',
    sexual_adjustment_sexual: 'TEXT',
    sexual_children: 'JSONB DEFAULT \'[]\'::jsonb',
    sexual_problems: 'TEXT',
    
    // Religion
    religion_type: 'TEXT',
    religion_participation: 'TEXT',
    religion_changes: 'TEXT',
    
    // Living Situation
    living_residents: 'JSONB DEFAULT \'[]\'::jsonb',
    living_income_sharing: 'TEXT',
    living_expenses: 'TEXT',
    living_kitchen: 'TEXT',
    living_domestic_conflicts: 'TEXT',
    living_social_class: 'TEXT',
    living_inlaws: 'JSONB DEFAULT \'[]\'::jsonb',
    
    // Home Situation
    home_situation_childhood: 'TEXT',
    home_situation_parents_relationship: 'TEXT',
    home_situation_socioeconomic: 'TEXT',
    home_situation_interpersonal: 'TEXT',
    
    // Personal History - Birth
    personal_birth_date: 'DATE',
    personal_birth_place: 'TEXT',
    personal_delivery_type: 'TEXT',
    personal_complications_prenatal: 'TEXT',
    personal_complications_natal: 'TEXT',
    personal_complications_postnatal: 'TEXT',
    
    // Development History
    development_weaning_age: 'TEXT',
    development_first_words: 'TEXT',
    development_three_words: 'TEXT',
    development_walking: 'TEXT',
    development_neurotic_traits: 'TEXT',
    development_nail_biting: 'TEXT',
    development_bedwetting: 'TEXT',
    development_phobias: 'TEXT',
    development_childhood_illness: 'TEXT',
    
    // Personal History (legacy fields - kept for backward compatibility)
    personal_history_birth: 'TEXT',
    personal_history_development: 'TEXT',
    personal_history_education: 'TEXT',
    personal_history_occupation: 'TEXT',
    personal_history_marital: 'TEXT',
    personal_history_sexual: 'TEXT',
    personal_history_premorbid_personality: 'TEXT',
    
    // Mental Status Examination (legacy - kept for backward compatibility)
    mental_status_examination: 'TEXT',
    
    // Physical Examination (legacy - kept for backward compatibility)
    physical_examination: 'TEXT',
    
    // Investigations
    investigations: 'TEXT',
    
    // Diagnosis and Treatment
    diagnosis: 'TEXT',
    icd_code: 'VARCHAR(20)',
    provisional_diagnosis: 'TEXT',
    treatment_plan: 'TEXT',
    prognosis: 'TEXT',
    consultant_comments: 'TEXT',
    
    // Assigned Doctor
    assigned_doctor: 'INTEGER',
    assigned_doctor_name: 'TEXT',
    assigned_doctor_role: 'TEXT'
  },
  foreignKeys: [
    'FOREIGN KEY (patient_id) REFERENCES out_patient_record(id)',
    'FOREIGN KEY (created_by) REFERENCES users(id)',
    'FOREIGN KEY (clinical_proforma_id) REFERENCES adult_walk_in_clinical_performa(id)',
    'FOREIGN KEY (last_accessed_by) REFERENCES users(id)',
    'FOREIGN KEY (assigned_doctor) REFERENCES users(id)'
  ],
  indexes: ['patient_id', 'adl_no', 'created_by', 'clinical_proforma_id', 'file_status', 'assigned_doctor']
};

/**
 * Outpatient Intake Records Table Schema (Legacy alias for backward compatibility)
 */
const OUTPATIENT_INTAKE_RECORD_SCHEMA = OUT_PATIENT_INTAKE_RECORD_SCHEMA;

/**
 * Prescription Table Schema
 */
const PRESCRIPTION_SCHEMA = {
  tableName: 'prescription',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    patient_id: 'INTEGER NOT NULL',
    clinical_proforma_id: 'INTEGER',
    prescriptions: 'JSONB DEFAULT \'[]\'::jsonb',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (patient_id) REFERENCES out_patient_record(id)',
    'FOREIGN KEY (clinical_proforma_id) REFERENCES adult_walk_in_clinical_performa(id)'
  ],
  indexes: ['patient_id', 'clinical_proforma_id']
};

/**
 * Patient Visits Table Schema (Legacy - kept for backward compatibility)
 */
const PATIENT_VISIT_SCHEMA = {
  tableName: 'patient_visits',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    patient_id: 'INTEGER NOT NULL',
    visit_date: 'DATE NOT NULL',
    visit_type: 'VARCHAR(50)',
    has_file: 'BOOLEAN DEFAULT false',
    assigned_doctor_id: 'INTEGER',
    room_no: 'VARCHAR(50)',
    visit_status: 'VARCHAR(50) DEFAULT \'pending\'',
    notes: 'TEXT',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (patient_id) REFERENCES out_patient_record(id)',
    'FOREIGN KEY (assigned_doctor_id) REFERENCES users(id)'
  ],
  indexes: ['patient_id', 'visit_date', 'assigned_doctor_id', 'visit_type']
};

/**
 * Audit Logs Table Schema
 */
const AUDIT_LOG_SCHEMA = {
  tableName: 'audit_logs',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    user_id: 'INTEGER NOT NULL',
    table_name: 'VARCHAR(100) NOT NULL',
    record_id: 'INTEGER NOT NULL',
    action: 'VARCHAR(20) NOT NULL',
    old_data: 'JSONB',
    new_data: 'JSONB',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (user_id) REFERENCES users(id)'
  ],
  indexes: ['user_id', 'table_name', 'record_id', 'action', 'created_at']
};

/**
 * File Uploads Table Schema (Universal file storage)
 */
const FILE_UPLOAD_SCHEMA = {
  tableName: 'file_uploads',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    file_name: 'TEXT NOT NULL',
    file_type: 'VARCHAR(100)',
    file_size: 'BIGINT',
    storage_path: 'TEXT NOT NULL',
    uploaded_by: 'INTEGER NOT NULL',
    reference_table: 'VARCHAR(100) NOT NULL',
    reference_id: 'INTEGER NOT NULL',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (uploaded_by) REFERENCES users(id)'
  ],
  indexes: ['uploaded_by', 'reference_table', 'reference_id', 'file_name']
};

/**
 * Patient Files Table Schema
 */
const PATIENT_FILE_SCHEMA = {
  tableName: 'patient_files',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    patient_id: 'INTEGER NOT NULL',
    attachment: 'JSONB DEFAULT \'[]\'::jsonb',
    user_id: 'INTEGER NOT NULL',
    role: 'JSONB DEFAULT \'[]\'::jsonb',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    updated_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (patient_id) REFERENCES registered_patient(id)',
    'FOREIGN KEY (user_id) REFERENCES users(id)'
  ],
  indexes: ['patient_id', 'user_id']
};

/**
 * Refresh Tokens Table Schema
 */
const REFRESH_TOKEN_SCHEMA = {
  tableName: 'refresh_tokens',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    user_id: 'INTEGER NOT NULL',
    token: 'UUID NOT NULL UNIQUE',
    device_info: 'VARCHAR(255)',
    ip_address: 'VARCHAR(45)',
    last_activity: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP',
    expires_at: 'TIMESTAMP NOT NULL',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
  ],
  indexes: ['user_id', 'token', 'expires_at']
};

/**
 * Login OTPs Table Schema
 */
const LOGIN_OTP_SCHEMA = {
  tableName: 'login_otps',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    user_id: 'INTEGER NOT NULL',
    otp: 'VARCHAR(6) NOT NULL',
    expires_at: 'TIMESTAMP NOT NULL',
    used: 'BOOLEAN DEFAULT false',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
  ],
  indexes: ['user_id', 'otp', 'expires_at', 'used']
};

/**
 * Password Reset Tokens Table Schema
 */
const PASSWORD_RESET_TOKEN_SCHEMA = {
  tableName: 'password_reset_tokens',
  columns: {
    id: 'SERIAL PRIMARY KEY',
    user_id: 'INTEGER NOT NULL',
    token: 'UUID NOT NULL UNIQUE',
    otp: 'VARCHAR(6) NOT NULL',
    expires_at: 'TIMESTAMP NOT NULL',
    used: 'BOOLEAN DEFAULT false',
    created_at: 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP'
  },
  foreignKeys: [
    'FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE'
  ],
  indexes: ['user_id', 'token', 'otp', 'expires_at', 'used']
};

/**
 * Helper function to get column names from schema
 */
function getColumnNames(schema) {
  return Object.keys(schema.columns);
}

/**
 * Helper function to get column list for SELECT queries
 */
function getSelectColumns(schema, alias = '') {
  const prefix = alias ? `${alias}.` : '';
  return getColumnNames(schema).map(col => `${prefix}${col}`).join(', ');
}

/**
 * Helper function to get column list for INSERT queries
 */
function getInsertColumns(schema) {
  return getColumnNames(schema).filter(col => 
    !schema.columns[col].includes('SERIAL') && 
    !schema.columns[col].includes('DEFAULT CURRENT_TIMESTAMP')
  );
}

/**
 * Helper function to generate placeholder values for INSERT
 */
function getInsertPlaceholders(schema, startIndex = 1) {
  const columns = getInsertColumns(schema);
  return columns.map((_, index) => `$${startIndex + index}`).join(', ');
}

/**
 * Helper function to generate UPDATE SET clause
 */
function getUpdateSetClause(schema, excludeColumns = [], startIndex = 1) {
  const columns = getInsertColumns(schema).filter(col => !excludeColumns.includes(col));
  let index = startIndex;
  return columns.map(col => {
    const placeholder = `$${index++}`;
    return `${col} = ${placeholder}`;
  }).join(', ');
}

/**
 * Export all schemas and helper functions
 */
module.exports = {
  // New Schemas
  OUT_PATIENTS_CARD_SCHEMA,
  OUT_PATIENT_RECORD_SCHEMA,
  ADULT_WALK_IN_CLINICAL_PERFORMA_SCHEMA,
  OUT_PATIENT_INTAKE_RECORD_SCHEMA,
  PRESCRIPTION_SCHEMA,
  AUDIT_LOG_SCHEMA,
  FILE_UPLOAD_SCHEMA,
  
  // Legacy Schemas (for backward compatibility)
  USER_SCHEMA,
  PATIENT_SCHEMA,
  CLINICAL_PROFORMA_SCHEMA,
  OUTPATIENT_INTAKE_RECORD_SCHEMA,
  PATIENT_VISIT_SCHEMA,
  PATIENT_FILE_SCHEMA,
  REFRESH_TOKEN_SCHEMA,
  LOGIN_OTP_SCHEMA,
  PASSWORD_RESET_TOKEN_SCHEMA,
  
  // Legacy alias for backward compatibility
  ADL_FILE_SCHEMA: null, // Will be set below
  
  // Helper functions
  getColumnNames,
  getSelectColumns,
  getInsertColumns,
  getInsertPlaceholders,
  getUpdateSetClause
};

// Set legacy aliases for backward compatibility
module.exports.ADL_FILE_SCHEMA = module.exports.OUT_PATIENT_INTAKE_RECORD_SCHEMA;
