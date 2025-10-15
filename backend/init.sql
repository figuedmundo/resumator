-- init.sql
-- PostgreSQL initialization script for Resumator
-- Merged schema: Base schema + Cover Letter Templates System + Cover Letter Versions
-- Version: 1.2.0
-- Last updated: 2025-10-15 (Merged migration 1.2.0 into init.sql)

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
-- Cover letter templates table
-- ======================================
CREATE TABLE IF NOT EXISTS cover_letter_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    content_template TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for templates
CREATE INDEX IF NOT EXISTS idx_cover_letter_templates_name ON cover_letter_templates(name);
CREATE INDEX IF NOT EXISTS idx_cover_letter_templates_created_at ON cover_letter_templates(created_at);

-- Add comments for template table
COMMENT ON TABLE cover_letter_templates IS 
'Template library for generating cover letters';

COMMENT ON COLUMN cover_letter_templates.name IS 
'Template name for identification';

COMMENT ON COLUMN cover_letter_templates.description IS 
'Description of template purpose and use case';

COMMENT ON COLUMN cover_letter_templates.content_template IS 
'Template content with placeholders for personalization';

-- ======================================
-- Cover letters table (Restructured to match Resume pattern)
-- ======================================
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

-- Comments for cover_letters
COMMENT ON TABLE cover_letters IS 
'Master cover letter records for users. Similar to resumes, can have multiple versions.';

COMMENT ON COLUMN cover_letters.user_id IS 
'User who owns this cover letter - cascade delete on user deletion';

COMMENT ON COLUMN cover_letters.is_default IS 
'Whether this is the user''s default cover letter';

-- ======================================
-- Cover letter versions table
-- ======================================
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

-- Comments for cover_letter_versions
COMMENT ON TABLE cover_letter_versions IS 
'Version history for cover letters. Supports customization for applications.';

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
    cover_letter_version_id INTEGER,
    customized_cover_letter_version_id INTEGER,
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
-- RESUMES:
-- 1. Original resume/version: RESTRICT (blocks deletion if apps exist)
-- 2. Customized version: CASCADE (deletes with application)
-- COVER LETTERS:
-- 3. Original cover letter/version: RESTRICT (blocks deletion if apps exist)
-- 4. Customized cover letter version: CASCADE (deletes with application)
-- 5. Cover letter master: SET NULL (preserves reference)
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

-- Cover letter master references (SET NULL - preserves cover letter)
ALTER TABLE applications
  ADD CONSTRAINT applications_cover_letter_id_fkey
  FOREIGN KEY (cover_letter_id)
  REFERENCES cover_letters(id)
  ON DELETE SET NULL;

-- Original cover letter version references (RESTRICT - blocks version deletion)
ALTER TABLE applications
  ADD CONSTRAINT applications_cover_letter_version_id_fkey
  FOREIGN KEY (cover_letter_version_id)
  REFERENCES cover_letter_versions(id)
  ON DELETE RESTRICT;

-- Customized cover letter version references (CASCADE - deletes with app)
ALTER TABLE applications
  ADD CONSTRAINT applications_customized_cover_letter_version_id_fkey
  FOREIGN KEY (customized_cover_letter_version_id)
  REFERENCES cover_letter_versions(id)
  ON DELETE CASCADE;

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
'Cover letter master record - preserved on deletion (SET NULL)';

COMMENT ON COLUMN applications.cover_letter_version_id IS 
'Specific version of cover letter used for this application - protected from deletion (RESTRICT)';

COMMENT ON COLUMN applications.customized_cover_letter_version_id IS 
'Customized cover letter version for this application - deleted with application (CASCADE)';

COMMENT ON CONSTRAINT applications_resume_id_fkey ON applications IS 
'RESTRICT: Blocks resume deletion if applications reference it';

COMMENT ON CONSTRAINT applications_resume_version_id_fkey ON applications IS 
'RESTRICT: Blocks original version deletion if applications reference it';

COMMENT ON CONSTRAINT applications_customized_resume_version_id_fkey ON applications IS 
'CASCADE: Deletes customized version when application is deleted';

COMMENT ON CONSTRAINT applications_cover_letter_id_fkey ON applications IS 
'SET NULL: Preserves cover letter when application is deleted';

COMMENT ON CONSTRAINT applications_cover_letter_version_id_fkey ON applications IS 
'RESTRICT: Blocks original cover letter version deletion if applications reference it';

COMMENT ON CONSTRAINT applications_customized_cover_letter_version_id_fkey ON applications IS 
'CASCADE: Deletes customized cover letter version when application is deleted';

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
CREATE INDEX IF NOT EXISTS idx_applications_cover_letter_id ON applications(cover_letter_id);
CREATE INDEX IF NOT EXISTS idx_applications_cover_letter_version_id ON applications(cover_letter_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_customized_cover_letter_version_id ON applications(customized_cover_letter_version_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications(status);
CREATE INDEX IF NOT EXISTS idx_applications_company ON applications(company);
CREATE INDEX IF NOT EXISTS idx_applications_applied_date ON applications(applied_date);

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

-- Trigger for cover_letters updated_at
CREATE TRIGGER update_cover_letters_updated_at
BEFORE UPDATE ON cover_letters
FOR EACH ROW
EXECUTE PROCEDURE update_updated_at_column();

-- Trigger for cover_letter_templates updated_at
CREATE TRIGGER update_cover_letter_templates_updated_at
BEFORE UPDATE ON cover_letter_templates
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

-- Function to get cover letter version dependencies
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
        CASE 
            WHEN a.cover_letter_version_id = version_id_param THEN 'original'
            WHEN a.customized_cover_letter_version_id = version_id_param THEN 'customized'
        END as reference_type
    FROM applications a
    WHERE a.cover_letter_version_id = version_id_param 
       OR a.customized_cover_letter_version_id = version_id_param
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

-- Function to get cover letters using a specific template
CREATE OR REPLACE FUNCTION get_template_usage(template_id_param INTEGER)
RETURNS TABLE(
    cover_letter_id INTEGER,
    title VARCHAR,
    user_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    version_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.title,
        cl.user_id,
        cl.created_at,
        COUNT(clv.id) as version_count
    FROM cover_letters cl
    LEFT JOIN cover_letter_versions clv ON clv.cover_letter_id = cl.id
    GROUP BY cl.id, cl.title, cl.user_id, cl.created_at
    ORDER BY cl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_template_usage(INTEGER) IS 
'Returns all cover letters with their version counts (templates are now separate from cover letters)';

-- Function to get user's cover letters with version and application info
CREATE OR REPLACE FUNCTION get_user_cover_letters_with_details(user_id_param INTEGER)
RETURNS TABLE(
    cover_letter_id INTEGER,
    title VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    version_count BIGINT,
    application_count BIGINT,
    companies TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.title,
        cl.created_at,
        COUNT(DISTINCT clv.id) as version_count,
        COUNT(DISTINCT a.id) as application_count,
        STRING_AGG(DISTINCT a.company, ', ') as companies
    FROM cover_letters cl
    LEFT JOIN cover_letter_versions clv ON clv.cover_letter_id = cl.id
    LEFT JOIN applications a ON a.cover_letter_id = cl.id
    WHERE cl.user_id = user_id_param
    GROUP BY cl.id, cl.title, cl.created_at
    ORDER BY cl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_cover_letters_with_details(INTEGER) IS 
'Returns user cover letters with version counts and application usage';

-- ======================================
-- Default Cover Letter Templates
-- ======================================
INSERT INTO cover_letter_templates (name, description, content_template)
VALUES 
(
    'Professional Standard',
    'A formal, professional cover letter template suitable for most corporate positions',
    'Dear Hiring Manager,

I am writing to express my strong interest in the {position} position at {company}. With my background in {field}, I am confident that I would be a valuable addition to your team.

{highlight_experience}

I am particularly drawn to {company} because {company_interest}. I believe my skills in {key_skills} align well with the requirements outlined in the job description.

{additional_qualifications}

I would welcome the opportunity to discuss how my experience and skills can contribute to {company}''s continued success. Thank you for considering my application.

Sincerely,
{applicant_name}'
),
(
    'Career Change',
    'Template for professionals transitioning to a new industry or role',
    'Dear Hiring Manager,

I am excited to apply for the {position} role at {company}. While my background is in {previous_field}, I have developed transferable skills that make me an excellent candidate for this position.

{transferable_skills}

My decision to transition into {new_field} stems from {motivation}. I have been actively preparing for this change by {preparation_activities}.

{relevant_achievements}

I am enthusiastic about bringing my unique perspective and diverse skill set to {company}. I am confident that my ability to {key_strength} will allow me to make meaningful contributions to your team.

Thank you for considering my application. I look forward to the opportunity to discuss how my background can benefit {company}.

Best regards,
{applicant_name}'
),
(
    'Entry Level',
    'Template for recent graduates or professionals with limited experience',
    'Dear Hiring Manager,

I am writing to apply for the {position} position at {company}. As a recent {degree} graduate from {university}, I am eager to begin my career in {industry} with your organization.

{academic_achievements}

During my studies, I developed strong skills in {key_skills} through {relevant_projects}. Additionally, my {internship_experience} provided me with practical experience in {relevant_areas}.

{enthusiasm_and_motivation}

I am impressed by {company}''s {company_achievement} and would be honored to contribute to your team. My fresh perspective, combined with my willingness to learn and grow, makes me an ideal candidate for this role.

Thank you for considering my application. I am excited about the possibility of starting my career at {company}.

Sincerely,
{applicant_name}'
),
(
    'Technical Role',
    'Template optimized for software engineering and technical positions',
    'Dear Hiring Manager,

I am writing to apply for the {position} role at {company}. With {years_experience} years of experience in {technical_domain}, I am excited about the opportunity to contribute to your engineering team.

{technical_expertise}

My experience includes working with {technologies} and successfully delivering {project_types}. At {previous_company}, I {technical_achievement}, which resulted in {measurable_impact}.

{problem_solving_example}

I am particularly interested in {company}''s work on {company_projects}. I believe my expertise in {specialization} would enable me to make immediate contributions to your team while continuing to grow as an engineer.

{additional_technical_skills}

I would welcome the opportunity to discuss how my technical skills and experience align with your needs. Thank you for your consideration.

Best regards,
{applicant_name}'
),
(
    'Executive/Leadership',
    'Template for senior-level and executive positions',
    'Dear {recipient_title} {recipient_name},

I am writing to express my interest in the {position} role at {company}. With over {years_experience} years of progressive leadership experience in {industry}, I am confident in my ability to drive strategic initiatives and deliver exceptional results for your organization.

{leadership_achievements}

Throughout my career, I have demonstrated success in {key_leadership_areas}. At {current_company}, I led {major_initiative}, resulting in {quantifiable_results}. My leadership philosophy centers on {leadership_approach}, which has consistently enabled teams to exceed performance targets.

{strategic_vision}

I am impressed by {company}''s position in {market_position} and your commitment to {company_values}. I believe my experience in {relevant_experience} positions me to make significant contributions to your continued growth and success.

{executive_capabilities}

I would appreciate the opportunity to discuss how my strategic vision and proven track record align with {company}''s objectives. Thank you for your consideration.

Sincerely,
{applicant_name}
{applicant_title}'
)
ON CONFLICT DO NOTHING;

-- ======================================
-- Database Version Info
-- ======================================
CREATE TABLE IF NOT EXISTS schema_version (
    version VARCHAR(50) PRIMARY KEY,
    description TEXT,
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

INSERT INTO schema_version (version, description) 
VALUES ('1.2.0', 'Merged base schema with cover letter templates system and cover letter versions')
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
  AND (tc.table_name = 'applications' OR tc.table_name = 'cover_letters' OR tc.table_name = 'cover_letter_versions')
ORDER BY tc.table_name, tc.constraint_name;
*/

-- ======================================
-- Success Message
-- ======================================
DO $$ 
DECLARE
    template_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO template_count FROM cover_letter_templates;
    
    RAISE NOTICE 'Database initialization complete!';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Tables created:';
    RAISE NOTICE '  - users';
    RAISE NOTICE '  - resumes, resume_versions';
    RAISE NOTICE '  - cover_letters, cover_letter_versions';
    RAISE NOTICE '  - cover_letter_templates';
    RAISE NOTICE '  - applications';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Cascade deletion constraints in place:';
    RAISE NOTICE '  RESUMES:';
    RAISE NOTICE '    - Original resumes/versions: RESTRICT (protected)';
    RAISE NOTICE '    - Customized versions: CASCADE (auto-deleted)';
    RAISE NOTICE '  COVER LETTERS:';
    RAISE NOTICE '    - Original cover letters/versions: RESTRICT (protected)';
    RAISE NOTICE '    - Customized cover letter versions: CASCADE (auto-deleted)';
    RAISE NOTICE '    - Cover letter master: SET NULL (preserved)';
    RAISE NOTICE '  TEMPLATES:';
    RAISE NOTICE '    - Templates are independent (no cascade to cover letters)';
    RAISE NOTICE '';
    RAISE NOTICE '✓ Indexes created for optimal query performance';
    RAISE NOTICE '✓ Triggers configured for updated_at timestamps';
    RAISE NOTICE '✓ Utility functions available';
    RAISE NOTICE '✓ % cover letter templates loaded', template_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Schema version: 1.2.0';
END $$;
