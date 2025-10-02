# Cascade Deletion Quick Reference

## Common Scenarios

### Scenario 1: Delete an Application
```bash
# Check what will be deleted
GET /api/v1/applications/{id}/deletion-preview

# Delete it
DELETE /api/v1/applications/{id}
```
**Result:** Application deleted + customized version deleted (if not shared)

---

### Scenario 2: Delete a Resume (No Applications)
```bash
# Check dependencies
GET /api/v1/resumes/{id}/dependencies
# Returns: can_delete: true

# Delete it
DELETE /api/v1/resumes/{id}
```
**Result:** Resume and all versions deleted

---

### Scenario 3: Delete a Resume (Has Applications)

**Option A: Force Delete Everything**
```bash
DELETE /api/v1/resumes/{id}?force=true
```
**Result:** Resume + All applications + All versions deleted

**Option B: Reassign Then Delete**
```bash
# Move applications to another resume
POST /api/v1/resumes/{id}/reassign
Body: {"target_resume_id": 456}

# Then delete the now-empty resume
DELETE /api/v1/resumes/{id}
```
**Result:** Applications moved to new resume, old resume deleted

**Option C: Delete Applications Manually**
```bash
# Delete each application
DELETE /api/v1/applications/1
DELETE /api/v1/applications/2
DELETE /api/v1/applications/3

# Then delete the resume
DELETE /api/v1/resumes/{id}
```
**Result:** Applications deleted one by one, then resume deleted

---

### Scenario 4: Bulk Delete Applications
```bash
DELETE /api/v1/applications/bulk
Body: {
  "application_ids": [1, 2, 3, 4, 5]
}
```
**Result:** All specified applications deleted + their customized versions

---

### Scenario 5: Safe Testing (Dry Run)
```bash
# Test application deletion without actually deleting
DELETE /api/v1/applications/{id}?dry_run=true

# Test bulk deletion
DELETE /api/v1/applications/bulk
Body: {
  "application_ids": [1, 2, 3],
  "dry_run": true
}
```
**Result:** Returns what WOULD be deleted, but doesn't actually delete

---

## Cascade Rules Cheat Sheet

### What Gets Deleted With Each Action

| Action | Deletes | Preserves |
|--------|---------|-----------|
| Delete Application | • Application<br>• Customized version (if not shared) | • Original resume<br>• Original version<br>• Cover letter |
| Delete Resume (no apps) | • Resume<br>• All versions | N/A |
| Delete Resume (force) | • Resume<br>• All versions<br>• All applications<br>• All customized versions | • Cover letters |
| Delete Version | • The version | • Everything else |
| Reassign Applications | Nothing deleted | Everything (applications moved) |

---

## Error Messages & Solutions

| Error | Meaning | Solution |
|-------|---------|----------|
| "Cannot delete resume. Referenced by X applications" | Resume has dependent applications | 1. Force delete<br>2. Reassign apps<br>3. Delete apps first |
| "Cannot delete version. Referenced by X applications" | Version is used by applications | Delete or reassign those applications |
| "Cannot delete the only version" | You're trying to delete the last version | Delete the entire resume instead |
| "Customized version is used by X applications" | Shared customized version | Expected - will be deleted with last app |

---

## Response Structures

### Application Deletion Response
```json
{
  "message": "Application deleted successfully",
  "details": {
    "application_deleted": true,
    "customized_version_deleted": true,
    "customized_version_id": 123,
    "original_resume_preserved": true,
    "original_version_preserved": true
  },
  "warnings": ["Customized version shared by 2 apps - preserved"]
}
```

### Dependency Check Response
```json
{
  "can_delete": false,
  "application_count": 3,
  "applications": [
    {
      "id": 1,
      "company": "Google",
      "position": "SWE",
      "status": "Applied",
      "has_customized_version": true
    }
  ],
  "options": [
    "delete_applications_and_resume",
    "reassign_applications", 
    "cancel"
  ],
  "message": "Cannot delete resume. Referenced by 3 applications."
}
```

---

## Safety Checklist

Before deleting anything:

- [ ] Check dependencies first
- [ ] Use dry-run to preview
- [ ] Read the warnings
- [ ] Consider reassigning instead
- [ ] Backup if dealing with critical data

---

## Quick Decision Tree

```
Want to delete an application?
├─ Just DELETE it
└─ Done! (customized version auto-deleted)

Want to delete a resume?
├─ Has applications?
│  ├─ YES → Choose:
│  │  ├─ Force delete all (force=true)
│  │  ├─ Reassign applications (POST /reassign)
│  │  └─ Delete applications first
│  └─ NO → Just DELETE it
└─ Done!

Want to delete a version?
├─ Is it the only version?
│  ├─ YES → Delete the entire resume instead
│  └─ NO → Check if applications use it
│     ├─ YES → Can't delete (delete apps first)
│     └─ NO → Just DELETE it
└─ Done!
```

---

## Best Practices

1. **Always check dependencies** before deletion
2. **Use preview endpoints** to understand impact
3. **Test with dry-run** in production
4. **Reassign when possible** to preserve history
5. **Bulk operations** for efficiency
6. **Monitor logs** after deletions

---

## Support Resources

- Full Documentation: `CASCADE_DELETION_README.md`
- Implementation Details: `IMPLEMENTATION_SUMMARY.md`
- API Documentation: Check Swagger/OpenAPI docs
- Code Examples: See README files above
