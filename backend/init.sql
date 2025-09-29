-- PostgreSQL initialization script for Resumator
-- This script creates the database structure that matches your SQLAlchemy models

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
    cover_letter_id INTEGER REFERENCES cover_letters(id) ON DELETE SET NULL,
    company VARCHAR(255) NOT NULL,
    position VARCHAR(255) NOT NULL,
    job_description TEXT,
    status VARCHAR(50) DEFAULT 'Applied',
    applied_date DATE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    -- migration additions
    customized_resume_version_id INTEGER,
    additional_instructions TEXT
);

-- ======================================
-- Constraints & relationships (final state after migrations)
-- ======================================
-- Resume references
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_id_fkey
  FOREIGN KEY (resume_id)
  REFERENCES resumes(id)
  ON DELETE RESTRICT;

-- Resume version references
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_version_id_fkey
  FOREIGN KEY (resume_version_id)
  REFERENCES resume_versions(id)
  ON DELETE RESTRICT;

-- Customized resume version references
ALTER TABLE applications
  ADD CONSTRAINT applications_customized_resume_version_id_fkey
  FOREIGN KEY (customized_resume_version_id)
  REFERENCES resume_versions(id)
  ON DELETE SET NULL;

-- Comments for documentation
COMMENT ON COLUMN applications.customized_resume_version_id IS 'Links to a company-specific customized resume version';
COMMENT ON COLUMN applications.additional_instructions IS 'Additional instructions for resume customization';

COMMENT ON CONSTRAINT applications_resume_id_fkey ON applications IS 
'RESTRICT prevents resume deletion if applications reference it';

COMMENT ON CONSTRAINT applications_resume_version_id_fkey ON applications IS 
'RESTRICT prevents version deletion if applications reference it';

COMMENT ON CONSTRAINT applications_customized_resume_version_id_fkey ON applications IS 
'SET NULL allows customized version deletion without affecting application';

-- ======================================
-- Indexes
-- ======================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_id ON resume_versions(resume_id);
CREATE INDEX IF NOT EXISTS idx_applications_user_id ON applications(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_applications_customized_resume_version_id 
ON applications(customized_resume_version_id);

-- ======================================
-- Triggers
-- ======================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

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
-- Utility functions
-- ======================================
CREATE OR REPLACE FUNCTION check_db_health()
RETURNS TEXT AS $$
BEGIN
    RETURN 'Database is healthy at ' || NOW();
END;
$$ LANGUAGE plpgsql;

-- ======================================
-- Enums
-- ======================================
CREATE TYPE application_status AS ENUM (
    'Applied',
    'Interviewing',
    'Rejected',
    'Offer',
    'Accepted',
    'Declined'
);
