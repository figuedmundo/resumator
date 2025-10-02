# Cascade Deletion Implementation

## Overview

This implementation provides **safe, predictable cascade deletion** for the Resumator application with comprehensive dependency checking and user feedback.

## Cascade Deletion Rules

### 1. Application Deletion

When an **application** is deleted:

✅ **DELETED:**
- The application record itself
- Associated **customized resume version** (if not used by other applications)

✅ **PRESERVED:**
- Original resume (always)
- Original resume version (always)
- Cover letter (may be used by other applications)

### 2. Resume Deletion

When a **resume** is deleted:

**Option A: No Applications (Safe Delete)**
- ✅ Delete resume
- ✅ Delete all versions (cascade)
- ⚡ Instant deletion

**Option B: Has Applications (Blocked)**
- ❌ Cannot delete
- 💡 User must choose:
  1. Delete applications first, then resume
  2. Force delete (deletes applications + resume)
  3. Reassign applications to another resume
  4. Cancel operation

### 3. Resume Version Deletion

Rules for deleting a **specific version**:

❌ **CANNOT DELETE IF:**
- It's the only version of the resume
- It's an original version referenced by applications
- It's a customized version used by applications

✅ **CAN DELETE:**
- Non-original versions not referenced by applications
- Extra versions created for testing

## Implementation Files

### Updated Files:
1. `/backend/app/models/application.py` - Added CASCADE constraints
2. `/backend/app/models/resume.py` - Added CASCADE constraints  
3. `/backend/app/services/application_service.py` - Enhanced deletion logic
4. `/backend/app/services/resume_service.py` - Added dependency checking
5. `/backend/app/api/v1/applications.py` - New endpoints
6. `/backend/app/api/v1/resumes.py` - New endpoints

## New API Endpoints

### Application Endpoints

#### 1. Delete Application (Enhanced)
```http
DELETE /api/v1/applications/{application_id}?dry_run=false
```

**Response:**
```json
{
  "message": "Application deleted successfully. Customized resume version was also deleted.",
  "details": {
    "application_deleted": true,
    "customized_version_deleted": true,
    "customized_version_id": 123,
    "original_resume_preserved": true,
    "original_version_preserved": true
  },
  "warnings": []
}
```

#### 2. Preview Application Deletion
```http
GET /api/v1/applications/{application_id}/deletion-preview
```

Shows exactly what will be deleted before deletion.

#### 3. Bulk Delete Applications (Enhanced)
```http
DELETE /api/v1/applications/bulk
Content-Type: application/json

{
  "application_ids": [1, 2, 3],
  "dry_run": false
}
```

### Resume Endpoints

#### 1. Check Resume Dependencies
```http
GET /api/v1/resumes/{resume_id}/dependencies
```

Returns:
- Can delete (yes/no)
- Number of dependent applications
- List of applications with details
- Available options (delete all, reassign, cancel)

#### 2. Check Version Dependencies
```http
GET /api/v1/resumes/{resume_id}/versions/{version_id}/dependencies
```

Checks if a specific version can be deleted.

#### 3. Force Delete Resume
```http
DELETE /api/v1/resumes/{resume_id}?force=true
```

Deletes resume AND all dependent applications.

#### 4. Reassign Applications
```http
POST /api/v1/resumes/{resume_id}/reassign
Content-Type: application/json

{
  "target_resume_id": 456,
  "target_version_id": 789  // Optional
}
```

Moves all applications to a different resume before deleting.

## Database Changes

### Foreign Key Constraints

The models now include proper CASCADE constraints:

```python
# Applications model
resume_id = ForeignKey("resumes.id", ondelete="RESTRICT")  # Blocks resume deletion
resume_version_id = ForeignKey("resume_versions.id", ondelete="RESTRICT")  # Blocks version deletion
customized_resume_version_id = ForeignKey("resume_versions.id", ondelete="CASCADE")  # Deletes with app
cover_letter_id = ForeignKey("cover_letters.id", ondelete="SET NULL")  # Preserves cover letter

# Resume Versions model
resume_id = ForeignKey("resumes.id", ondelete="CASCADE")  # Deletes with resume
```

**Note:** These constraints are defined in the models but will require a database migration to take full effect at the database level.

## Testing the Implementation

### 1. Test Application Deletion

```bash
# Preview what will be deleted
curl -X GET "http://localhost:8000/api/v1/applications/1/deletion-preview" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Delete with dry run
curl -X DELETE "http://localhost:8000/api/v1/applications/1?dry_run=true" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Actually delete
curl -X DELETE "http://localhost:8000/api/v1/applications/1" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 2. Test Resume Deletion

```bash
# Check dependencies first
curl -X GET "http://localhost:8000/api/v1/resumes/1/dependencies" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Try to delete (will fail if has applications)
curl -X DELETE "http://localhost:8000/api/v1/resumes/1" \
  -H "Authorization: Bearer YOUR_TOKEN"

# Force delete (deletes applications too)
curl -X DELETE "http://localhost:8000/api/v1/resumes/1?force=true" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test Reassigning Applications

```bash
# Move applications to another resume
curl -X POST "http://localhost:8000/api/v1/resumes/1/reassign" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"target_resume_id": 2}'
```

## Frontend Integration Examples

### Example 1: Delete Application with Preview

```typescript
async function deleteApplication(appId: number) {
  // 1. Get preview
  const preview = await fetch(`/api/v1/applications/${appId}/deletion-preview`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await preview.json();

  // 2. Show confirmation dialog
  const confirmed = await showDialog({
    title: "Delete Application",
    message: `
      This will delete:
      - Application for ${data.application.company}
      ${data.will_delete.customized_resume_version 
        ? `- Customized resume: ${data.will_delete.customized_resume_version.version}`
        : ''
      }
      
      This will preserve:
      - Original resume: ${data.will_preserve.original_resume.title}
      - Original version: ${data.will_preserve.original_version.version}
    `,
    warnings: data.warnings
  });

  if (!confirmed) return;

  // 3. Execute deletion
  const response = await fetch(`/api/v1/applications/${appId}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${token}` }
  });

  const result = await response.json();
  console.log(result.message);
}
```

### Example 2: Delete Resume with Dependencies

```typescript
async function deleteResume(resumeId: number) {
  // 1. Check dependencies
  const deps = await fetch(`/api/v1/resumes/${resumeId}/dependencies`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const data = await deps.json();

  if (!data.can_delete) {
    // 2. Show options to user
    const choice = await showOptionsDialog({
      title: "Resume Has Dependencies",
      message: `This resume is used by ${data.application_count} application(s).`,
      options: [
        {
          label: "Delete All (Resume + Applications)",
          value: "force_delete"
        },
        {
          label: "Move Applications to Another Resume",
          value: "reassign"
        },
        {
          label: "Cancel",
          value: "cancel"
        }
      ]
    });

    if (choice === "force_delete") {
      // Delete everything
      await fetch(`/api/v1/resumes/${resumeId}?force=true`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } else if (choice === "reassign") {
      // Show resume selector and reassign
      const targetResumeId = await showResumeSelector();
      await fetch(`/api/v1/resumes/${resumeId}/reassign`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ target_resume_id: targetResumeId })
      });
      
      // Then delete the resume
      await fetch(`/api/v1/resumes/${resumeId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    }
  } else {
    // 3. Safe to delete
    await fetch(`/api/v1/resumes/${resumeId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    });
  }
}
```

## Safety Features

### 1. Dry Run Mode
Test deletions without actually deleting data.

### 2. Dependency Checking
Always check before deleting to understand the impact.

### 3. Transaction Safety
All deletions use database transactions with rollback on error.

### 4. Detailed Logging
Every deletion is logged with full details for audit trail.

### 5. Shared Resource Protection
Customized versions used by multiple applications are preserved.

## Migration Notes

### Database Migration Required

To enable database-level cascade constraints, you'll need to create and run a migration. Here's a template:

```python
"""Add cascade deletion constraints

Revision ID: add_cascade_constraints
"""

from alembic import op

def upgrade():
    # Drop and recreate foreign keys with proper cascade rules
    # This is database-specific, adjust for your database
    pass

def downgrade():
    # Revert to previous foreign key constraints
    pass
```

**Important:** The current implementation enforces cascade rules at the application level. Database-level constraints provide an additional layer of protection but require careful migration planning to avoid data loss.

## Troubleshooting

### Issue: "Cannot delete resume with applications"

**Solution:** 
1. Check dependencies: `GET /resumes/{id}/dependencies`
2. Either delete applications first or use force delete
3. Or reassign applications to another resume

### Issue: "Customized version not deleted"

**Cause:** The version is shared by multiple applications

**Solution:** This is expected behavior - the version will be deleted when the last application using it is deleted

### Issue: "Cannot delete original version"

**Cause:** Applications reference this version

**Solution:** Delete or reassign the applications first

## Best Practices

1. **Always check dependencies** before attempting deletion
2. **Use preview endpoints** to understand the impact
3. **Consider reassigning** applications instead of force deleting
4. **Use dry run** to test operations safely
5. **Provide clear UI feedback** to users about what will be deleted

## Summary

This implementation provides:

✅ **Safety**: Comprehensive dependency checking prevents accidental data loss
✅ **Flexibility**: Multiple deletion options for different scenarios  
✅ **Transparency**: Clear feedback about what will be deleted/preserved
✅ **Performance**: Proper database constraints and efficient queries
✅ **Maintainability**: Clean, documented code with clear separation of concerns

The system ensures data integrity while giving users full control over their data management workflow.
