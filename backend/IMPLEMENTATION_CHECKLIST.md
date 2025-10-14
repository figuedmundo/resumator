# Cover Letter Refactoring - Implementation Checklist

## Files Updated ✅

- ✅ `app/models/cover_letter.py` - Added CoverLetterVersion model
- ✅ `app/models/application.py` - Added cover letter versioning columns
- ✅ `migrations/1.2.0-cover-letter-refactor.sql` - Database migration
- ✅ `app/services/cover_letter_service.py` - Complete service refactor
- ✅ `app/schemas/cover_letter.py` - Updated schemas
- ✅ `app/api/v1/cover_letters.py` - Refactored API endpoints

## Next Steps

### Step 1: Run Database Migration
```bash
# Connect to PostgreSQL and run migration
psql -U postgres -d resumator -f migrations/1.2.0-cover-letter-refactor.sql

# Verify migration completed successfully
# Check for success message in console output
```

### Step 2: Verify Models Load Correctly
```bash
# Start Python shell and test imports
python
>>> from app.models.cover_letter import CoverLetter, CoverLetterVersion, CoverLetterTemplate
>>> from app.models.application import Application
>>> print("Models imported successfully!")
```

### Step 3: Test Service Methods
```bash
# Create test script or use Python shell
from app.services.cover_letter_service import CoverLetterService
from app.core.database import get_db

db = next(get_db())
service = CoverLetterService(db)

# Test basic operations
cl = service.create_cover_letter(user_id=1, title="Test Cover Letter")
print(f"Created cover letter: {cl.id}")

version = service.create_version(
    user_id=1,
    cover_letter_id=cl.id,
    content="Test content",
    is_original=True
)
print(f"Created version: {version.version}")

# List versions
versions = service.list_versions(user_id=1, cover_letter_id=cl.id)
print(f"Found {len(versions)} versions")
```

### Step 4: Verify API Endpoints
```bash
# Start the backend server
uvicorn main:app --reload

# Test endpoints with curl or Postman
# GET /cover-letters/templates
curl http://localhost:8000/api/v1/cover-letters/templates

# POST /cover-letters (requires auth token)
curl -X POST http://localhost:8000/api/v1/cover-letters \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"title": "My Cover Letter", "is_default": false}'
```

### Step 5: Update Application Service
Review `app/services/application_service.py` and add support for:
- Accepting `cover_letter_version_id` when creating applications
- Handling cover letter version customization
- Cascade deletion of customized cover letter versions

Example updates needed:
```python
def create_application(self, ..., cover_letter_version_id: Optional[int] = None):
    # Add cover_letter_version_id to application creation
    pass

def delete_application(self, ...):
    # Customized cover letter versions are CASCADE deleted automatically
    # Original versions are RESTRICT protected
    pass
```

### Step 6: Frontend Updates (when ready)
- Update cover letter creation flows to use new versioning
- Add version management UI
- Update application form to select from versions
- Add customization workflows

## Data Migration (If You Have Existing Data)

If you have existing cover letters in the old system and want to migrate them:

```sql
-- Backup old data first
CREATE TABLE cover_letters_backup AS SELECT * FROM cover_letters;

-- Migrate existing cover letters
INSERT INTO cover_letters (user_id, title, is_default, created_at, updated_at)
SELECT user_id, title, false, created_at, updated_at
FROM cover_letters_backup
WHERE NOT EXISTS (
    SELECT 1 FROM cover_letters cl 
    WHERE cl.user_id = cover_letters_backup.user_id 
    AND cl.title = cover_letters_backup.title
);

-- Create versions for migrated records
INSERT INTO cover_letter_versions 
  (cover_letter_id, version, markdown_content, is_original, created_at)
SELECT cl.id, 'v1', clb.content, true, clb.created_at
FROM cover_letters_backup clb
JOIN cover_letters cl 
  ON cl.user_id = clb.user_id 
  AND cl.title = clb.title;
```

## Testing Scenarios

### Scenario 1: Create and Manage Cover Letter
1. Create master cover letter with title "Tech Role"
2. Add version v1 with initial content
3. Verify version appears in list
4. Update version content
5. Verify updated content is returned

### Scenario 2: Generate from AI
1. Generate cover letter from resume + job description
2. Verify cover letter created with v1 version
3. Verify content is present
4. Verify is_original flag is true

### Scenario 3: Create Company-Specific Versions
1. Create base cover letter
2. Create v1 (original, is_original=true)
3. Create v2 - Company A (customized, is_original=false)
4. Create v3 - Company B (customized, is_original=false)
5. Verify all versions appear in list
6. Verify version names are correct

### Scenario 4: Dependency Checking
1. Create cover letter with version
2. Create application using that version
3. Try to delete cover letter → should fail with helpful error
4. Try to delete version → should fail with helpful error
5. Delete application
6. Delete version → should succeed
7. Delete cover letter → should succeed

### Scenario 5: Cascade Deletion
1. Create cover letter with multiple versions
2. Create application with customized version
3. Delete application
4. Verify customized version is deleted (CASCADE)
5. Verify original version still exists (not deleted)
6. Create new application using original version
7. Delete application
8. Original version still exists (RESTRICT prevents deletion of original versions used by apps)

## Breaking Changes for Frontend

### Old API (Deprecated)
```
POST /cover-letters → creates standalone cover letter
```

### New API
```
POST /cover-letters → creates master record (no versions)
POST /cover-letters/{id}/versions → add version to master
GET /cover-letters/{id} → returns master + all versions
```

## Common Issues & Solutions

### Issue: "Cannot delete the only version"
**Solution**: This is expected behavior. You cannot delete the only version of a cover letter. Create a new version first if you need to delete this one.

### Issue: "Cannot delete cover letter. It is referenced by X applications"
**Solution**: Delete those applications first, or reassign them to different cover letters.

### Issue: "Version not found"
**Solution**: Verify the cover_letter_id and version_id are correct and belong to the current user.

### Issue: "Cannot delete original version. It is referenced by X applications"
**Solution**: This is expected for original versions used by applications. Delete the applications first if you want to remove this version.

## Performance Notes

### Indexes Created
- `cover_letters(user_id)` - Fast user lookups
- `cover_letter_versions(cover_letter_id)` - Fast version retrieval
- `cover_letter_versions(is_original)` - Fast original version filtering
- `applications(cover_letter_version_id)` - Fast dependency checking

### Query Performance
- List cover letters for user: O(1) indexed lookup
- Get cover letter with versions: N+1 mitigated by relationship eager loading
- Check dependencies: Uses indexed join queries
- Delete operations: Constraints handled by database (efficient)

## Rollback Plan

If you need to rollback to the old system:

1. **Database**: Reverse migration (recreate old table structure from backup)
2. **Code**: Revert all changed files to previous versions
3. **Data**: Use `cover_letters_backup` table to restore old data
4. **API**: Temporarily support both old and new endpoints during transition

## Monitoring

After deployment, monitor:
- API response times (should be similar to before)
- Database query times (should be faster with proper indexes)
- Error rates (should be near zero)
- User feedback on new versioning workflow

## Support

For issues or questions about the refactoring:
1. Check this checklist first
2. Review the implementation guide artifact
3. Check database schema with: `\d cover_letters` in psql
4. Check migration was applied: `SELECT version FROM schema_version;`

---

**Status**: Ready for implementation
**Last Updated**: $(date)
