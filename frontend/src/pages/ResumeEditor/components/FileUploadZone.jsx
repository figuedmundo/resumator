import { useCallback, useState } from 'react';
import clsx from 'clsx';
import { MAX_FILE_SIZE } from '../../../utils/constants';
import styles from './FileUploadZone.module.css';

export default function FileUploadZone({ onFileSelect, accept = '.md,.txt', className = '' }) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [error, setError] = useState(null);

  const validateFile = useCallback((file) => {
    // Validate file size
    if (file.size > MAX_FILE_SIZE.RESUME_MD) {
      return `File size too large. Maximum allowed size is ${Math.round(MAX_FILE_SIZE.RESUME_MD / 1024)}KB`;
    }

    // Validate file type
    const validExtensions = accept.split(',').map(ext => ext.trim());
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!validExtensions.includes(fileExtension)) {
      return `Invalid file type. Please upload a ${validExtensions.join(' or ')} file.`;
    }

    return null;
  }, [accept]);

  const handleFiles = useCallback((files) => {
    const file = files[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setError(null);
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        const title = file.name.replace(/\.[^/.]+$/, ''); // Remove file extension
        
        onFileSelect({
          content,
          title,
          file
        });
      } catch (err) {
        setError('Failed to read file content.');
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read the file.');
    };
    
    reader.readAsText(file);
  }, [validateFile, onFileSelect]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [handleFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleFileInputChange = useCallback((e) => {
    const files = Array.from(e.target.files);
    handleFiles(files);
    // Clear the input so the same file can be selected again
    e.target.value = '';
  }, [handleFiles]);

  return (
    <div className={clsx(styles.container, className)}>
      {/* Hidden file input */}
      <input
        id="file-upload"
        type="file"
        accept={accept}
        onChange={handleFileInputChange}
        className={styles.hiddenInput}
      />
      
      {/* Drag and drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={clsx(
          styles.uploadZone,
          isDragOver ? styles.uploadZoneDragOver : clsx(styles.uploadZoneDefault, "hover:border-gray-400")
        )}
      >
        <div className={styles.uploadContent}>
          <svg 
            className={clsx(
              styles.uploadIcon,
              isDragOver ? styles.uploadIconDragOver : styles.uploadIconDefault
            )} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" 
            />
          </svg>
          
          <div className={styles.uploadText}>
            <label
              htmlFor="file-upload"
              className={clsx(
                styles.uploadLabel,
                isDragOver 
                  ? styles.uploadLabelDragOver 
                  : clsx(styles.uploadLabelDefault, "hover:text-blue-600")
              )}
            >
              {isDragOver ? 'Drop your file here' : 'Click to upload or drag and drop'}
            </label>
          </div>
          
          <p className={styles.uploadHint}>
            {accept.replace(/\./g, '').toUpperCase()} files up to {Math.round(MAX_FILE_SIZE.RESUME_MD / 1024)}KB
          </p>
        </div>
      </div>
      
      {/* Error message */}
      {error && (
        <div className={styles.errorMessage}>
          <p className={styles.errorText}>{error}</p>
        </div>
      )}
    </div>
  );
}
