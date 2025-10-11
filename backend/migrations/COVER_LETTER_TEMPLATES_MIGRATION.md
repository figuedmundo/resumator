# Cover Letter Templates Migration Guide

## Overview
This migration adds a cover letter templates system to the Resumator backend, enabling users to create cover letters from reusable templates with proper cascade deletion rules.

## Migration File
`add_cover_letter_templates.sql`

## Changes Made

### 1. New Table: `cover_letter_templates`
Creates a template library for generating cover letters.

**Schema:**
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(255) NOT NULL
- description: TEXT
- content_template: TEXT NOT NULL (with placeholders like {position}, {company})
- created_at: TIMESTAMP WITH TIME ZONE
- updated_at: TIMESTAMP WITH TIME ZONE
```

### 2. Updated Table: `cover_letters`
Adds template reference and improved tracking.

**New Columns:**
- `template_id`: INTEGER (FK to cover_letter_templates)
- `updated_at`: TIMESTAMP WITH TIME ZONE

### 3. Cascade Deletion Rules

#### Summary of All Cascade Rules:
```
User deleted → Cover Letters CASCADE deleted
Cover Letter deleted → Applications SET NULL (cover_letter_id)
Template deleted → Cover Letters SET NULL (template_id)
```

#### Detailed Rules:

**cover_letters table:**
- `user_id` → CASCADE: When user is deleted, their cover letters are deleted
- `template_id` → SET NULL: When template is deleted, cover letters keep content but lose template reference

**applications table:**
- `cover_letter_id` → SET NULL: When cover letter is deleted, applications preserve but lose cover letter reference

### 4. Default Templates
Five pre-built templates are included:
1. **Professional Standard** - Formal corporate cover letter
2. **Career Change** - For industry/role transitions
3. **Entry Level** - For recent graduates
4. **Technical Role** - For software engineering positions
5. **Executive/Leadership** - For senior-level positions

### 5. Utility Functions

**get_template_usage(template_id)**
Returns all cover letters created from a specific template with application counts.

**get_user_cover_letters_with_details(user_id)**
Returns user's cover letters with template info and application usage.

### 6. Indexes Added
- `idx_cover_letter_templates_name`
- `idx_cover_letter_templates_created_at`
- `idx_cover_letters_template_id`
- `idx_cover_letters_user_id`
- `idx_cover_letters_created_at`
- `idx_cover_letters_title`

## Model Changes

### New Model: `CoverLetterTemplate`
**File:** `app/models/cover_letter.py`

```python
class CoverLetterTemplate(Base):
    """Cover letter template model for storing reusable templates."""
    
    # Fields: id, name, description, content_template, created_at, updated_at
    # Relationships: cover_letters
```

### Updated Model: `CoverLetter`
**File:** `app/models/cover_letter.py` (moved from application.py)

```python
class CoverLetter(Base):
    """Cover letter model for storing generated cover letters."""
    
    # New fields: template_id, updated_at
    # Relationships: user, template, applications
```

### Updated Model: `User`
**File:** `app/models/user.py`

Added relationship:
```python
cover_letters = relationship("CoverLetter", back_populates="user", cascade="all, delete-orphan")
```

### Updated Model: `Application`
**File:** `app/models/application.py`

- Removed CoverLetter class definition (moved to cover_letter.py)
- Added TYPE_CHECKING import for type hints

## Running the Migration

### Prerequisites
1. Backup your database
2. Ensure you're in the backend directory
3. PostgreSQL connection configured

### Steps

1. **Backup Database:**
   ```bash
   pg_dump resumator_db > backup_before_cover_letter_templates.sql
   ```

2. **Run Migration:**
   ```bash
   psql -d resumator_db -f migrations/add_cover_letter_templates.sql
   ```

3. **Verify Migration:**
   The migration includes verification queries that will display:
   - Number of default templates created (should be 5)
   - Foreign key constraints (should be 2 for cover_letters)
   - Current cascade rules for all related tables

4. **Expected Output:**
   ```
   NOTICE: Migration complete!
   NOTICE: Created 5 default templates
   NOTICE: Found 2 foreign key constraints on cover_letters table
   NOTICE: Expected: 2 (user_id, template_id)
   ```

### Rollback (if needed)
```sql
BEGIN;
-- Drop new table
DROP TABLE IF EXISTS cover_letter_templates CASCADE;

-- Remove new columns
ALTER TABLE cover_letters DROP COLUMN IF EXISTS template_id;
ALTER TABLE cover_letters DROP COLUMN IF EXISTS updated_at;

-- Drop triggers
DROP TRIGGER IF EXISTS trg_cover_letters_updated_at ON cover_letters;
DROP TRIGGER IF EXISTS trg_cover_letter_templates_updated_at ON cover_letter_templates;

-- Drop functions
DROP FUNCTION IF EXISTS update_cover_letters_updated_at();
DROP FUNCTION IF EXISTS update_cover_letter_templates_updated_at();
DROP FUNCTION IF EXISTS get_template_usage(INTEGER);
DROP FUNCTION IF EXISTS get_user_cover_letters_with_details(INTEGER);

-- Remove schema version
DELETE FROM schema_version WHERE version = '1.1.0-cover-letter-templates';

COMMIT;
```

## Code Changes Required

### Import Updates
All imports of `CoverLetter` should continue to work:

```python
# Both of these work:
from app.models import CoverLetter, CoverLetterTemplate
from app.models.cover_letter import CoverLetter, CoverLetterTemplate
```

### Using Templates in Code

**Creating a Cover Letter from Template:**
```python
from app.models import CoverLetter, CoverLetterTemplate
from sqlalchemy.orm import Session

def create_cover_letter_from_template(
    db: Session,
    user_id: int,
    template_id: int,
    title: str,
    placeholders: dict
) -> CoverLetter:
    """Create a cover letter by populating a template with placeholders."""
    
    # Get template
    template = db.query(CoverLetterTemplate).filter_by(id=template_id).first()
    if not template:
        raise ValueError(f"Template {template_id} not found")
    
    # Populate placeholders
    content = template.content_template.format(**placeholders)
    
    # Create cover letter
    cover_letter = CoverLetter(
        user_id=user_id,
        template_id=template_id,
        title=title,
        content=content
    )
    db.add(cover_letter)
    db.commit()
    db.refresh(cover_letter)
    
    return cover_letter
```

**Querying Cover Letters with Template Info:**
```python
from sqlalchemy import text

def get_user_cover_letters_details(db: Session, user_id: int):
    """Get user's cover letters with template and application info."""
    
    query = """
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
    WHERE cl.user_id = :user_id
    GROUP BY cl.id, cl.title, clt.name, cl.created_at
    ORDER BY cl.created_at DESC
    """
    
    return db.execute(text(query), {"user_id": user_id}).fetchall()
```

## Template Placeholders

Common placeholders used in templates (use in your template definitions):
- `{position}` - Job position/title
- `{company}` - Company name
- `{field}` - Professional field/domain
- `{applicant_name}` - Applicant's full name
- `{applicant_title}` - Applicant's current title
- `{key_skills}` - List of relevant skills
- `{years_experience}` - Years of experience
- `{company_interest}` - Why interested in company
- `{company_achievement}` - Company's notable achievement
- `{company_projects}` - Company's key projects
- `{company_values}` - Company's values
- `{highlight_experience}` - Highlighted experience details
- `{additional_qualifications}` - Additional qualifications
- `{transferable_skills}` - Skills transferable from previous field
- `{motivation}` - Motivation for career change
- `{preparation_activities}` - Activities done to prepare for transition
- `{relevant_achievements}` - Relevant achievements
- `{academic_achievements}` - Academic accomplishments
- `{university}` - University name
- `{degree}` - Degree type
- `{internship_experience}` - Internship details
- `{relevant_projects}` - Relevant academic/personal projects
- `{relevant_areas}` - Relevant work areas
- `{enthusiasm_and_motivation}` - Personal enthusiasm statement
- `{technical_expertise}` - Technical expertise summary
- `{technologies}` - List of technologies/tools
- `{project_types}` - Types of projects worked on
- `{previous_company}` - Previous company name
- `{technical_achievement}` - Technical achievement
- `{measurable_impact}` - Measurable impact achieved
- `{problem_solving_example}` - Problem-solving example
- `{specialization}` - Technical specialization
- `{additional_technical_skills}` - Additional technical skills
- `{recipient_title}` - Recipient's title (Dr., Mr., etc.)
- `{recipient_name}` - Recipient's name
- `{current_company}` - Current company name
- `{leadership_achievements}` - Leadership accomplishments
- `{key_leadership_areas}` - Key leadership areas
- `{major_initiative}` - Major initiative led
- `{quantifiable_results}` - Quantifiable results achieved
- `{strategic_vision}` - Strategic vision statement
- `{market_position}` - Company's market position
- `{executive_capabilities}` - Executive capabilities summary
- `{leadership_approach}` - Leadership philosophy/approach

## Testing Cascade Deletion

### Test User Deletion:
```sql
-- Create test user
INSERT INTO users (username, email, hashed_password) 
VALUES ('test_user', 'test@example.com', 'hashed_password')
RETURNING id;

-- Create test cover letter (note the id from above)
INSERT INTO cover_letters (user_id, template_id, title, content)
VALUES (1, 1, 'Test Letter', 'Test content')
RETURNING id;

-- Verify cover letter exists
SELECT * FROM cover_letters WHERE user_id = 1;

-- Delete user (should cascade delete cover letters)
DELETE FROM users WHERE id = 1;

-- Verify cover letters are deleted
SELECT * FROM cover_letters WHERE user_id = 1;
-- Should return 0 rows
```

### Test Cover Letter Deletion:
```sql
-- Create test cover letter
INSERT INTO cover_letters (user_id, template_id, title, content)
VALUES (1, 1, 'Test Letter', 'Test content')
RETURNING id;

-- Create test application using this cover letter
INSERT INTO applications (
    user_id, resume_id, resume_version_id, 
    cover_letter_id, company, position, status
)
VALUES (1, 1, 1, LAST_INSERT_ID(), 'TestCorp', 'Engineer', 'Applied')
RETURNING id;

-- Verify application has cover_letter_id
SELECT id, cover_letter_id FROM applications;

-- Delete cover letter
DELETE FROM cover_letters WHERE id = <cl_id>;

-- Verify application still exists but cover_letter_id is NULL
SELECT id, cover_letter_id FROM applications;
-- Should show cover_letter_id as NULL
```

### Test Template Deletion:
```sql
-- Create test cover letter with template
INSERT INTO cover_letters (user_id, template_id, title, content)
VALUES (1, 1, 'Test Letter', 'Test content')
RETURNING id;

-- Verify cover letter has template_id
SELECT id, template_id FROM cover_letters;

-- Delete template
DELETE FROM cover_letter_templates WHERE id = 1;

-- Verify cover letter still exists but template_id is NULL
SELECT id, template_id FROM cover_letters;
-- Should show template_id as NULL
```

## Checking Current Schema

**View all templates:**
```sql
SELECT * FROM cover_letter_templates;
```

**View all cover letters with template info:**
```sql
SELECT 
    cl.id,
    cl.title,
    cl.user_id,
    clt.name as template_name,
    cl.created_at
FROM cover_letters cl
LEFT JOIN cover_letter_templates clt ON cl.template_id = clt.id
ORDER BY cl.created_at DESC;
```

**View applications with cover letters:**
```sql
SELECT 
    a.id as app_id,
    a.company,
    a.position,
    cl.id as cl_id,
    cl.title as cl_title,
    clt.name as template_name
FROM applications a
LEFT JOIN cover_letters cl ON a.cover_letter_id = cl.id
LEFT JOIN cover_letter_templates clt ON cl.template_id = clt.id
ORDER BY a.applied_date DESC;
```

**Check foreign key constraints:**
```sql
SELECT 
    tc.constraint_name,
    kcu.column_name,
    ccu.table_name,
    rc.delete_rule
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
    ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints rc 
    ON rc.constraint_name = tc.constraint_name
WHERE tc.table_name IN ('cover_letters', 'applications')
  AND tc.constraint_type = 'FOREIGN KEY'
ORDER BY tc.table_name, tc.constraint_name;
```

## Summary of Files Modified

### Created:
1. `migrations/add_cover_letter_templates.sql` - Main migration script
2. `app/models/cover_letter.py` - CoverLetter and CoverLetterTemplate models

### Modified:
1. `app/models/application.py` - Removed CoverLetter class
2. `app/models/user.py` - Added cover_letters relationship
3. `app/models/__init__.py` - Updated imports

## Backwards Compatibility

All existing code that imports `CoverLetter` from `app.models` will continue to work:

```python
# This still works
from app.models import CoverLetter

# This also works (recommended)
from app.models import CoverLetter, CoverLetterTemplate
```

The migration is fully backwards compatible with existing cover letters in the database.

## Next Steps

After running the migration, consider implementing:

1. **API Endpoints for Templates:**
   - `GET /api/templates` - List all templates
   - `GET /api/templates/{id}` - Get specific template
   - `GET /api/templates/{id}/preview` - Preview with sample data

2. **API Endpoints for Cover Letters:**
   - `POST /api/cover-letters` - Create from template
   - `GET /api/cover-letters` - List user's cover letters
   - `PUT /api/cover-letters/{id}` - Update cover letter
   - `DELETE /api/cover-letters/{id}` - Delete cover letter

3. **Services/Business Logic:**
   - Template placeholder validation
   - Cover letter generation with AI/LLM
   - Template usage analytics

4. **Frontend Components:**
   - Template selection UI
   - Placeholder form generation
   - Cover letter preview

## Troubleshooting

### Issue: Migration fails with "column already exists"
**Solution:** The migration uses `ADD COLUMN IF NOT EXISTS`, so it's safe to run multiple times.

### Issue: Foreign key constraints fail
**Solution:** Ensure all related tables (users, cover_letters, applications) exist before running migration.

### Issue: Templates not created
**Solution:** Check if insert conflicts. Templates use `ON CONFLICT DO NOTHING`, so duplicate names won't cause issues.

### Issue: Cascade deletion not working
**Solution:** Verify constraints were created:
```sql
SELECT * FROM information_schema.referential_constraints 
WHERE table_name = 'cover_letters';
```

## Support

For issues or questions about the migration:
1. Check the migration verification output
2. Review the SQL constraints documentation
3. Consult the model relationship definitions
4. Check database logs for errors
