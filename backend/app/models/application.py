"""Application model for job application tracking with proper cascade deletion."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

# Import CoverLetter for type hints and relationships
# Note: Actual import happens at runtime to avoid circular imports
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from app.models.cover_letter import CoverLetter


class Application(Base):
    """Application model for tracking job applications.
    
    Cascade Deletion Rules:
    - When application is deleted: customized_resume_version is deleted (if exists)
    - When application is deleted: original resume and resume_version are preserved
    - When resume is deleted: applications are blocked if they exist
    - When resume_version is deleted: applications are blocked if they reference it
    """
    
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    
    # Resume references - these prevent resume/version deletion if applications exist
    resume_id = Column(
        Integer, 
        ForeignKey("resumes.id", ondelete="RESTRICT"), 
        nullable=False,
        comment="Original resume - protected from deletion"
    )
    resume_version_id = Column(
        Integer, 
        ForeignKey("resume_versions.id", ondelete="RESTRICT"), 
        nullable=False,
        comment="Original resume version - protected from deletion"
    )
    
    # Optional customized version - deleted when application is deleted
    customized_resume_version_id = Column(
        Integer, 
        ForeignKey("resume_versions.id", ondelete="CASCADE"), 
        nullable=True,
        comment="Customized version - deleted with application"
    )
    
    # Optional cover letter reference
    cover_letter_id = Column(
        Integer, 
        ForeignKey("cover_letters.id", ondelete="SET NULL"), 
        nullable=True
    )
    
    # Enhanced application fields
    additional_instructions = Column(Text)
    
    # Job details
    company = Column(String, nullable=False, index=True)
    position = Column(String, nullable=False)
    job_description = Column(Text)
    
    # Application status
    status = Column(String, default="Applied", index=True)  # Applied, Interviewing, Rejected, Offer, Withdrawn
    applied_date = Column(Date, index=True)
    
    # Metadata
    notes = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="applications")
    resume = relationship("Resume", back_populates="applications")
    resume_version = relationship(
        "ResumeVersion",
        foreign_keys=[resume_version_id],
        back_populates="applications"
    )
    customized_resume_version = relationship(
        "ResumeVersion",
        foreign_keys=[customized_resume_version_id],
        passive_deletes=True  # Allow database to handle cascade
    )
    cover_letter = relationship("CoverLetter", back_populates="applications")
    
    def __repr__(self):
        return f"<Application(id={self.id}, company='{self.company}', position='{self.position}')>"


# CoverLetter model has been moved to app/models/cover_letter.py
# This maintains backwards compatibility for imports
