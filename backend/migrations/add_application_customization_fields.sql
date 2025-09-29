-- Migration: Add customization fields to applications table
-- Date: 2024-01-XX
-- Description: Add fields to support application-centric workflow

-- Add new columns to applications table
ALTER TABLE applications 
ADD COLUMN customized_resume_version_id INTEGER REFERENCES resume_versions(id),
ADD COLUMN additional_instructions TEXT;

-- Create index for the new foreign key
CREATE INDEX IF NOT EXISTS idx_applications_customized_resume_version_id 
ON applications(customized_resume_version_id);

-- Add comments for documentation
COMMENT ON COLUMN applications.customized_resume_version_id IS 'Links to a company-specific customized resume version';
COMMENT ON COLUMN applications.additional_instructions IS 'Additional instructions for resume customization';
