"""Cover Letter and CoverLetterVersion models matching Resume pattern."""

from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base

class CoverLetterTemplate(Base):
    """Cover letter template model for storing reusable templates.
    
    Cascade Deletion Rules:
    - When template is deleted: no impact on cover_letters (templates are just references)
    - Templates are standalone system for bootstrapping new cover letters
    """
    
    __tablename__ = "cover_letter_templates"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, index=True)
    description = Column(Text)
    content_template = Column(
        Text, 
        nullable=False,
        comment="Template content with placeholders like {position}, {company}, etc."
    )
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    def __repr__(self):
        return f"<CoverLetterTemplate(id={self.id}, name='{self.name}')>"


class CoverLetter(Base):
    """Master cover letter record for storing user cover letters.
    
    Similar to Resume model - can have multiple versions for different purposes
    (original master versions or company-specific customizations).
    
    Cascade Deletion Rules:
    - Versions are cascade deleted when cover letter is deleted
    - Applications BLOCK cover letter deletion (RESTRICT)
    - Users can check dependencies before deletion
    """
    
    __tablename__ = "cover_letters"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(
        Integer, 
        ForeignKey("users.id", ondelete="CASCADE"), 
        nullable=False,
        index=True,
        comment="User who owns this cover letter"
    )
    title = Column(String(255), nullable=False)
    is_default = Column(Boolean, default=False, index=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="cover_letters")
    
    # Versions cascade delete with cover letter
    versions = relationship(
        "CoverLetterVersion", 
        back_populates="cover_letter", 
        cascade="all, delete-orphan",
        passive_deletes=False
    )
    
    # Applications RESTRICT deletion - must be handled manually
    applications = relationship(
        "Application", 
        back_populates="cover_letter",
        passive_deletes=False
    )
    
    def __repr__(self):
        return f"<CoverLetter(id={self.id}, title='{self.title}', user_id={self.user_id})>"


class CoverLetterVersion(Base):
    """Cover letter version model for storing different versions of cover letters.
    
    Similar to ResumeVersion - stores both original master versions and 
    company-specific customizations.
    
    Cascade Deletion Rules:
    - Original versions (is_original=True) are protected when applications reference them
    - Customized versions (is_original=False) can be managed separately
    - Application logic enforces these rules
    """
    
    __tablename__ = "cover_letter_versions"
    
    id = Column(Integer, primary_key=True, index=True)
    cover_letter_id = Column(
        Integer, 
        ForeignKey("cover_letters.id", ondelete="CASCADE"), 
        nullable=False,
        comment="Parent cover letter - cascade delete versions"
    )
    version = Column(String(50), nullable=False, index=True)  # e.g., "v1", "v1.1", "v2 - Company Name"
    markdown_content = Column(Text, nullable=False)
    job_description = Column(Text)  # JD used for customization, if any
    is_original = Column(Boolean, default=False, index=True)  # True for master cover letter versions
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships
    cover_letter = relationship("CoverLetter", back_populates="versions")
    
    # Applications that use this as their cover letter (protected)
    applications = relationship(
        "Application",
        foreign_keys="Application.cover_letter_version_id",
        back_populates="cover_letter_version",
        passive_deletes=False
    )
    
    def __repr__(self):
        return f"<CoverLetterVersion(id={self.id}, version='{self.version}', cover_letter_id={self.cover_letter_id}, is_original={self.is_original})>"


#test for AI to check that I update the file but not shown in git status