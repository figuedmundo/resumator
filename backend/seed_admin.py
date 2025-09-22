#!/usr/bin/env python3
"""
Seed script to create an admin user for the Resumator application.

Usage:
    python seed_admin.py
    
Environment variables:
    ADMIN_USERNAME: Admin username (default: admin)
    ADMIN_EMAIL: Admin email (default: admin@test.com)
    ADMIN_PASSWORD: Admin password (default: Admin123!)
    DATABASE_URL: Database connection string
"""

import os
import sys
import asyncio
from pathlib import Path

# Add the app directory to Python path
sys.path.append(str(Path(__file__).parent / "app"))

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from passlib.context import CryptContext

from app.core.database import Base
from app.models.user import User
from app.models.resume import Resume, ResumeVersion
from app.config.settings import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    """Hash a password using bcrypt."""
    return pwd_context.hash(password)


def create_admin_user():
    """Create an admin user with a sample resume."""
    
    # Database setup
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    
    # Create all tables (this will create them if they don't exist)
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    
    try:
        # Get admin credentials from environment or use defaults
        admin_username = os.getenv("ADMIN_USERNAME", "admin")
        admin_email = os.getenv("ADMIN_EMAIL", "admin@test.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "Admin123!")
        
        # Check if admin user already exists
        existing_user = db.query(User).filter(
            (User.username == admin_username) | (User.email == admin_email)
        ).first()
        
        if existing_user:
            print(f"⚠️  User already exists with username '{existing_user.username}' or email '{existing_user.email}'")
            print("Skipping admin user creation.")
            return existing_user
        
        # Create admin user
        print(f"Creating admin user: {admin_username} ({admin_email})")
        admin_user = User(
            username=admin_username,
            email=admin_email,
            hashed_password=hash_password(admin_password),
            is_active=True
        )
        
        db.add(admin_user)
        db.flush()  # Get the user ID without committing
        
        # Create a sample resume for the admin user
        print("Creating sample resume for admin user...")
        sample_resume_content = """---
name: John Admin
contact:
  email: admin@resumator.local
  phone: +1 (555) 123-4567
  location: San Francisco, CA
  linkedin: linkedin.com/in/johnadmin
  github: github.com/johnadmin
---

## SUMMARY

Senior Software Engineer with 8+ years of experience building scalable web applications and leading development teams. Specialized in Python, FastAPI, React, and cloud infrastructure. Passionate about creating efficient, user-centered solutions and mentoring junior developers.

## SKILLS

**Programming Languages:** Python, JavaScript, TypeScript, Go, SQL  
**Frameworks & Libraries:** FastAPI, Django, React, Vue.js, SQLAlchemy  
**Databases:** PostgreSQL, MySQL, Redis, MongoDB  
**Cloud & DevOps:** AWS, Docker, Kubernetes, Terraform, CI/CD  
**Tools:** Git, Jira, Figma, Postman, DataDog  

## EXPERIENCE

### Senior Software Engineer — Tech Innovations Inc (2020-2024)
- Led development of a microservices platform serving 1M+ daily active users
- Reduced API response times by 40% through database optimization and caching strategies  
- Mentored 5 junior developers and established coding standards for the team
- Implemented automated testing pipeline, increasing code coverage from 60% to 95%

### Software Engineer — StartupXYZ (2018-2020)
- Built full-stack web applications using Python/Django and React
- Designed and implemented RESTful APIs serving mobile and web clients
- Collaborated with product managers and designers in agile development cycles
- Optimized database queries reducing page load times by 50%

### Junior Developer — WebSolutions Corp (2016-2018)
- Developed responsive web applications using modern JavaScript frameworks
- Participated in code reviews and contributed to technical documentation
- Fixed critical bugs and implemented new features based on user feedback

## PROJECTS

**Resume Customizer (2024)** - Personal Project  
Built a full-stack application that uses AI to customize resumes for specific job descriptions. Tech stack: FastAPI, React, PostgreSQL, Docker.

**E-commerce Platform (2021)** - Professional Project  
Developed a scalable e-commerce solution handling 10k+ transactions daily. Integrated payment gateways and inventory management systems.

## EDUCATION

**Bachelor of Science in Computer Science**  
University of California, San Francisco (2012-2016)  
Relevant Coursework: Data Structures, Algorithms, Software Engineering, Database Systems
"""
        
        resume = Resume(
            user_id=admin_user.id,
            title="Software Engineer Resume",
            is_default=True
        )
        
        db.add(resume)
        db.flush()  # Get the resume ID
        
        # Create the initial version
        resume_version = ResumeVersion(
            resume_id=resume.id,
            version="v1",
            markdown_content=sample_resume_content,
            is_original=True
        )
        
        db.add(resume_version)
        
        # Commit all changes
        db.commit()
        
        print("✅ Successfully created admin user and sample resume!")
        print(f"📧 Email: {admin_email}")
        print(f"👤 Username: {admin_username}")
        print(f"🔑 Password: {admin_password}")
        print(f"🆔 User ID: {admin_user.id}")
        print(f"📄 Resume ID: {resume.id}")
        print("\n🚀 You can now log in to the application!")
        
        return admin_user
        
    except Exception as e:
        print(f"❌ Error creating admin user: {e}")
        db.rollback()
        raise
    finally:
        db.close()


def create_sample_users():
    """Create additional sample users for testing."""
    engine = create_engine(settings.database_url)
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        sample_users = [
            {
                "username": "jane_doe",
                "email": "jane@test.com",
                "password": "Password123"
            },
            {
                "username": "bob_smith",
                "email": "bob@test.com", 
                "password": "Password123"
            }
        ]
        
        for user_data in sample_users:
            existing = db.query(User).filter(
                (User.username == user_data["username"]) | 
                (User.email == user_data["email"])
            ).first()
            
            if not existing:
                user = User(
                    username=user_data["username"],
                    email=user_data["email"],
                    hashed_password=hash_password(user_data["password"]),
                    is_active=True
                )
                db.add(user)
                print(f"✅ Created sample user: {user_data['username']}")
        
        db.commit()
        print("✅ Sample users created successfully!")
        
    except Exception as e:
        print(f"❌ Error creating sample users: {e}")
        db.rollback()
    finally:
        db.close()


def main():
    """Main function to run the seeding process."""
    print("🌱 Starting Resumator database seeding...")
    print(f"🔗 Connecting to: {settings.database_url}")
    
    try:
        # Create admin user
        create_admin_user()
        
        # Create sample users (optional)
        create_sample_users()
        
        print("\n🎉 Database seeding completed successfully!")
        print("\nNext steps:")
        print("1. Start the application: docker-compose up")
        print("2. Open http://localhost:3000")
        print("3. Log in with the admin credentials above")
        
    except Exception as e:
        print(f"💥 Seeding failed: {e}")
        sys.exit(1)


if __name__ == "__main__":
    main()
