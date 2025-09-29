-- Migration: Fix cascade deletion rules for resume management
-- Date: 2024-09-29
-- Description: Ensure applications are not deleted when resumes are deleted
--              Only resume_versions should cascade delete with resumes

-- Step 1: Remove the existing foreign key constraint on applications.resume_id
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_resume_id_fkey;

-- Step 2: Add a new foreign key constraint with RESTRICT to prevent resume deletion
-- if applications still reference it
ALTER TABLE applications 
ADD CONSTRAINT applications_resume_id_fkey 
FOREIGN KEY (resume_id) 
REFERENCES resumes(id) 
ON DELETE RESTRICT;

-- Step 3: Similarly, update resume_version_id to use RESTRICT
-- This ensures applications are not deleted when a resume version is deleted
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_resume_version_id_fkey;

ALTER TABLE applications 
ADD CONSTRAINT applications_resume_version_id_fkey 
FOREIGN KEY (resume_version_id) 
REFERENCES resume_versions(id) 
ON DELETE RESTRICT;

-- Step 4: Update customized_resume_version_id to use SET NULL
-- This allows the customized version to be deleted without affecting the application
ALTER TABLE applications 
DROP CONSTRAINT IF EXISTS applications_customized_resume_version_id_fkey;

ALTER TABLE applications 
ADD CONSTRAINT applications_customized_resume_version_id_fkey 
FOREIGN KEY (customized_resume_version_id) 
REFERENCES resume_versions(id) 
ON DELETE SET NULL;

-- Add comments for documentation
COMMENT ON CONSTRAINT applications_resume_id_fkey ON applications IS 
'RESTRICT prevents resume deletion if applications reference it';

COMMENT ON CONSTRAINT applications_resume_version_id_fkey ON applications IS 
'RESTRICT prevents version deletion if applications reference it';

COMMENT ON CONSTRAINT applications_customized_resume_version_id_fkey ON applications IS 
'SET NULL allows customized version deletion without affecting application';
