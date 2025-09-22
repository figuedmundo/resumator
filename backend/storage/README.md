# Storage Folder

The `storage/` folder is used for **file storage** in your Resumator application. This is where generated PDFs, uploaded files, and other user data will be stored.

## What should be in this folder?

### Current State (Empty)
The folder is empty because no files have been generated or uploaded yet.

### Recommended Folder Structure

Once your application starts running, the storage folder should be organized like this:

```
storage/
├── users/                           # User-specific data
│   ├── 1/                          # User ID 1
│   │   ├── resumes/                # Resume files
│   │   │   ├── 1/                  # Resume ID 1
│   │   │   │   ├── versions/       # Different versions
│   │   │   │   │   ├── v1.md      # Original markdown
│   │   │   │   │   ├── v1.1.md    # Customized version
│   │   │   │   │   └── v2.md      # Major revision
│   │   │   │   ├── pdfs/          # Generated PDFs
│   │   │   │   │   ├── v1_modern.pdf
│   │   │   │   │   ├── v1.1_classic.pdf
│   │   │   │   │   └── v2_minimal.pdf
│   │   │   │   └── metadata.json   # Resume metadata
│   │   │   └── 2/                  # Resume ID 2
│   │   ├── cover_letters/          # Cover letters
│   │   │   ├── 1.txt              # Cover letter ID 1
│   │   │   └── 2.txt              # Cover letter ID 2
│   │   └── applications/           # Application-related files
│   │       ├── 1/                 # Application ID 1
│   │       │   ├── resume.pdf     # Resume used
│   │       │   ├── cover_letter.txt
│   │       │   └── job_description.txt
│   │       └── 2/                 # Application ID 2
│   ├── 2/                          # User ID 2
│   └── ...
├── templates/                       # PDF templates and assets
│   ├── modern/
│   │   ├── style.css
│   │   └── template.html
│   ├── classic/
│   │   ├── style.css
│   │   └── template.html
│   └── minimal/
│       ├── style.css
│       └── template.html
├── temp/                           # Temporary files
│   ├── pdf_generation/            # Temp files during PDF creation
│   └── uploads/                   # Temp uploads before processing
└── logs/                          # Application logs (optional)
    ├── storage_access.log
    └── file_operations.log
```

## How files are managed

### 1. Storage Service
Your `StorageService` class handles all file operations:

```python
# Example usage
storage_service = StorageService()

# Save a PDF
pdf_path = storage_service.save(
    path="users/1/resumes/1/pdfs/v1_modern.pdf",
    bytes_data=pdf_bytes
)

# Retrieve a file
pdf_bytes = storage_service.get(
    path="users/1/resumes/1/pdfs/v1_modern.pdf"
)
```

### 2. File Naming Convention

**Resume Files:**
- Original: `users/{user_id}/resumes/{resume_id}/versions/v1.md`
- Customized: `users/{user_id}/resumes/{resume_id}/versions/v1.1.md`
- Major revision: `users/{user_id}/resumes/{resume_id}/versions/v2.md`

**PDF Files:**
- Format: `users/{user_id}/resumes/{resume_id}/pdfs/{version}_{template}.pdf`
- Examples: `v1_modern.pdf`, `v1.1_classic.pdf`, `v2_minimal.pdf`

**Cover Letters:**
- Format: `users/{user_id}/cover_letters/{cover_letter_id}.txt`

### 3. Docker Volume Mapping

In your `docker-compose.yml`, the storage folder is mapped as a volume:

```yaml
volumes:
  - storage_data:/app/storage  # Persistent storage
```

This ensures your files persist even when containers are recreated.

## Security Considerations

### 1. File Access Control
- Files are organized by user ID
- API endpoints should verify user ownership before serving files
- No direct file system access from the web

### 2. File Size Limits
- Implement maximum file sizes for uploads
- Monitor disk usage
- Clean up temporary files regularly

### 3. Backup Strategy
- Regular backups of the storage volume
- Consider cloud storage (S3/MinIO) for production

## Storage Configuration

Your storage behavior is controlled by environment variables:

```bash
# Local file system (default)
STORAGE_TYPE=local
STORAGE_PATH=/app/storage

# Or S3-compatible (MinIO/AWS)
STORAGE_TYPE=s3
MINIO_ENDPOINT=minio:9000
MINIO_ACCESS_KEY=minioadmin
MINIO_SECRET_KEY=minioadmin
MINIO_BUCKET=resumator
```

## Troubleshooting

### Empty Storage Folder
This is normal if:
- Application hasn't generated any files yet
- No users have uploaded resumes
- PDF generation hasn't been triggered

### Permission Issues
If you see permission errors:

```bash
# Fix ownership (on host system)
sudo chown -R 1000:1000 storage/

# Or in Docker
docker exec -it resumator-backend-1 chown -r app:app /app/storage
```

### Disk Space
Monitor storage usage:

```bash
# Check storage size
du -sh storage/

# Find largest files
find storage/ -type f -exec ls -lh {} \; | sort -k5 -hr | head -10
```

## Next Steps

1. **Test File Operations**: Upload a resume and generate a PDF to see files appear
2. **Monitor Growth**: Set up alerts for disk usage
3. **Backup Strategy**: Implement regular backups for production
4. **Cloud Migration**: Consider moving to S3/MinIO for scalability
