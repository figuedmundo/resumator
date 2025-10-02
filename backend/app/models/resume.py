"""Resume and ResumeVersion models with proper cascade deletion constraints."""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Resume(Base):
    """Resume model for storing user resumes.
    
    Cascade Deletion Rules:
    - Versions are cascade deleted when resume is deleted
    - Applications BLOCK resume deletion (RESTRICT)
    - Users can check dependencies before deletion
    """
    
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    
    # Versions cascade delete with resume
    versions = relationship(
        "ResumeVersion", 
        back_populates="resume", 
        cascade="all, delete-orphan",
        passive_deletes=False  # Application logic handles it
    )
    
    # Applications RESTRICT deletion - must be handled manually
    applications = relationship(
        "Application", 
        back_populates="resume",
        passive_deletes=False  # We handle this in application logic
    )
    
    def __repr__(self):
        return f"<Resume(id={self.id}, title='{self.title}', user_id={self.user_id})>"


class ResumeVersion(Base):
    """Resume version model for storing different versions of resumes.
    
    Cascade Deletion Rules:
    - Original versions (is_original=True) are protected when applications reference them
    - Customized versions (is_original=False) can be cascade deleted with applications
    - Application logic enforces these rules
    """
    
    __tablename__ = "resume_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(
        Integer, 
        ForeignKey("resumes.id", ondelete="CASCADE"), 
        nullable=False,
        comment="Parent resume - cascade delete versions"
    )
    version = Column(String, nullable=False, index=True)  # e.g., "v1", "v1.1", "v2 - Company Name"
    markdown_content = Column(Text, nullable=False)
    job_description = Column(Text)  # JD used for customization, if any
    is_original = Column(Boolean, default=False, index=True)  # True for master resume versions
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    resume = relationship("Resume", back_populates="versions")
    
    # Applications that use this as their original version (protected)
    applications = relationship(
        "Application",
        foreign_keys="Application.resume_version_id",
        back_populates="resume_version",
        passive_deletes=False  # Application logic enforces restriction
    )
    
    def __repr__(self):
        return f"<ResumeVersion(id={self.id}, version='{self.version}', resume_id={self.resume_id}, is_original={self.is_original})>"
