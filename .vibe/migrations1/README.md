# Database Migrations

The `migrations/` folder is used for **database schema versioning and migration management**. This is where you would typically use **Alembic** (SQLAlchemy's migration tool) to track and apply database schema changes.

## What should be in this folder?

### Current State (Empty)
Right now, your project uses the `init.sql` script for initial database setup, which works for development but isn't ideal for production or schema evolution.

### Recommended Setup (Using Alembic)

1. **Initialize Alembic** (run once):
```bash
cd backend
pip install alembic
alembic init migrations
```

2. **Configure Alembic** by editing `alembic.ini`:
```ini
sqlalchemy.url = postgresql://resumator:password@localhost:5432/resumator
```

3. **Folder Structure after initialization**:
```
migrations/
├── alembic.ini          # Alembic configuration
├── env.py               # Alembic environment script
├── script.py.mako       # Migration template
└── versions/            # Migration files (auto-generated)
    ├── 001_initial_tables.py
    ├── 002_add_user_roles.py
    ├── 003_add_resume_templates.py
    └── ...
```

## How to use migrations

### 1. Generate a new migration
When you modify your SQLAlchemy models, generate a migration:
```bash
alembic revision --autogenerate -m "Add user roles table"
```

### 2. Apply migrations
```bash
alembic upgrade head  # Apply all pending migrations
```

### 3. View migration history
```bash
alembic history        # Show all migrations
alembic current        # Show current migration version
```

## Integration with your current setup

### Option 1: Keep using init.sql (Simple)
- Good for: Development, simple deployments
- Continue using your `init.sql` script
- Manually manage schema changes

### Option 2: Migrate to Alembic (Recommended for Production)
- Good for: Production, team collaboration, schema evolution
- Replace `init.sql` with proper migrations
- Better tracking of database changes

## Sample Migration Files

Here's what would be inside the `versions/` folder:

### 001_initial_tables.py
```python
"""Initial database tables

Revision ID: 001
Create Date: 2024-01-15 10:30:00.123456
"""
from alembic import op
import sqlalchemy as sa

revision = '001'
down_revision = None
branch_labels = None
depends_on = None

def upgrade():
    # Create users table
    op.create_table('users',
        sa.Column('id', sa.Integer(), primary_key=True),
        sa.Column('username', sa.String(255), nullable=False, unique=True),
        sa.Column('email', sa.String(255), nullable=False, unique=True),
        sa.Column('hashed_password', sa.String(255), nullable=False),
        sa.Column('is_active', sa.Boolean(), default=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'))
    )
    
    # Create indexes
    op.create_index('idx_users_email', 'users', ['email'])
    op.create_index('idx_users_username', 'users', ['username'])

def downgrade():
    op.drop_table('users')
```

## Current Recommendation

For now, **keep your current `init.sql` approach** since:
1. Your project is in development phase
2. Schema is relatively stable
3. It's simpler to manage

**Consider migrating to Alembic when:**
- You deploy to production
- Multiple developers work on the project
- You need to track schema changes over time
- You have existing data that needs to be preserved during schema updates
