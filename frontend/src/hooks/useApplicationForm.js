import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import apiService from '@/services/api';
import { APPLICATION_STATUS } from '@/utils/constants';
import { devLog } from '@/utils/helpers';

export const useApplicationForm = (applicationId = null, onSuccess) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  const [formData, setFormData] = useState({
    company: '',
    position: '',
    job_description: '',
    resume_id: '',
    resume_version_id: '',
    status: APPLICATION_STATUS.APPLIED,
    applied_date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  useEffect(() => {
    if (applicationId) {
      loadApplication();
    } else {
      // Check for pre-filled data from resume customization
      const savedData = sessionStorage.getItem('applicationFormData');
      if (savedData) {
        try {
          const data = JSON.parse(savedData);
          setFormData(prev => ({
            ...prev,
            resume_id: data.resume_id || '',
            job_description: data.job_description || ''
          }));
          // Clear the saved data
          sessionStorage.removeItem('applicationFormData');
        } catch (error) {
          console.error('Failed to parse saved form data:', error);
        }
      }
    }
  }, [applicationId]);

  const loadApplication = async () => {
    setLoading(true);
    try {
      const application = await apiService.getApplication(applicationId);
      setFormData({
        company: application.company || '',
        position: application.position || '',
        job_description: application.job_description || '',
        resume_id: application.resume_id || '',
        resume_version_id: application.resume_version_id || '',
        status: application.status || APPLICATION_STATUS.APPLIED,
        applied_date: application.applied_date || new Date().toISOString().split('T')[0],
        notes: application.notes || ''
      });
    } catch (error) {
      console.error('Failed to load application:', error);
      setErrors({ general: 'Failed to load application' });
    } finally {
      setLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.company.trim()) {
      newErrors.company = 'Company is required';
    }

    if (!formData.position.trim()) {
      newErrors.position = 'Position is required';
    }

    if (!formData.resume_id) {
      newErrors.resume_id = 'Please select a resume';
    }

    if (!formData.resume_version_id) {
      newErrors.resume_version_id = 'Please select a resume version';
    }

    if (!formData.applied_date) {
      newErrors.applied_date = 'Applied date is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const isValid = await validateForm();
    if (!isValid) {
      return;
    }

    setLoading(true);
    setErrors({});

    try {
      const submitData = {
        company: formData.company.trim(),
        position: formData.position.trim(),
        job_description: formData.job_description.trim() || null,
        resume_id: parseInt(formData.resume_id),
        resume_version_id: parseInt(formData.resume_version_id),
        status: formData.status,
        applied_date: formData.applied_date,
        notes: formData.notes.trim() || null
      };

      let result;
      if (applicationId) {
        result = await apiService.updateApplication(applicationId, submitData);
        devLog('Application updated:', result);
      } else {
        result = await apiService.createApplication(submitData);
        devLog('Application created:', result);
      }

      if (onSuccess) {
        onSuccess(result);
      } else {
        navigate('/applications');
      }

    } catch (error) {
      console.error('Failed to save application:', error);
      setErrors({ 
        general: error.message || (applicationId ? 'Failed to update application' : 'Failed to create application')
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  return {
    formData,
    loading,
    errors,
    handleChange,
    handleSubmit,
    validateForm,
  };
};
