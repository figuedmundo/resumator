"""Application model for job application tracking."""

from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base


class Application(Base):
    """Application model for tracking job applications."""
    
    __tablename__ = "applications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    resume_id = Column(Integer, ForeignKey("resumes.id"), nullable=False)
    resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=False)
    cover_letter_id = Column(Integer, ForeignKey("cover_letters.id"), nullable=True)
    
    # Enhanced application fields
    customized_resume_version_id = Column(Integer, ForeignKey("resume_versions.id"), nullable=True)
    additional_instructions = Column(Text)
    
    # Job details
    company = Column(String, nullable=False)
    position = Column(String, nullable=False)
    job_description = Column(Text)
    
    # Application status
    status = Column(String, default="Applied")  # Applied, Interviewing, Rejected, Offer
    applied_date = Column(Date)
    
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
        foreign_keys=[customized_resume_version_id]
    )
    cover_letter = relationship("CoverLetter", back_populates="applications")
    
    def __repr__(self):
        return f"<Application(id={self.id}, company='{self.company}', position='{self.position}')>"


class CoverLetter(Base):
    """Cover letter model for storing generated cover letters."""
    
    __tablename__ = "cover_letters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    title = Column(String, nullable=False)
    content = Column(Text, nullable=False)
    template_used = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User")
    applications = relationship("Application", back_populates="cover_letter")
    
    def __repr__(self):
        return f"<CoverLetter(id={self.id}, title='{self.title}')>"
