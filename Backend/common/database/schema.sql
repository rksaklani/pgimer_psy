-- ============================================================================
-- PGIMER EMRS Database Schema
-- ============================================================================
-- This file contains the complete database schema for all 9 core tables
-- Run this script to create a fresh database
--
-- Usage:
--   psql -U postgres -d pgi_emrs -f schema.sql
--   OR
--   Connect to your database and run this file
-- ============================================================================

-- Drop existing tables if they exist (in reverse dependency order)
DROP TABLE IF EXISTS file_uploads CASCADE;
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS prescription CASCADE;
DROP TABLE IF EXISTS out_patient_intake_record CASCADE;
DROP TABLE IF EXISTS adult_walk_in_clinical_performa CASCADE;
DROP TABLE IF EXISTS patient_visits CASCADE;
DROP TABLE IF EXISTS out_patient_record CASCADE;
DROP TABLE IF EXISTS out_patients_card CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- ============================================================================
-- 1. USERS TABLE
-- ============================================================================
-- Authentication + role-based info
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    mobile VARCHAR(15),
    password_hash TEXT NOT NULL,
    two_factor_secret VARCHAR(32),
    two_factor_enabled BOOLEAN DEFAULT false,
    backup_codes TEXT[],
    is_active BOOLEAN DEFAULT true,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT check_role CHECK (role IN ('Admin', 'Faculty', 'Resident', 'Psychiatric Welfare Officer'))
);

-- Indexes for users table
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_is_active ON users(is_active);

-- ============================================================================
-- 2. OUT_PATIENTS_CARD TABLE
-- ============================================================================
-- Master patient demographic + registration table
CREATE TABLE out_patients_card (
    cr_no VARCHAR(50) PRIMARY KEY,
    date DATE,
    name TEXT NOT NULL,
    mobile_no VARCHAR(15),
    age INTEGER,
    sex VARCHAR(10),
    category VARCHAR(50),
    father_name TEXT,
    department TEXT,
    unit_consit TEXT,
    room_no TEXT,
    serial_no TEXT,
    file_no TEXT,
    unit_days TEXT,
    contact_number VARCHAR(15),
    address_line TEXT,
    country TEXT,
    state TEXT,
    district TEXT,
    city TEXT,
    pin_code VARCHAR(10),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for out_patients_card table
CREATE INDEX idx_out_patients_card_cr_no ON out_patients_card(cr_no);
CREATE INDEX idx_out_patients_card_name ON out_patients_card(name);
CREATE INDEX idx_out_patients_card_mobile_no ON out_patients_card(mobile_no);

-- ============================================================================
-- 3. OUT_PATIENT_RECORD TABLE
-- ============================================================================
-- Extends out_patients_card with additional patient details
CREATE TABLE out_patient_record (
    id SERIAL PRIMARY KEY,
    cr_no VARCHAR(50) NOT NULL,
    psy_no TEXT,
    special_clinic_no TEXT,
    seen_in_walk_in_on DATE,
    worked_up_on DATE,
    marital_status TEXT,
    year_of_marriage INTEGER,
    no_of_children_male INTEGER DEFAULT 0,
    no_of_children_female INTEGER DEFAULT 0,
    occupation TEXT,
    education TEXT,
    locality TEXT,
    patient_income NUMERIC(12,2),
    family_income NUMERIC(12,2),
    religion TEXT,
    family_type TEXT,
    head_name TEXT,
    head_age INTEGER,
    head_relationship TEXT,
    head_education TEXT,
    head_occupation TEXT,
    head_income NUMERIC(12,2),
    distance_from_hospital TEXT,
    mobility TEXT,
    referred_by TEXT,
    address_line TEXT,
    country TEXT,
    state TEXT,
    district TEXT,
    city TEXT,
    pin_code VARCHAR(10),
    present_address_line_ TEXT,
    present_city_town_village TEXT,
    present_district TEXT,
    present_state TEXT,
    present_pin_code VARCHAR(10),
    present_country TEXT,
    local_address TEXT,
    assigned_doctor_name TEXT,
    assigned_doctor_id INTEGER,
    assigned_room TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cr_no) REFERENCES out_patients_card(cr_no) ON DELETE CASCADE,
    FOREIGN KEY (assigned_doctor_id) REFERENCES users(id)
);

-- Indexes for out_patient_record table
CREATE INDEX idx_out_patient_record_cr_no ON out_patient_record(cr_no);
CREATE INDEX idx_out_patient_record_psy_no ON out_patient_record(psy_no);
CREATE INDEX idx_out_patient_record_assigned_doctor_id ON out_patient_record(assigned_doctor_id);

-- ============================================================================
-- 4. ADULT_WALK_IN_CLINICAL_PERFORMA TABLE
-- ============================================================================
-- Walk-in clinical form + doctor decision
CREATE TABLE adult_walk_in_clinical_performa (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    date DATE,
    name TEXT,
    age INTEGER,
    sex VARCHAR(10),
    visit_date DATE NOT NULL,
    visit_type VARCHAR(50),
    room_no VARCHAR(50),
    assigned_doctor INTEGER,
    attachment TEXT,
    informant_present BOOLEAN,
    nature_of_information TEXT,
    onset_duration TEXT,
    course TEXT,
    precipitating_factor TEXT,
    illness_duration TEXT,
    current_episode_since DATE,
    mood TEXT,
    behaviour TEXT,
    speech TEXT,
    thought TEXT,
    perception TEXT,
    somatic TEXT,
    bio_functions TEXT,
    adjustment TEXT,
    cognitive_function TEXT,
    fits TEXT,
    sexual_problem TEXT,
    substance_use TEXT,
    past_history TEXT,
    family_history TEXT,
    associated_medical_surgical TEXT,
    mse_behaviour TEXT,
    mse_affect TEXT,
    mse_thought TEXT,
    mse_delusions TEXT,
    mse_perception TEXT,
    mse_cognitive_function TEXT,
    gpe TEXT,
    diagnosis TEXT,
    icd_code VARCHAR(20),
    disposal TEXT,
    workup_appointment DATE,
    referred_to TEXT,
    treatment_prescribed TEXT,
    prescriptions TEXT,
    doctor_decision VARCHAR(50),
    requires_adl_file BOOLEAN DEFAULT false,
    adl_reasoning TEXT,
    adl_file_id INTEGER,
    patient_name TEXT,
    cr_no VARCHAR(50),
    psy_no TEXT,
    doctor_name TEXT,
    doctor_role VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES out_patient_record(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_doctor) REFERENCES users(id)
);

-- Indexes for adult_walk_in_clinical_performa table
CREATE INDEX idx_adult_walk_in_clinical_performa_patient_id ON adult_walk_in_clinical_performa(patient_id);
CREATE INDEX idx_adult_walk_in_clinical_performa_visit_date ON adult_walk_in_clinical_performa(visit_date);
CREATE INDEX idx_adult_walk_in_clinical_performa_assigned_doctor ON adult_walk_in_clinical_performa(assigned_doctor);
CREATE INDEX idx_adult_walk_in_clinical_performa_adl_file_id ON adult_walk_in_clinical_performa(adl_file_id);
CREATE INDEX idx_adult_walk_in_clinical_performa_cr_no ON adult_walk_in_clinical_performa(cr_no);

-- ============================================================================
-- 5. OUT_PATIENT_INTAKE_RECORD TABLE
-- ============================================================================
-- Intake assessment, linked to walk-in clinical performa
CREATE TABLE out_patient_intake_record (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    adl_no VARCHAR(50),
    created_by INTEGER NOT NULL,
    clinical_proforma_id INTEGER,
    file_status VARCHAR(20) DEFAULT 'created',
    physical_file_location TEXT,
    file_created_date DATE,
    last_accessed_date DATE,
    last_accessed_by INTEGER,
    total_visits INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    notes TEXT,
    attachment TEXT,
    date DATE,
    name TEXT,
    age INTEGER,
    sex VARCHAR(10),
    patient_name TEXT,
    cr_no VARCHAR(50),
    psy_no TEXT,
    created_by_name TEXT,
    created_by_role VARCHAR(50),
    last_accessed_by_name TEXT,
    assigned_doctor INTEGER,
    assigned_doctor_name TEXT,
    assigned_doctor_role VARCHAR(50),
    proforma_visit_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- History fields
    history_narrative TEXT,
    history_specific_enquiry TEXT,
    history_drug_intake TEXT,
    history_treatment_place TEXT,
    history_treatment_dates DATE,
    history_treatment_drugs TEXT,
    history_treatment_response TEXT,
    
    -- Informants and complaints (JSONB)
    informants JSONB DEFAULT '[]'::jsonb,
    complaints_patient JSONB DEFAULT '[]'::jsonb,
    complaints_informant JSONB DEFAULT '[]'::jsonb,
    
    -- Onset and course
    onset_duration TEXT,
    precipitating_factor TEXT,
    course TEXT,
    
    -- Past history
    past_history_medical TEXT,
    past_history_psychiatric_dates DATE,
    past_history_psychiatric_diagnosis TEXT,
    past_history_psychiatric_treatment TEXT,
    past_history_psychiatric_interim TEXT,
    past_history_psychiatric_recovery TEXT,
    
    -- Family History - Father
    family_history_father_age INTEGER,
    family_history_father_education TEXT,
    family_history_father_occupation TEXT,
    family_history_father_personality TEXT,
    family_history_father_deceased BOOLEAN DEFAULT false,
    family_history_father_death_age INTEGER,
    family_history_father_death_date DATE,
    family_history_father_death_cause TEXT,
    
    -- Family History - Mother
    family_history_mother_age INTEGER,
    family_history_mother_education TEXT,
    family_history_mother_occupation TEXT,
    family_history_mother_personality TEXT,
    family_history_mother_deceased BOOLEAN DEFAULT false,
    family_history_mother_death_age INTEGER,
    family_history_mother_death_date DATE,
    family_history_mother_death_cause TEXT,
    
    -- Family History - Siblings and Others
    family_history_siblings JSONB DEFAULT '[]'::jsonb,
    family_history_other_relatives JSONB DEFAULT '[]'::jsonb,
    
    -- Diagnostic Formulation
    diagnostic_formulation_summary TEXT,
    diagnostic_formulation_features TEXT,
    diagnostic_formulation_psychodynamic TEXT,
    
    -- Premorbid Personality
    premorbid_personality_passive_active TEXT,
    premorbid_personality_assertive TEXT,
    premorbid_personality_introvert_extrovert TEXT,
    premorbid_personality_traits JSONB DEFAULT '[]'::jsonb,
    premorbid_personality_hobbies TEXT,
    premorbid_personality_habits TEXT,
    premorbid_personality_alcohol_drugs TEXT,
    
    -- Physical Examination - General
    physical_appearance TEXT,
    physical_body_build TEXT,
    physical_pallor BOOLEAN DEFAULT false,
    physical_icterus BOOLEAN DEFAULT false,
    physical_oedema BOOLEAN DEFAULT false,
    physical_lymphadenopathy BOOLEAN DEFAULT false,
    physical_pulse TEXT,
    physical_bp TEXT,
    physical_height TEXT,
    physical_weight TEXT,
    physical_waist TEXT,
    physical_fundus TEXT,
    
    -- Physical Examination - CVS
    physical_cvs_apex TEXT,
    physical_cvs_regularity TEXT,
    physical_cvs_heart_sounds TEXT,
    physical_cvs_murmurs TEXT,
    
    -- Physical Examination - Chest
    physical_chest_expansion TEXT,
    physical_chest_percussion TEXT,
    physical_chest_adventitious TEXT,
    
    -- Physical Examination - Abdomen
    physical_abdomen_tenderness TEXT,
    physical_abdomen_mass TEXT,
    physical_abdomen_bowel_sounds TEXT,
    
    -- Physical Examination - CNS
    physical_cns_cranial TEXT,
    physical_cns_motor_sensory TEXT,
    physical_cns_rigidity TEXT,
    physical_cns_involuntary TEXT,
    physical_cns_superficial_reflexes TEXT,
    physical_cns_dtrs TEXT,
    physical_cns_plantar TEXT,
    physical_cns_cerebellar TEXT,
    
    -- MSE - General
    mse_general_demeanour TEXT,
    mse_general_tidy TEXT,
    mse_general_awareness TEXT,
    mse_general_cooperation TEXT,
    
    -- MSE - Psychomotor
    mse_psychomotor_verbalization TEXT,
    mse_psychomotor_pressure TEXT,
    mse_psychomotor_tension TEXT,
    mse_psychomotor_posture TEXT,
    mse_psychomotor_mannerism TEXT,
    mse_psychomotor_catatonic TEXT,
    
    -- MSE - Affect
    mse_affect_subjective TEXT,
    mse_affect_tone TEXT,
    mse_affect_resting TEXT,
    mse_affect_fluctuation TEXT,
    
    -- MSE - Thought
    mse_thought_flow TEXT,
    mse_thought_form TEXT,
    mse_thought_content TEXT,
    
    -- MSE - Cognitive
    mse_cognitive_consciousness TEXT,
    mse_cognitive_orientation_time TEXT,
    mse_cognitive_orientation_place TEXT,
    mse_cognitive_orientation_person TEXT,
    mse_cognitive_memory_immediate TEXT,
    mse_cognitive_memory_recent TEXT,
    mse_cognitive_memory_remote TEXT,
    mse_cognitive_subtraction TEXT,
    mse_cognitive_digit_span TEXT,
    mse_cognitive_counting TEXT,
    mse_cognitive_general_knowledge TEXT,
    mse_cognitive_calculation TEXT,
    mse_cognitive_similarities TEXT,
    mse_cognitive_proverbs TEXT,
    mse_insight_understanding TEXT,
    mse_insight_judgement TEXT,
    
    -- Education History
    education_start_age TEXT,
    education_highest_class TEXT,
    education_performance TEXT,
    education_disciplinary TEXT,
    education_peer_relationship TEXT,
    education_hobbies TEXT,
    education_special_abilities TEXT,
    education_discontinue_reason TEXT,
    
    -- Occupation History
    occupation_jobs JSONB DEFAULT '[]'::jsonb,
    
    -- Sexual History
    sexual_menarche_age TEXT,
    sexual_menarche_reaction TEXT,
    sexual_education TEXT,
    sexual_masturbation TEXT,
    sexual_contact TEXT,
    sexual_premarital_extramarital TEXT,
    sexual_marriage_arranged TEXT,
    sexual_marriage_date DATE,
    sexual_spouse_age TEXT,
    sexual_spouse_occupation TEXT,
    sexual_adjustment_general TEXT,
    sexual_adjustment_sexual TEXT,
    sexual_children JSONB DEFAULT '[]'::jsonb,
    sexual_problems TEXT,
    
    -- Religion
    religion_type TEXT,
    religion_participation TEXT,
    religion_changes TEXT,
    
    -- Living Situation
    living_residents JSONB DEFAULT '[]'::jsonb,
    living_income_sharing TEXT,
    living_expenses TEXT,
    living_kitchen TEXT,
    living_domestic_conflicts TEXT,
    living_social_class TEXT,
    living_inlaws JSONB DEFAULT '[]'::jsonb,
    
    -- Home Situation
    home_situation_childhood TEXT,
    home_situation_parents_relationship TEXT,
    home_situation_socioeconomic TEXT,
    home_situation_interpersonal TEXT,
    
    -- Personal History - Birth
    personal_birth_date DATE,
    personal_birth_place TEXT,
    personal_delivery_type TEXT,
    personal_complications_prenatal TEXT,
    personal_complications_natal TEXT,
    personal_complications_postnatal TEXT,
    
    -- Development History
    development_weaning_age TEXT,
    development_first_words TEXT,
    development_three_words TEXT,
    development_walking TEXT,
    development_neurotic_traits TEXT,
    development_nail_biting TEXT,
    development_bedwetting TEXT,
    development_phobias TEXT,
    development_childhood_illness TEXT,
    
    -- Personal History (legacy fields - kept for backward compatibility)
    personal_history_birth TEXT,
    personal_history_development TEXT,
    personal_history_education TEXT,
    personal_history_occupation TEXT,
    personal_history_marital TEXT,
    personal_history_sexual TEXT,
    personal_history_premorbid_personality TEXT,
    
    -- Mental Status Examination (legacy - kept for backward compatibility)
    mental_status_examination TEXT,
    
    -- Physical Examination (legacy - kept for backward compatibility)
    physical_examination TEXT,
    
    -- Investigations
    investigations TEXT,
    
    -- Diagnosis and Treatment
    diagnosis TEXT,
    icd_code VARCHAR(20),
    provisional_diagnosis TEXT,
    treatment_plan TEXT,
    prognosis TEXT,
    consultant_comments TEXT,
    
    FOREIGN KEY (patient_id) REFERENCES out_patient_record(id) ON DELETE CASCADE,
    FOREIGN KEY (created_by) REFERENCES users(id),
    FOREIGN KEY (clinical_proforma_id) REFERENCES adult_walk_in_clinical_performa(id) ON DELETE SET NULL,
    FOREIGN KEY (last_accessed_by) REFERENCES users(id),
    FOREIGN KEY (assigned_doctor) REFERENCES users(id)
);

-- Add foreign key constraint for adl_file_id in adult_walk_in_clinical_performa
ALTER TABLE adult_walk_in_clinical_performa 
ADD CONSTRAINT fk_adult_walk_in_clinical_performa_adl_file_id 
FOREIGN KEY (adl_file_id) REFERENCES out_patient_intake_record(id) ON DELETE SET NULL;

-- Indexes for out_patient_intake_record table
CREATE INDEX idx_out_patient_intake_record_patient_id ON out_patient_intake_record(patient_id);
CREATE INDEX idx_out_patient_intake_record_adl_no ON out_patient_intake_record(adl_no);
CREATE INDEX idx_out_patient_intake_record_created_by ON out_patient_intake_record(created_by);
CREATE INDEX idx_out_patient_intake_record_clinical_proforma_id ON out_patient_intake_record(clinical_proforma_id);
CREATE INDEX idx_out_patient_intake_record_file_status ON out_patient_intake_record(file_status);
CREATE INDEX idx_out_patient_intake_record_assigned_doctor ON out_patient_intake_record(assigned_doctor);

-- ============================================================================
-- 6. PRESCRIPTION TABLE
-- ============================================================================
-- Linked to intake or clinical performa (visit-level)
CREATE TABLE prescription (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    clinical_proforma_id INTEGER,
    prescriptions JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES out_patient_record(id) ON DELETE CASCADE,
    FOREIGN KEY (clinical_proforma_id) REFERENCES adult_walk_in_clinical_performa(id) ON DELETE CASCADE
);

-- Indexes for prescription table
CREATE INDEX idx_prescription_patient_id ON prescription(patient_id);
CREATE INDEX idx_prescription_clinical_proforma_id ON prescription(clinical_proforma_id);

-- ============================================================================
-- 7. PATIENT_VISITS TABLE
-- ============================================================================
-- Tracks patient visits and doctor assignments
CREATE TABLE patient_visits (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL,
    visit_date DATE NOT NULL,
    visit_type VARCHAR(50),
    has_file BOOLEAN DEFAULT false,
    assigned_doctor_id INTEGER,
    room_no VARCHAR(50),
    visit_status VARCHAR(50) DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES out_patient_record(id) ON DELETE CASCADE,
    FOREIGN KEY (assigned_doctor_id) REFERENCES users(id)
);

-- Indexes for patient_visits table
CREATE INDEX idx_patient_visits_patient_id ON patient_visits(patient_id);
CREATE INDEX idx_patient_visits_visit_date ON patient_visits(visit_date);
CREATE INDEX idx_patient_visits_assigned_doctor_id ON patient_visits(assigned_doctor_id);
CREATE INDEX idx_patient_visits_visit_type ON patient_visits(visit_type);

-- ============================================================================
-- 8. AUDIT_LOGS TABLE
-- ============================================================================
-- Tracks CRUD events for all tables
CREATE TABLE audit_logs (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id INTEGER NOT NULL,
    action VARCHAR(20) NOT NULL,
    old_data JSONB,
    new_data JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Indexes for audit_logs table
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_table_name ON audit_logs(table_name);
CREATE INDEX idx_audit_logs_record_id ON audit_logs(record_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- ============================================================================
-- 9. FILE_UPLOADS TABLE
-- ============================================================================
-- Universal file storage table (no duplication)
CREATE TABLE file_uploads (
    id SERIAL PRIMARY KEY,
    file_name TEXT NOT NULL,
    file_type VARCHAR(100),
    file_size BIGINT,
    storage_path TEXT NOT NULL,
    uploaded_by INTEGER NOT NULL,
    reference_table VARCHAR(100) NOT NULL,
    reference_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (uploaded_by) REFERENCES users(id)
);

-- Indexes for file_uploads table
CREATE INDEX idx_file_uploads_uploaded_by ON file_uploads(uploaded_by);
CREATE INDEX idx_file_uploads_reference_table ON file_uploads(reference_table);
CREATE INDEX idx_file_uploads_reference_id ON file_uploads(reference_id);
CREATE INDEX idx_file_uploads_file_name ON file_uploads(file_name);

-- ============================================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMP
-- ============================================================================
-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for all tables with updated_at column
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_out_patients_card_updated_at BEFORE UPDATE ON out_patients_card
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_out_patient_record_updated_at BEFORE UPDATE ON out_patient_record
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_adult_walk_in_clinical_performa_updated_at BEFORE UPDATE ON adult_walk_in_clinical_performa
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_out_patient_intake_record_updated_at BEFORE UPDATE ON out_patient_intake_record
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_prescription_updated_at BEFORE UPDATE ON prescription
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_patient_visits_updated_at BEFORE UPDATE ON patient_visits
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_file_uploads_updated_at BEFORE UPDATE ON file_uploads
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================
COMMENT ON TABLE users IS 'Authentication + role-based info';
COMMENT ON TABLE out_patients_card IS 'Master patient demographic + registration table';
COMMENT ON TABLE out_patient_record IS 'Extends out_patients_card with additional patient details';
COMMENT ON TABLE adult_walk_in_clinical_performa IS 'Walk-in clinical form + doctor decision';
COMMENT ON TABLE out_patient_intake_record IS 'Intake assessment, linked to walk-in clinical performa';
COMMENT ON TABLE prescription IS 'Linked to intake or clinical performa (visit-level)';
COMMENT ON TABLE patient_visits IS 'Tracks patient visits and doctor assignments';
COMMENT ON TABLE audit_logs IS 'Tracks CRUD events for all tables';
COMMENT ON TABLE file_uploads IS 'Universal file storage table (no duplication)';

-- ============================================================================
-- SCHEMA CREATION COMPLETE
-- ============================================================================
-- All 9 core tables have been created with:
--   - Primary keys
--   - Foreign key relationships with CASCADE DELETE where appropriate
--   - Indexes for performance
--   - Triggers for updated_at timestamps
--   - Constraints and defaults
--
-- Cascade Delete Behavior:
--   - Deleting out_patients_card → automatically deletes out_patient_record
--   - Deleting out_patient_record → automatically deletes:
--     * patient_visits
--     * adult_walk_in_clinical_performa
--     * out_patient_intake_record
--     * prescription
-- ============================================================================

