"""Application model for job application tracking with proper cascade deletion."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    """Application model for tracking job applications with resume and cover letter versioning.
    
    Cascade Deletion Rules:
    ========================
    RESUME REFERENCES (Original versions - PROTECT from deletion):
    - When application is deleted: original resume and resume_version are preserved
    - When resume is deleted: applications block deletion (RESTRICT)
    - When resume_version is deleted: applications block deletion (RESTRICT)
    
    CUSTOMIZED RESUME VERSIONS:
    - When application is deleted: customized_resume_version is CASCADE deleted
    - This cleans up generated versions created for this specific application
    
    COVER LETTER REFERENCES (Original versions - PROTECT from deletion):
    - When application is deleted: cover_letter and cover_letter_version are preserved
    - When cover letter is deleted: applications block deletion (RESTRICT)
    - When cover_letter_version is deleted: applications block deletion (RESTRICT)
    
    CUSTOMIZED COVER LETTER VERSIONS:
    - When application is deleted: customized_cover_letter_version can be CASCADE deleted
    - This cleans up company-specific versions created for this application
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
    
    # Cover letter references - new fields for versioning support
    cover_letter_id = Column(
        Integer,
        ForeignKey("cover_letters.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
        comment="Cover letter master record - preserved on deletion (SET NULL)"
    )
    
    cover_letter_version_id = Column(
        Integer,
        ForeignKey("cover_letter_versions.id", ondelete="RESTRICT"),
        nullable=True,
        index=True,
        comment="Specific version of cover letter used for this application - protected from deletion"
    )
    
    customized_cover_letter_version_id = Column(
        Integer,
        ForeignKey("cover_letter_versions.id", ondelete="CASCADE"),
        nullable=True,
        comment="Customized cover letter version for this application - deleted with application"
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
    cover_letter = relationship(
        "CoverLetter",
        back_populates="applications",
        foreign_keys=[cover_letter_id],
        passive_deletes=True
    )
    cover_letter_version = relationship(
        "CoverLetterVersion",
        back_populates="applications",
        foreign_keys=[cover_letter_version_id],
        passive_deletes=False
    )
    customized_cover_letter_version = relationship(
        "CoverLetterVersion",
        foreign_keys=[customized_cover_letter_version_id],
        passive_deletes=True
    )
    
    def __repr__(self):
        return f"<Application(id={self.id}, company='{self.company}', position='{self.position}')>"
