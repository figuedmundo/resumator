import clsx from 'clsx';
import styles from './Forms.module.css';
import LoadingSpinner from '../LoadingSpinner/LoadingSpinner';

const Select = ({ label, name, value, onChange, error, required, disabled, helpText, children, loading = false }) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={clsx(styles.label, required && styles.labelRequired)}>
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={clsx(
            styles.select,
            error && styles.selectError,
            (disabled || loading) && styles.selectDisabled
          )}
          required={required}
          disabled={disabled || loading}
        >
          {children}
        </select>
        {loading && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-8 pointer-events-none">
            <LoadingSpinner size="sm" />
          </div>
        )}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
      {helpText && !error && <p className={styles.helpText}>{helpText}</p>}
    </div>
  );
};

export default Select;
