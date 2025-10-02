-- Migration script to update existing database with cascade deletion constraints
-- Run this on existing databases to add the new constraints
-- Backup your database before running!

BEGIN;

-- ======================================
-- Step 1: Add missing indexes
-- ======================================
CREATE INDEX IF NOT EXISTS idx_applications_resume_id ON applications(resume_id);
CREATE INDEX IF NOT EXISTS idx_applications_resume_version_id ON applications(resume_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);
CREATE INDEX IF NOT EXISTS idx_resume_versions_is_original ON resume_versions(is_original);
CREATE INDEX IF NOT EXISTS idx_resume_versions_created_at ON resume_versions(created_at);

-- ======================================
-- Step 2: Drop existing constraints (if they exist)
-- ======================================
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_resume_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_resume_version_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_customized_resume_version_id_fkey;
ALTER TABLE applications DROP CONSTRAINT IF EXISTS applications_cover_letter_id_fkey;

-- ======================================
-- Step 3: Add new constraints with proper cascade rules
-- ======================================

-- Original resume (RESTRICT - blocks deletion)
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_id_fkey
  FOREIGN KEY (resume_id)
  REFERENCES resumes(id)
  ON DELETE RESTRICT;

-- Original version (RESTRICT - blocks deletion)
ALTER TABLE applications
  ADD CONSTRAINT applications_resume_version_id_fkey
  FOREIGN KEY (resume_version_id)
  REFERENCES resume_versions(id)
  ON DELETE RESTRICT;

-- Customized version (CASCADE - deletes with app)
ALTER TABLE applications
  ADD CONSTRAINT applications_customized_resume_version_id_fkey
  FOREIGN KEY (customized_resume_version_id)
  REFERENCES resume_versions(id)
  ON DELETE CASCADE;

-- Cover letter (SET NULL - preserves cover letter)
ALTER TABLE applications
  ADD CONSTRAINT applications_cover_letter_id_fkey
  FOREIGN KEY (cover_letter_id)
  REFERENCES cover_letters(id)
  ON DELETE SET NULL;

-- ======================================
-- Step 4: Add documentation comments
-- ======================================
COMMENT ON COLUMN applications.resume_id IS 
'Original resume - protected from deletion (RESTRICT)';

COMMENT ON COLUMN applications.resume_version_id IS 
'Original resume version - protected from deletion (RESTRICT)';

COMMENT ON COLUMN applications.customized_resume_version_id IS 
'Customized version for this application - deleted with application (CASCADE)';

COMMENT ON CONSTRAINT applications_resume_id_fkey ON applications IS 
'RESTRICT: Blocks resume deletion if applications reference it';

COMMENT ON CONSTRAINT applications_resume_version_id_fkey ON applications IS 
'RESTRICT: Blocks original version deletion if applications reference it';

COMMENT ON CONSTRAINT applications_customized_resume_version_id_fkey ON applications IS 
'CASCADE: Deletes customized version when application is deleted';

COMMENT ON CONSTRAINT applications_cover_letter_id_fkey ON applications IS 
'SET NULL: Preserves cover letter when application is deleted';

-- ======================================
-- Step 5: Add utility functions
-- ======================================
CREATE OR REPLACE FUNCTION get_resume_dependencies(resume_id_param INTEGER)
RETURNS TABLE(
    application_id INTEGER,
    company VARCHAR,
    position VARCHAR,
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

CREATE OR REPLACE FUNCTION get_version_dependencies(version_id_param INTEGER)
RETURNS TABLE(
    application_id INTEGER,
    company VARCHAR,
    position VARCHAR,
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
-- Step 6: Add schema version tracking
-- ======================================
CREATE TABLE IF NOT EXISTS schema_version (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_version (version, description) 
VALUES ('1.0.0-cascade-deletion', 'Added cascade deletion constraints')
ON CONFLICT (version) DO NOTHING;

-- ======================================
-- Verify changes
-- ======================================
DO $$ 
DECLARE
    constraint_count INTEGER;
BEGIN
    -- Count foreign key constraints
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE table_name = 'applications' 
      AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE 'Migration complete!';
    RAISE NOTICE 'Found % foreign key constraints on applications table', constraint_count;
    RAISE NOTICE 'Expected: 4 (resume_id, resume_version_id, customized_resume_version_id, cover_letter_id)';
END $$;

-- ======================================
-- Show current constraints
-- ======================================
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name AS foreign_table,
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

COMMIT;

-- If everything looks good, you're done!
-- If there are errors, the transaction will rollback automatically.
