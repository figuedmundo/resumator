-- Migration: Refactor Cover Letter System to Match Resume Pattern
-- Version: 1.2.0
-- Description: Adds CoverLetter and CoverLetterVersion tables matching Resume workflow
-- This migration creates a version-based system for cover letters

-- ======================================
-- NEW: Cover Letters Table (Restructured)
-- ======================================
-- Drop old cover_letters table if it exists (with its foreign keys)
ALTER TABLE applications 
  DROP CONSTRAINT IF EXISTS applications_cover_letter_id_fkey;

DROP TABLE IF EXISTS cover_letters CASCADE;

-- Create new cover_letters table with is_default and proper timestamps
CREATE TABLE IF NOT EXISTS cover_letters (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cover_letters
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_is_default ON cover_letters(is_default);
CREATE INDEX IF NOT EXISTS idx_cover_letters_created_at ON cover_letters(created_at);

-- ======================================
-- NEW: Cover Letter Versions Table
-- ======================================
-- Stores different versions of cover letters (similar to resume_versions)
CREATE TABLE IF NOT EXISTS cover_letter_versions (
    id SERIAL PRIMARY KEY,
    cover_letter_id INTEGER NOT NULL REFERENCES cover_letters(id) ON DELETE CASCADE,
    version VARCHAR(50) NOT NULL,
    markdown_content TEXT NOT NULL,
    job_description TEXT,
    is_original BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for cover_letter_versions
CREATE INDEX IF NOT EXISTS idx_cover_letter_versions_cover_letter_id ON cover_letter_versions(cover_letter_id);
CREATE INDEX IF NOT EXISTS idx_cover_letter_versions_version ON cover_letter_versions(version);
CREATE INDEX IF NOT EXISTS idx_cover_letter_versions_is_original ON cover_letter_versions(is_original);
CREATE INDEX IF NOT EXISTS idx_cover_letter_versions_created_at ON cover_letter_versions(created_at);

-- ======================================
-- Update Applications Table
-- ======================================
-- Add new columns to track cover letter versions if they don't exist
ALTER TABLE applications
  ADD COLUMN IF NOT EXISTS cover_letter_id INTEGER REFERENCES cover_letters(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS cover_letter_version_id INTEGER REFERENCES cover_letter_versions(id) ON DELETE RESTRICT,
  ADD COLUMN IF NOT EXISTS customized_cover_letter_version_id INTEGER REFERENCES cover_letter_versions(id) ON DELETE CASCADE;

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_applications_cover_letter_id ON applications(cover_letter_id);
CREATE INDEX IF NOT EXISTS idx_applications_cover_letter_version_id ON applications(cover_letter_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_customized_cover_letter_version_id ON applications(customized_cover_letter_version_id);

-- ======================================
-- Add Comments for Documentation
-- ======================================
COMMENT ON TABLE cover_letters IS 
'Master cover letter records for users. Similar to resumes, can have multiple versions.';

COMMENT ON TABLE cover_letter_versions IS 
'Version history for cover letters. Supports customization for applications.';

COMMENT ON COLUMN cover_letters.user_id IS 
'User who owns this cover letter';

COMMENT ON COLUMN cover_letters.is_default IS 
'Whether this is the user''s default cover letter';

COMMENT ON COLUMN cover_letter_versions.cover_letter_id IS 
'Parent cover letter - cascade delete versions when cover letter deleted';

COMMENT ON COLUMN cover_letter_versions.version IS 
'Version identifier (e.g., v1, v1.1, v2 - Company Name)';

COMMENT ON COLUMN cover_letter_versions.markdown_content IS 
'The actual cover letter content in markdown format';

COMMENT ON COLUMN cover_letter_versions.job_description IS 
'Job description used for customization (if this is a customized version)';

COMMENT ON COLUMN cover_letter_versions.is_original IS 
'True for original/master versions, False for company-specific customizations';

COMMENT ON COLUMN applications.cover_letter_id IS 
'Cover letter master record - preserved on deletion (SET NULL)';

COMMENT ON COLUMN applications.cover_letter_version_id IS 
'Specific version of cover letter used for this application - protected from deletion (RESTRICT)';

COMMENT ON COLUMN applications.customized_cover_letter_version_id IS 
'Customized cover letter version for this application - deleted with application (CASCADE)';

-- ======================================
-- Triggers for Updated Timestamps
-- ======================================
-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for cover_letters updated_at
DROP TRIGGER IF EXISTS update_cover_letters_updated_at ON cover_letters;
CREATE TRIGGER update_cover_letters_updated_at 
BEFORE UPDATE ON cover_letters 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

-- ======================================
-- Utility Functions
-- ======================================

-- Function to get version dependencies for a cover letter version
CREATE OR REPLACE FUNCTION get_cover_letter_version_dependencies(version_id_param INTEGER)
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
        'used_by_application' as reference_type
    FROM applications a
    WHERE a.cover_letter_version_id = version_id_param
    ORDER BY a.applied_date DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cover_letter_version_dependencies(INTEGER) IS 
'Returns all applications that use a specific cover letter version';

-- Function to get cover letter dependencies
CREATE OR REPLACE FUNCTION get_cover_letter_dependencies(cover_letter_id_param INTEGER)
RETURNS TABLE(
    application_id INTEGER,
    company VARCHAR,
    "position" VARCHAR,
    version VARCHAR,
    has_version_reference BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        a.id,
        a.company,
        a.position,
        clv.version,
        (a.cover_letter_version_id IS NOT NULL) as has_version_reference
    FROM applications a
    LEFT JOIN cover_letter_versions clv ON a.cover_letter_version_id = clv.id
    WHERE clv.cover_letter_id = cover_letter_id_param
    ORDER BY a.applied_date DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_cover_letter_dependencies(INTEGER) IS 
'Returns all applications that use a specific cover letter';

-- ======================================
-- Update Schema Version
-- ======================================
INSERT INTO schema_version (version, description) 
VALUES ('1.2.0', 'Added CoverLetter and CoverLetterVersion tables matching Resume workflow')
ON CONFLICT (version) DO NOTHING;

-- ======================================
-- Success Message
-- ======================================
DO $$ 
BEGIN
    RAISE NOTICE 'Cover Letter System Refactoring Migration Complete!';
    RAISE NOTICE '';
    RAISE NOTICE '✓ New Tables:';
    RAISE NOTICE '  - cover_letters (master records with is_default flag)';
    RAISE NOTICE '  - cover_letter_versions (version history and customizations)';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Updated Tables:';
    RAISE NOTICE '  - applications (added cover_letter_id, cover_letter_version_id, customized_cover_letter_version_id)';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Cascade Rules:';
    RAISE NOTICE '  - Cover letter versions: CASCADE (deleted with cover letter)';
    RAISE NOTICE '  - Original versions: RESTRICT (protected if apps reference)';
    RAISE NOTICE '  - Customized versions: CASCADE (deleted with application)';
    RAISE NOTICE '  - Cover letter master: CASCADE (deleted with user)';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Indexes created for optimal query performance';
    RAISE NOTICE '✓ Triggers configured for updated_at timestamps';
    RAISE NOTICE '✓ Utility functions available';
    RAISE NOTICE '';
    RAISE NOTICE 'Schema version: 1.2.0';
END $$;
