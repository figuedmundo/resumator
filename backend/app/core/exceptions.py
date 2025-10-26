"""Custom exceptions for the application."""

from fastapi import HTTPException, status


class ResumeNotFoundError(HTTPException):
    """Raised when a resume is not found."""
    def __init__(self, resume_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Resume with ID {resume_id} not found"
        )


class ApplicationNotFoundError(HTTPException):
    """Raised when an application is not found."""
    def __init__(self, application_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with ID {application_id} not found"
        )


class CoverLetterNotFoundError(HTTPException):
    """Raised when a cover letter is not found."""
    def __init__(self, cover_letter_id: int):
        super().__init__(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Cover letter with ID {cover_letter_id} not found"
        )



class UnauthorizedError(HTTPException):
    """Raised when user is not authorized to access a resource."""
    def __init__(self, detail: str = "Not authorized to access this resource"):
        super().__init__(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=detail
        )


class ValidationError(HTTPException):
    """Raised when input validation fails."""
    def __init__(self, detail: str):
        super().__init__(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=detail
        )


class AIServiceError(HTTPException):
    """Raised when AI service fails."""
    def __init__(self, detail: str = "AI service temporarily unavailable"):
        super().__init__(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=detail
        )


class StorageError(HTTPException):
    """Raised when storage operation fails."""
    def __init__(self, detail: str = "Storage operation failed"):
        super().__init__(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=detail
        )


class RateLimitError(HTTPException):
    """Raised when rate limit is exceeded."""
    def __init__(self, detail: str = "Rate limit exceeded"):
        super().__init__(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=detail
        )
