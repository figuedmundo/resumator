"""Resume and ResumeVersion models."""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Resume(Base):
    """Resume model for storing user resumes."""
    
    __tablename__ = "resumes"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    is_default = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="resumes")
    versions = relationship("ResumeVersion", back_populates="resume", cascade="all, delete-orphan")
    applications = relationship("Application", back_populates="resume")
    
    def __repr__(self):
        return f"<Resume(id={self.id}, title='{self.title}', user_id={self.user_id})>"


class ResumeVersion(Base):
    """Resume version model for storing different versions of resumes."""
    
    __tablename__ = "resume_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    version = Column(String, nullable=False)  # e.g., "v1", "v1.1", "v2"
    markdown_content = Column(Text, nullable=False)
    job_description = Column(Text)  # JD used for customization, if any
    is_original = Column(Boolean, default=False)  # True for master resume
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    resume = relationship("Resume", back_populates="versions")
    applications = relationship("Application", back_populates="resume_version")
    
    def __repr__(self):
        return f"<ResumeVersion(id={self.id}, version='{self.version}', resume_id={self.resume_id})>"
