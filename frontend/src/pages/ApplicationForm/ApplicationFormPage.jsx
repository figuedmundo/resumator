import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './ApplicationFormPage.module.css';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [formData, setFormData] = useState({
    company: '',
    position: '',
    jobDescription: '',
    resumeId: '',
    resumeVersionId: '',
    coverLetterId: '',
    coverLetterVersionId: '',
    customizeResume: false,
    additionalInstructions: '',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [resumes, setResumes] = useState([]);
  const [coverLetters, setCoverLetters] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resumesResponse, coverLettersResponse] = await Promise.all([
          apiService.getResumes(),
          apiService.getCoverLetters(),
        ]);
        setResumes(resumesResponse.resumes || resumesResponse || []);
        setCoverLetters(coverLettersResponse.cover_letters || coverLettersResponse || []);

        if (isEdit) {
          const application = await apiService.getApplication(id);
          setFormData({
            company: application.company || '',
            position: application.position || '',
            jobDescription: application.job_description || '',
            resumeId: application.resume_id || '',
            resumeVersionId: application.resume_version_id || '',
            coverLetterId: application.cover_letter_id || '',
            coverLetterVersionId: application.cover_letter_version_id || '',
            customizeResume: !!application.additional_instructions,
            additionalInstructions: application.additional_instructions || '',
            status: application.status || 'Applied',
            appliedDate: application.applied_date ? new Date(application.applied_date).toISOString().split('T')[0] : '',
            notes: application.notes || '',
          });
        }
      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, isEdit]);

  useEffect(() => {
    const fetchCoverLetterVersions = async () => {
      if (formData.coverLetterId) {
        try {
          const coverLetterWithVersions = await apiService.getCoverLetter(formData.coverLetterId);
          setCoverLetters((prev) =>
            prev.map((cl) =>
              cl.id === coverLetterWithVersions.id ? coverLetterWithVersions : cl
            )
          );
        } catch (err) {
          setError('Failed to load cover letter versions: ' + err.message);
        }
      }
    };

    fetchCoverLetterVersions();
  }, [formData.coverLetterId]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        company: formData.company,
        position: formData.position,
        job_description: formData.jobDescription,
        status: formData.status,
        applied_date: formData.appliedDate,
        notes: formData.notes,
        resume_id: parseInt(formData.resumeId, 10),
        resume_version_id: parseInt(formData.resumeVersionId, 10),
        cover_letter_id: formData.coverLetterId ? parseInt(formData.coverLetterId, 10) : null,
        cover_letter_version_id: formData.coverLetterVersionId ? parseInt(formData.coverLetterVersionId, 10) : null,
        additional_instructions: formData.customizeResume ? formData.additionalInstructions : null,
        customize_resume: formData.customizeResume,
      };

      if (isEdit) {
        await apiService.updateApplication(id, payload);
      } else {
        await apiService.createApplication(payload);
      }

      navigate('/applications');
    } catch (err) {
      setError('Failed to save application: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? 'Edit Application' : 'New Application'}
        </h1>
        <p className={styles.subtitle}>
          {isEdit
            ? 'Update your job application details'
            : 'Create a new job application with AI-powered resume and cover letter customization'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        {error && <div className={styles.errorAlert}>{error}</div>}

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Job Details</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="company" className={styles.label}>Company</label>
              <input
                type="text"
                id="company"
                name="company"
                value={formData.company}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="position" className={styles.label}>Position</label>
              <input
                type="text"
                id="position"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                className={styles.input}
                required
              />
            </div>
            <div className={clsx(styles.formGroup, styles.fullWidth)}>
              <label htmlFor="jobDescription" className={styles.label}>Job Description</label>
              <textarea
                id="jobDescription"
                name="jobDescription"
                value={formData.jobDescription}
                onChange={handleInputChange}
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Resume & Cover Letter</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="resumeId" className={styles.label}>Resume</label>
              <select
                id="resumeId"
                name="resumeId"
                value={formData.resumeId}
                onChange={handleInputChange}
                className={styles.select}
                required
              >
                <option value="">Select a resume</option>
                {resumes.map((resume) => (
                  <option key={resume.id} value={resume.id}>
                    {resume.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="resumeVersionId" className={styles.label}>Resume Version</label>
              <select
                id="resumeVersionId"
                name="resumeVersionId"
                value={formData.resumeVersionId}
                onChange={handleInputChange}
                className={styles.select}
                required
                disabled={!formData.resumeId}
              >
                <option value="">Select a version</option>
                {formData.resumeId &&
                  resumes
                    .find((r) => r.id === parseInt(formData.resumeId))
                    ?.versions.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.version}
                      </option>
                    ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="coverLetterId" className={styles.label}>Cover Letter (Optional)</label>
              <select
                id="coverLetterId"
                name="coverLetterId"
                value={formData.coverLetterId}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="">Select a cover letter</option>
                {coverLetters.map((cl) => (
                  <option key={cl.id} value={cl.id}>
                    {cl.title}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="coverLetterVersionId" className={styles.label}>Cover Letter Version</label>
              <select
                id="coverLetterVersionId"
                name="coverLetterVersionId"
                value={formData.coverLetterVersionId}
                onChange={handleInputChange}
                className={styles.select}
                disabled={!formData.coverLetterId}
              >
                <option value="">Select a version</option>
                {formData.coverLetterId &&
                  coverLetters
                    ?.versions?.map((version) => (
                      <option key={version.id} value={version.id}>
                        {version.version}
                      </option>
                    ))}
              </select>
            </div>
          </div>
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>AI Customization</h2>
          <div className={styles.formGroup}>
            <div className={styles.checkboxGroup}>
              <input
                type="checkbox"
                id="customizeResume"
                name="customizeResume"
                checked={formData.customizeResume}
                onChange={handleInputChange}
                className={styles.checkbox}
              />
              <label htmlFor="customizeResume" className={styles.label}>
                Customize resume and cover letter using AI
              </label>
            </div>
          </div>
          {formData.customizeResume && (
            <div className={styles.formGroup}>
              <label htmlFor="additionalInstructions" className={styles.label}>
                Additional Instructions
              </label>
              <textarea
                id="additionalInstructions"
                name="additionalInstructions"
                value={formData.additionalInstructions}
                onChange={handleInputChange}
                className={styles.textarea}
                placeholder="e.g., Emphasize my experience with React and TypeScript."
              />
            </div>
          )}
        </div>

        <div className={styles.formSection}>
          <h2 className={styles.sectionTitle}>Application Tracking</h2>
          <div className={styles.formGrid}>
            <div className={styles.formGroup}>
              <label htmlFor="status" className={styles.label}>Status</label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className={styles.select}
              >
                <option value="Applied">Applied</option>
                <option value="Interviewing">Interviewing</option>
                <option value="Offer">Offer</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="appliedDate" className={styles.label}>Applied Date</label>
              <input
                type="date"
                id="appliedDate"
                name="appliedDate"
                value={formData.appliedDate}
                onChange={handleInputChange}
                className={styles.input}
              />
            </div>
            <div className={clsx(styles.formGroup, styles.fullWidth)}>
              <label htmlFor="notes" className={styles.label}>Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className={styles.textarea}
              />
            </div>
          </div>
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => navigate('/applications')}
            className={clsx(styles.button, styles.cancelButton)}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className={clsx(styles.button, styles.submitButton)}
          >
            {isSubmitting ? <LoadingSpinner size="sm" /> : (isEdit ? 'Save Changes' : 'Create Application')}
          </button>
        </div>
      </form>
    </div>
  );
}