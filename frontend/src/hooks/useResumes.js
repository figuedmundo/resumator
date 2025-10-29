import { useState, useEffect, useCallback } from 'react';
import apiService from '../services/api';

export const useResumes = () => {
  const [resumes, setResumes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [successMessage, setSuccessMessage] = useState(null);

  const loadResumes = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await apiService.getResumes();
      setResumes(response.resumes || response || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadResumes();
  }, [loadResumes]);

  const handleDeleteClick = (resume) => {
    setDeleteConfirm(resume);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm) return;

    try {
      setIsDeleting(true);
      await apiService.deleteResume(deleteConfirm.id);
      setResumes((prevResumes) => prevResumes.filter((r) => r.id !== deleteConfirm.id));
      setSuccessMessage(`Resume "${deleteConfirm.title}" deleted successfully`);
      setTimeout(() => setSuccessMessage(null), 3000);
      setDeleteConfirm(null);
    } catch (err) {
      setError(err.message || 'Failed to delete resume');
      setDeleteConfirm(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    state: {
      resumes,
      isLoading,
      error,
      deleteConfirm,
      isDeleting,
      successMessage,
    },
    handlers: {
      loadResumes,
      handleDeleteClick,
      handleDeleteConfirm,
      setDeleteConfirm,
    },
  };
};
