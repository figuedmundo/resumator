-- PostgreSQL initialization script for Resumator
-- This script creates the database structure with proper cascade deletion constraints
-- Last updated: 2025-10-01 (Cascade Deletion Implementation)

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ======================================
-- Users table
-- ======================================
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- Resumes table
-- ======================================
CREATE TABLE IF NOT EXISTS resumes (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- Resume versions table
-- ======================================
CREATE TABLE IF NOT EXISTS resume_versions (
    id SERIAL PRIMARY KEY,
    resume_id INTEGER NOT NULL REFERENCES resumes(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    markdown_content TEXT NOT NULL,
    job_description TEXT,
    is_original BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- Cover letters table
-- ======================================
CREATE TABLE IF NOT EXISTS cover_letters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    template_used VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- Applications table
-- ======================================
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    resume_id INTEGER NOT NULL,
    resume_version_id INTEGER NOT NULL,
    customized_resume_version_id INTEGER,
    cover_letter_id INTEGER,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    job_description TEXT,
    additional_instructions TEXT,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ======================================
-- Cascade Deletion Constraints
-- ======================================
-- These constraints implement the cascade deletion rules:
-- 1. Original resume/version: RESTRICT (blocks deletion if apps exist)
-- 2. Customized version: CASCADE (deletes with application)
-- 3. Cover letter: SET NULL (preserves cover letter)
-- ======================================

-- Resume references (RESTRICT - blocks resume deletion)
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_id_fkey
  FOREIGN KEY (resume_id)
  REFERENCES resumes(id)
  ON DELETE RESTRICT;

-- Original resume version references (RESTRICT - blocks version deletion)
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_version_id_fkey
  FOREIGN KEY (resume_version_id)
  REFERENCES resume_versions(id)
  ON DELETE RESTRICT;

-- Customized resume version references (CASCADE - deletes with app)
ALTER TABLE applications
  ADD CONSTRAINT applications_customized_resume_version_id_fkey
  FOREIGN KEY (customized_resume_version_id)
  REFERENCES resume_versions(id)
  ON DELETE CASCADE;

-- Cover letter references (SET NULL - preserves cover letter)
ALTER TABLE applications
  ADD CONSTRAINT applications_cover_letter_id_fkey
  FOREIGN KEY (cover_letter_id)
  REFERENCES cover_letters(id)
  ON DELETE SET NULL;

-- ======================================
-- Documentation Comments
-- ======================================
COMMENT ON COLUMN applications.resume_id IS 
'Original resume - protected from deletion (RESTRICT)';

COMMENT ON COLUMN applications.resume_version_id IS 
'Original resume version - protected from deletion (RESTRICT)';

COMMENT ON COLUMN applications.customized_resume_version_id IS 
'Customized version for this application - deleted with application (CASCADE)';

COMMENT ON COLUMN applications.additional_instructions IS 
'Additional instructions used for resume customization';

COMMENT ON COLUMN applications.cover_letter_id IS 
'Cover letter used for this application - preserved on deletion (SET NULL)';

COMMENT ON CONSTRAINT applications_resume_id_fkey ON applications IS 
'RESTRICT: Blocks resume deletion if applications reference it';

COMMENT ON CONSTRAINT applications_resume_version_id_fkey ON applications IS 
'RESTRICT: Blocks original version deletion if applications reference it';

COMMENT ON CONSTRAINT applications_customized_resume_version_id_fkey ON applications IS 
'CASCADE: Deletes customized version when application is deleted';

COMMENT ON CONSTRAINT applications_cover_letter_id_fkey ON applications IS 
'SET NULL: Preserves cover letter when application is deleted';

-- ======================================
-- Indexes for Performance
-- ======================================
-- User lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Resume queries
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_is_original ON resume_versions(is_original);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created_at ON resume_versions(created_at);

-- Application queries
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_resume_id ON applications(resume_id);
CREATE INDEX IF NOT EXISTS idx_applications_resume_version_id ON applications(resume_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_customized_resume_version_id 
ON applications(customized_resume_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);

-- Cover letter queries
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);

-- ======================================
-- Triggers for updated_at timestamps
-- ======================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_resumes_updated_at 
BEFORE UPDATE ON resumes 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_applications_updated_at 
BEFORE UPDATE ON applications 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

-- ======================================
-- Utility Functions
-- ======================================
CREATE OR REPLACE FUNCTION check_db_health()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy at ' || NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check application dependencies for a resume
CREATE OR REPLACE FUNCTION get_resume_dependencies(resume_id_param INTEGER)
RETURNS TABLE(
    application_id INTEGER,
    company VARCHAR,
    "position" VARCHAR,
    status VARCHAR,
    has_customized_version BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.company,
        a.position,
        a.status,
        (a.customized_resume_version_id IS NOT NULL) as has_customized_version
    FROM applications a
    WHERE a.resume_id = resume_id_param
    ORDER BY a.applied_date DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to check version dependencies
CREATE OR REPLACE FUNCTION get_version_dependencies(version_id_param INTEGER)
RETURNS TABLE(
    application_id INTEGER,
    company VARCHAR,
    "position" VARCHAR,
    reference_type VARCHAR
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.company,
        a.position,
        CASE 
            WHEN a.resume_version_id = version_id_param THEN 'original'
            WHEN a.customized_resume_version_id = version_id_param THEN 'customized'
        END as reference_type
    FROM applications a
    WHERE a.resume_version_id = version_id_param 
       OR a.customized_resume_version_id = version_id_param
    ORDER BY a.applied_date DESC;
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- Application Status Enum (Optional)
-- ======================================
-- Note: This is optional. The application currently uses VARCHAR for flexibility
-- Uncomment if you want to enforce status values at database level
/*
DO $$ BEGIN
    CREATE TYPE application_status_enum AS ENUM (
        'Applied',
        'Interviewing',
        'Rejected',
        'Offer',
        'Withdrawn'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- To use the enum, you would need to:
-- ALTER TABLE applications ALTER COLUMN status TYPE application_status_enum USING status::application_status_enum;
*/

-- ======================================
-- Sample Data (Optional - for development)
-- ======================================
-- Uncomment to create sample user for testing
/*
INSERT INTO users (username, email, hashed_password) 
VALUES ('testuser', 'test@example.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5NU7dq3xNJmMq')
ON CONFLICT (email) DO NOTHING;
*/

-- ======================================
-- Database Version Info
-- ======================================
CREATE TABLE IF NOT EXISTS schema_version (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0', 'Initial schema with cascade deletion constraints')
ON CONFLICT (version) DO NOTHING;

-- ======================================
-- Verification Query
-- ======================================
-- Run this to verify all constraints are in place:
/*
SELECT 
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'applications'
ORDER BY tc.constraint_name;
*/

-- ======================================
-- Success Message
-- ======================================
DO $$ 
BEGIN 
    RAISE NOTICE 'Database initialization complete!';
    RAISE NOTICE 'Cascade deletion constraints are in place:';
    RAISE NOTICE '  - Original resumes/versions: RESTRICT (protected)';
    RAISE NOTICE '  - Customized versions: CASCADE (auto-deleted)';
    RAISE NOTICE '  - Cover letters: SET NULL (preserved)';
END $$;
