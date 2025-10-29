import { useNavigate } from 'react-router-dom';
import { useApplicationForm } from '@/hooks/useApplicationForm';
import Input from '@/components/forms/Input';
import Textarea from '@/components/forms/Textarea';
import Select from '@/components/forms/Select';
import FormGroup from '@/components/forms/FormGroup';
import ResumeSelect from '@/components/applications/ResumeSelect';
import ResumeVersionSelect from '@/components/applications/ResumeVersionSelect';
import LoadingSpinner from '@/components/LoadingSpinner/LoadingSpinner';
import { APPLICATION_STATUS } from '@/utils/constants';
import styles from './ApplicationForm.module.css';

const ApplicationForm = ({ applicationId = null, onSuccess }) => {
  const navigate = useNavigate();
  const {
    formData,
    loading,
    errors,
    handleChange,
    handleSubmit,
  } = useApplicationForm(applicationId, onSuccess);

  const statusOptions = [
    { value: APPLICATION_STATUS.APPLIED, label: 'Applied' },
    { value: APPLICATION_STATUS.INTERVIEWING, label: 'Interviewing' },
    { value: APPLICATION_STATUS.OFFER, label: 'Offer' },
    { value: APPLICATION_STATUS.REJECTED, label: 'Rejected' },
    { value: APPLICATION_STATUS.WITHDRAWN, label: 'Withdrawn' },
  ];

  if (loading && !applicationId) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {errors.general && (
        <div className={styles.errorAlert}>
          {errors.general}
        </div>
      )}

      <FormGroup>
        <Input
          label="Company"
          name="company"
          value={formData.company}
          onChange={handleChange}
          error={errors.company}
          placeholder="Enter company name"
          required
        />
        <Input
          label="Position"
          name="position"
          value={formData.position}
          onChange={handleChange}
          error={errors.position}
          placeholder="Enter job title/position"
          required
        />
      </FormGroup>

      <Textarea
        label="Job Description"
        name="job_description"
        value={formData.job_description}
        onChange={handleChange}
        error={errors.job_description}
        rows={4}
        placeholder="Paste job description or key requirements"
        helpText="Optional: Include the job description to help track requirements"
      />

      <FormGroup>
        <ResumeSelect
          value={formData.resume_id}
          onChange={handleChange}
          error={errors.resume_id}
          required
        />
        <ResumeVersionSelect
          resumeId={formData.resume_id}
          value={formData.resume_version_id}
          onChange={handleChange}
          error={errors.resume_version_id}
          required
        />
      </FormGroup>

      <FormGroup>
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          error={errors.status}
          helpText="Current status of your job application"
        >
          {statusOptions.map(option => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Input
          type="date"
          label="Applied Date"
          name="applied_date"
          value={formData.applied_date}
          onChange={handleChange}
          error={errors.applied_date}
          required
        />
      </FormGroup>

      <Textarea
        label="Notes"
        name="notes"
        value={formData.notes}
        onChange={handleChange}
        error={errors.notes}
        rows={3}
        placeholder="Add any additional notes about this application"
        helpText="Optional: Interview dates, contacts, follow-up reminders, etc."
      />

      <div className={styles.actions}>
        <button
          type="button"
          onClick={() => navigate('/applications')}
          className={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading && <LoadingSpinner size="sm" className={styles.loadingSpinner} />}
          <span>{applicationId ? 'Update Application' : 'Create Application'}</span>
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
