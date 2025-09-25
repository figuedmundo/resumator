import { useState } from 'react';
import apiService from '../../services/secureApi';
import { devLog, getErrorMessage } from '../../utils/helpers';

/**
 * Custom hook for managing application operations
 */
export function useApplications() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const updateApplicationStatus = async (applicationId, newStatus, onSuccess) => {
    setError('');
    setLoading(true);

    try {
      await apiService.updateApplication(applicationId, { status: newStatus });
      
      if (onSuccess) {
        onSuccess(applicationId, newStatus);
      }
      
      devLog(`Application ${applicationId} status updated to ${newStatus}`);
      return true;
    } catch (err) {
      console.error('Failed to update status:', err);
      const errorMessage = getErrorMessage(err) || 'Failed to update status';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteApplication = async (applicationId, onSuccess) => {
    setError('');
    setLoading(true);

    try {
      await apiService.deleteApplication(applicationId);
      
      if (onSuccess) {
        onSuccess(applicationId);
      }
      
      devLog(`Application ${applicationId} deleted`);
      return true;
    } catch (err) {
      console.error('Failed to delete application:', err);
      const errorMessage = getErrorMessage(err) || 'Failed to delete application';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError('');

  return {
    loading,
    error,
    updateApplicationStatus,
    deleteApplication,
    clearError,
  };
}
