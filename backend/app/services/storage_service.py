"""Storage service for file operations (local and S3-compatible)."""

import os
import logging
from typing import Optional, Union
from pathlib import Path
from abc import ABC, abstractmethod
from app.config import settings
from app.core.exceptions import StorageError


logger = logging.getLogger(__name__)


class StorageService(ABC):
    """Abstract base class for storage services."""
    
    @abstractmethod
    def save(self, path: str, data: Union[bytes, str]) -> str:
        """Store data and return accessible path or URL."""
        pass
    
    @abstractmethod
    def get(self, path: str) -> bytes:
        """Return stored bytes."""
        pass
    
    @abstractmethod
    def delete(self, path: str) -> bool:
        """Delete a file."""
        pass
    
    @abstractmethod
    def exists(self, path: str) -> bool:
        """Check if file exists."""
        pass


class LocalStorageService(StorageService):
    """Local filesystem storage implementation."""
    
    def __init__(self, base_path: str = None):
        """Initialize with base storage path."""
        self.base_path = Path(base_path or settings.storage_path)
        self.base_path.mkdir(parents=True, exist_ok=True)
    
    def save(self, path: str, data: Union[bytes, str]) -> str:
        """Store data and return file path."""
        try:
            file_path = self.base_path / path
            file_path.parent.mkdir(parents=True, exist_ok=True)
            
            if isinstance(data, str):
                file_path.write_text(data, encoding='utf-8')
            else:
                file_path.write_bytes(data)
            
            return str(file_path)
        except Exception as e:
            logger.error(f"Failed to save file {path}: {e}")
            raise StorageError(f"Failed to save file: {str(e)}")
    
    def get(self, path: str) -> bytes:
        """Return stored bytes."""
        try:
            file_path = self.base_path / path
            if not file_path.exists():
                raise StorageError(f"File not found: {path}")
            return file_path.read_bytes()
        except Exception as e:
            logger.error(f"Failed to get file {path}: {e}")
            raise StorageError(f"Failed to retrieve file: {str(e)}")
    
    def delete(self, path: str) -> bool:
        """Delete a file."""
        try:
            file_path = self.base_path / path
            if file_path.exists():
                file_path.unlink()
                return True
            return False
        except Exception as e:
            logger.error(f"Failed to delete file {path}: {e}")
            return False
    
    def exists(self, path: str) -> bool:
        """Check if file exists."""
        try:
            file_path = self.base_path / path
            return file_path.exists()
        except Exception:
            return False


class MinIOStorageService(StorageService):
    """MinIO/S3-compatible storage implementation."""
    
    def __init__(self):
        """Initialize MinIO client."""
        try:
            from minio import Minio
            
            if not all([settings.minio_endpoint, settings.minio_access_key, settings.minio_secret_key]):
                raise StorageError("MinIO credentials not configured")
            
            self.client = Minio(
                settings.minio_endpoint,
                access_key=settings.minio_access_key,
                secret_key=settings.minio_secret_key,
                secure=settings.minio_endpoint.startswith('https://')
            )
            self.bucket = settings.minio_bucket
            
            # Ensure bucket exists
            if not self.client.bucket_exists(self.bucket):
                self.client.make_bucket(self.bucket)
                
        except ImportError:
            raise StorageError("minio package not installed. Install with: pip install minio")
        except Exception as e:
            logger.error(f"Failed to initialize MinIO client: {e}")
            raise StorageError(f"MinIO initialization failed: {str(e)}")
    
    def save(self, path: str, data: Union[bytes, str]) -> str:
        """Store data and return object path."""
        try:
            from io import BytesIO
            
            if isinstance(data, str):
                data = data.encode('utf-8')
            
            data_stream = BytesIO(data)
            
            self.client.put_object(
                self.bucket,
                path,
                data_stream,
                length=len(data),
                content_type=self._get_content_type(path)
            )
            
            return f"s3://{self.bucket}/{path}"
        except Exception as e:
            logger.error(f"Failed to save file {path} to MinIO: {e}")
            raise StorageError(f"Failed to save file to MinIO: {str(e)}")
    
    def get(self, path: str) -> bytes:
        """Return stored bytes."""
        try:
            response = self.client.get_object(self.bucket, path)
            data = response.read()
            response.close()
            response.release_conn()
            return data
        except Exception as e:
            logger.error(f"Failed to get file {path} from MinIO: {e}")
            raise StorageError(f"Failed to retrieve file from MinIO: {str(e)}")
    
    def delete(self, path: str) -> bool:
        """Delete a file."""
        try:
            self.client.remove_object(self.bucket, path)
            return True
        except Exception as e:
            logger.error(f"Failed to delete file {path} from MinIO: {e}")
            return False
    
    def exists(self, path: str) -> bool:
        """Check if file exists."""
        try:
            self.client.stat_object(self.bucket, path)
            return True
        except Exception:
            return False
    
    def _get_content_type(self, path: str) -> str:
        """Get content type based on file extension."""
        extension = Path(path).suffix.lower()
        content_types = {
            '.pdf': 'application/pdf',
            '.md': 'text/markdown',
            '.txt': 'text/plain',
            '.json': 'application/json',
            '.html': 'text/html',
            '.css': 'text/css',
        }
        return content_types.get(extension, 'application/octet-stream')


def get_storage_service() -> StorageService:
    """Factory function to get the configured storage service."""
    if settings.storage_type.lower() == 's3' or settings.storage_type.lower() == 'minio':
        return MinIOStorageService()
    else:
        return LocalStorageService()

