import pytest
from unittest.mock import MagicMock, patch
from app.services.cover_letter_service import CoverLetterService
from app.models.cover_letter import CoverLetter, CoverLetterVersion
from app.core.exceptions import CoverLetterNotFoundError

@pytest.fixture
def db_session_mock():
    return MagicMock()

@pytest.fixture
def storage_service_mock():
    return MagicMock()

def test_create_cover_letter(db_session_mock, storage_service_mock):
    # Arrange
    service = CoverLetterService(db=db_session_mock, storage_service=storage_service_mock)
    user_id = 1
    title = "Test Cover Letter"
    content = "Test content"
    
    # Mock the get_cover_letter to return a value to prevent not found error
    service.get_cover_letter = MagicMock()

    # Act
    cover_letter = service.create_cover_letter(user_id, title, content)

    # Assert
    db_session_mock.add.assert_called()
    db_session_mock.commit.assert_called()
    db_session_mock.refresh.assert_called()

    assert isinstance(cover_letter, CoverLetter)
    assert cover_letter.title == title
    assert cover_letter.user_id == user_id

def test_get_cover_letter_found(db_session_mock, storage_service_mock):
    # Arrange
    service = CoverLetterService(db=db_session_mock, storage_service=storage_service_mock)
    user_id = 1
    cover_letter_id = 1
    expected_cover_letter = CoverLetter(id=cover_letter_id, user_id=user_id, title="Test")
    
    db_session_mock.query.return_value.filter.return_value.first.return_value = expected_cover_letter

    # Act
    result = service.get_cover_letter(user_id, cover_letter_id)

    # Assert
    assert result == expected_cover_letter

def test_get_cover_letter_not_found(db_session_mock, storage_service_mock):
    # Arrange
    service = CoverLetterService(db=db_session_mock, storage_service=storage_service_mock)
    user_id = 1
    cover_letter_id = 1
    
    db_session_mock.query.return_value.filter.return_value.first.return_value = None

    # Act & Assert
    with pytest.raises(CoverLetterNotFoundError):
        service.get_cover_letter(user_id, cover_letter_id)

def test_list_user_cover_letters(db_session_mock, storage_service_mock):
    # Arrange
    service = CoverLetterService(db=db_session_mock, storage_service=storage_service_mock)
    user_id = 1
    cover_letters = [
        (CoverLetter(id=1, user_id=user_id, title="Test 1"), "v1"),
        (CoverLetter(id=2, user_id=user_id, title="Test 2"), "v1"),
    ]
    db_session_mock.query.return_value.outerjoin.return_value.filter.return_value.order_by.return_value.all.return_value = cover_letters

    # Act
    result = service.list_user_cover_letters(user_id)

    # Assert
    assert len(result) == 2
    assert result[0].title == "Test 1"

def test_update_cover_letter(db_session_mock, storage_service_mock):
    # Arrange
    service = CoverLetterService(db=db_session_mock, storage_service=storage_service_mock)
    user_id = 1
    cover_letter_id = 1
    title = "Updated Title"
    cover_letter = CoverLetter(id=cover_letter_id, user_id=user_id, title="Old Title")
    
    # Mock get_cover_letter to return the cover_letter
    service.get_cover_letter = MagicMock(return_value=cover_letter)

    # Act
    result = service.update_cover_letter(user_id, cover_letter_id, title=title)

    # Assert
    db_session_mock.commit.assert_called()
    db_session_mock.refresh.assert_called_with(cover_letter)
    assert result.title == title
