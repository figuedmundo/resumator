-- Migration script to add cover letter templates system
-- Run this to add template functionality to cover letters
-- Backup your database before running!

BEGIN;

-- ======================================
-- Step 1: Create cover_letter_templates table
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
-- Step 2: Add template_id to cover_letters table
-- ======================================
ALTER TABLE cover_letters 
ADD COLUMN IF NOT EXISTS template_id INTEGER;

-- Add foreign key constraint with SET NULL on template deletion
ALTER TABLE cover_letters
DROP CONSTRAINT IF EXISTS cover_letters_template_id_fkey;

ALTER TABLE cover_letters
ADD CONSTRAINT cover_letters_template_id_fkey
FOREIGN KEY (template_id)
REFERENCES cover_letter_templates(id)
ON DELETE SET NULL;

-- Add index for template_id
CREATE INDEX IF NOT EXISTS idx_cover_letters_template_id ON cover_letters(template_id);

-- Add comment for template_id column
COMMENT ON COLUMN cover_letters.template_id IS 
'Optional reference to template used - preserved when template deleted (SET NULL)';

COMMENT ON CONSTRAINT cover_letters_template_id_fkey ON cover_letters IS 
'SET NULL: Preserves cover letter when template is deleted';

-- ======================================
-- Step 3: Verify existing cover_letters constraints
-- ======================================
-- Ensure user_id has proper CASCADE deletion
ALTER TABLE cover_letters
DROP CONSTRAINT IF EXISTS cover_letters_user_id_fkey;

ALTER TABLE cover_letters
ADD CONSTRAINT cover_letters_user_id_fkey
FOREIGN KEY (user_id)
REFERENCES users(id)
ON DELETE CASCADE;

-- Add comments for cascade behavior
COMMENT ON CONSTRAINT cover_letters_user_id_fkey ON cover_letters IS 
'CASCADE: Deletes cover letters when user is deleted';

-- ======================================
-- Step 4: Add indexes for better performance
-- ======================================
CREATE INDEX IF NOT EXISTS idx_cover_letters_user_id ON cover_letters(user_id);
CREATE INDEX IF NOT EXISTS idx_cover_letters_created_at ON cover_letters(created_at);
CREATE INDEX IF NOT EXISTS idx_cover_letters_title ON cover_letters(title);

-- ======================================
-- Step 5: Add updated_at column to cover_letters
-- ======================================
ALTER TABLE cover_letters 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_cover_letters_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trg_cover_letters_updated_at ON cover_letters;
CREATE TRIGGER trg_cover_letters_updated_at
    BEFORE UPDATE ON cover_letters
    FOR EACH ROW
    EXECUTE FUNCTION update_cover_letters_updated_at();

-- Create trigger function for templates updated_at
CREATE OR REPLACE FUNCTION update_cover_letter_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Drop trigger if exists and create new one
DROP TRIGGER IF EXISTS trg_cover_letter_templates_updated_at ON cover_letter_templates;
CREATE TRIGGER trg_cover_letter_templates_updated_at
    BEFORE UPDATE ON cover_letter_templates
    FOR EACH ROW
    EXECUTE FUNCTION update_cover_letter_templates_updated_at();

-- ======================================
-- Step 6: Insert default templates
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
-- Step 7: Create utility functions
-- ======================================

-- Function to get cover letters using a specific template
CREATE OR REPLACE FUNCTION get_template_usage(template_id_param INTEGER)
RETURNS TABLE(
    cover_letter_id INTEGER,
    title VARCHAR,
    user_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE,
    application_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.title,
        cl.user_id,
        cl.created_at,
        COUNT(a.id) as application_count
    FROM cover_letters cl
    LEFT JOIN applications a ON a.cover_letter_id = cl.id
    WHERE cl.template_id = template_id_param
    GROUP BY cl.id, cl.title, cl.user_id, cl.created_at
    ORDER BY cl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_template_usage(INTEGER) IS 
'Returns all cover letters created from a specific template with application counts';

-- Function to get user's cover letters with template and application info
CREATE OR REPLACE FUNCTION get_user_cover_letters_with_details(user_id_param INTEGER)
RETURNS TABLE(
    cover_letter_id INTEGER,
    title VARCHAR,
    template_name VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    application_count BIGINT,
    companies TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        cl.id,
        cl.title,
        clt.name as template_name,
        cl.created_at,
        COUNT(DISTINCT a.id) as application_count,
        STRING_AGG(DISTINCT a.company, ', ') as companies
    FROM cover_letters cl
    LEFT JOIN cover_letter_templates clt ON cl.template_id = clt.id
    LEFT JOIN applications a ON a.cover_letter_id = cl.id
    WHERE cl.user_id = user_id_param
    GROUP BY cl.id, cl.title, clt.name, cl.created_at
    ORDER BY cl.created_at DESC;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_user_cover_letters_with_details(INTEGER) IS 
'Returns user cover letters with template info and application usage';

-- ======================================
-- Step 8: Update schema version tracking
-- ======================================
INSERT INTO schema_version (version, description) 
VALUES ('1.1.0-cover-letter-templates', 'Added cover letter templates system with proper cascade rules')
ON CONFLICT (version) DO NOTHING;

-- ======================================
-- Step 9: Verify changes
-- ======================================
DO $$ 
DECLARE
    template_count INTEGER;
    constraint_count INTEGER;
BEGIN
    -- Count templates
    SELECT COUNT(*) INTO template_count
    FROM cover_letter_templates;
    
    -- Count foreign key constraints on cover_letters
    SELECT COUNT(*) INTO constraint_count
    FROM information_schema.table_constraints
    WHERE table_name = 'cover_letters' 
      AND constraint_type = 'FOREIGN KEY';
    
    RAISE NOTICE 'Migration complete!';
    RAISE NOTICE 'Created % default templates', template_count;
    RAISE NOTICE 'Found % foreign key constraints on cover_letters table', constraint_count;
    RAISE NOTICE 'Expected: 2 (user_id, template_id)';
END $$;

-- ======================================
-- Step 10: Show current constraints
-- ======================================
SELECT 
    'cover_letters' as table_name,
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
  AND tc.table_name = 'cover_letters'

UNION ALL

SELECT 
    'applications' as table_name,
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
  AND kcu.column_name = 'cover_letter_id'
ORDER BY table_name, constraint_name;

COMMIT;

-- ======================================
-- Summary of Cascade Rules:
-- ======================================
-- User deleted → Cover letters CASCADE deleted
-- Cover letter deleted → Applications SET NULL (cover_letter_id)
-- Template deleted → Cover letters SET NULL (template_id)
-- ======================================
