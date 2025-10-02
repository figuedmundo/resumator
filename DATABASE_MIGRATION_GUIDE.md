# Database Migration Guide

## Overview

The cascade deletion implementation requires database constraint updates. This guide helps you apply them safely.

## Migration Options

### Option 1: Fresh Database (Development Only)

**Use if:** You're in development and can recreate the database

```bash
# 1. Backup current data (if needed)
pg_dump -U postgres resumator > backup.sql

# 2. Drop and recreate database
psql -U postgres -c "DROP DATABASE IF EXISTS resumator;"
psql -U postgres -c "CREATE DATABASE resumator;"

# 3. Run updated init.sql
psql -U postgres -d resumator -f backend/init.sql

# 4. Restart your backend
cd backend
uvicorn app.main:app --reload
```

### Option 2: Migration Script (Production/Existing Data)

**Use if:** You have existing data that must be preserved

```bash
# 1. BACKUP YOUR DATABASE FIRST!
pg_dump -U postgres resumator > backup_$(date +%Y%m%d_%H%M%S).sql

# 2. Test the migration on a copy first
psql -U postgres -c "CREATE DATABASE resumator_test;"
psql -U postgres -d resumator_test < backup.sql
psql -U postgres -d resumator_test -f backend/migrations/001_add_cascade_constraints.sql

# 3. If test succeeds, apply to production
psql -U postgres -d resumator -f backend/migrations/001_add_cascade_constraints.sql

# 4. Verify constraints
psql -U postgres -d resumator -c "
SELECT 
    tc.constraint_name,
    kcu.column_name,
    rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.referential_constraints AS rc
    ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name = 'applications'
ORDER BY tc.constraint_name;
"
```

Expected output:
```
                   constraint_name                   |          column_name          | delete_rule
----------------------------------------------------+-------------------------------+-------------
 applications_cover_letter_id_fkey                  | cover_letter_id               | SET NULL
 applications_customized_resume_version_id_fkey     | customized_resume_version_id  | CASCADE
 applications_resume_id_fkey                        | resume_id                     | RESTRICT
 applications_resume_version_id_fkey                | resume_version_id             | RESTRICT
```

### Option 3: No Migration (Application-Level Only)

**Use if:** You can't modify the database right now

The implementation works even without database constraints! The cascade rules are enforced at the application level, so you can:

1. Skip the database migration for now
2. Use the new API endpoints immediately
3. Apply the database migration later during maintenance

**Note:** Without database constraints, you don't get database-level protection, but the application still enforces all rules correctly.

## Verification Steps

After migration, verify everything works:

```bash
# 1. Check constraints are in place
psql -U postgres -d resumator -c "
SELECT constraint_name, delete_rule 
FROM information_schema.referential_constraints 
WHERE constraint_schema = 'public';
"

# 2. Test the application
cd backend
pytest tests/ -v

# 3. Test API endpoints
curl -X GET "http://localhost:8000/api/v1/resumes/1/dependencies" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Rollback Plan

If something goes wrong:

```bash
# Restore from backup
psql -U postgres -c "DROP DATABASE resumator;"
psql -U postgres -c "CREATE DATABASE resumator;"
psql -U postgres -d resumator < backup.sql
```

## Common Issues

### Issue: "constraint already exists"

**Solution:** The migration script handles this with `DROP CONSTRAINT IF EXISTS`

### Issue: "cannot drop constraint ... because other objects depend on it"

**Solution:** This shouldn't happen, but if it does:
```sql
ALTER TABLE applications DROP CONSTRAINT constraint_name CASCADE;
-- Then re-add with correct ON DELETE clause
```

### Issue: "violates foreign key constraint"

**Solution:** Your data might have orphaned records. Clean them up:
```sql
-- Find orphaned applications
SELECT id, resume_id FROM applications 
WHERE resume_id NOT IN (SELECT id FROM resumes);

-- Delete or fix them
DELETE FROM applications WHERE resume_id NOT IN (SELECT id FROM resumes);
```

## Docker Compose Users

If using Docker:

```bash
# Stop containers
docker-compose down

# Update init.sql is already done

# Remove old volume (only if starting fresh!)
docker volume rm resumator_postgres_data

# Start with new schema
docker-compose up -d

# Or migrate existing volume
docker-compose exec db psql -U postgres -d resumator -f /migrations/001_add_cascade_constraints.sql
```

## Testing After Migration

Create a test to verify cascade behavior:

```python
# test_cascade.py
def test_application_cascade_deletion(client, test_db):
    # Create resume and application
    resume = create_test_resume()
    app = create_test_application(resume_id=resume.id)
    
    # Delete application
    response = client.delete(f"/api/v1/applications/{app.id}")
    assert response.status_code == 200
    
    # Verify resume still exists
    response = client.get(f"/api/v1/resumes/{resume.id}")
    assert response.status_code == 200

def test_resume_restrict_deletion(client, test_db):
    # Create resume with application
    resume = create_test_resume()
    app = create_test_application(resume_id=resume.id)
    
    # Try to delete resume (should fail)
    response = client.delete(f"/api/v1/resumes/{resume.id}")
    assert response.status_code == 400
    assert "cannot delete" in response.json()["detail"].lower()
```

## Success Indicators

After migration, you should see:

✅ All foreign key constraints in place
✅ Indexes created for performance
✅ Utility functions available
✅ No errors in application logs
✅ API endpoints return proper cascade information
✅ Tests pass

## Need Help?

1. Check the constraint verification query output
2. Review application logs for errors
3. Test with dry_run=true first
4. Refer to CASCADE_DELETION_README.md for usage

## Summary

| Scenario | Recommended Option | Risk Level |
|----------|-------------------|------------|
| Development | Option 1 (Fresh DB) | Low |
| Staging | Option 2 (Migration) | Low |
| Production with backup | Option 2 (Migration) | Medium |
| Production no maintenance window | Option 3 (App-level only) | Low |

The implementation is production-ready with or without database constraints. The constraints add an extra safety layer but aren't strictly required.
