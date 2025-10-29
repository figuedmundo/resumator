import clsx from 'clsx';
import styles from './Forms.module.css';

const Textarea = ({ label, name, value, onChange, error, required, placeholder, disabled, helpText, rows = 4 }) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={clsx(styles.label, required && styles.labelRequired)}>
          {label}
        </label>
      )}
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        rows={rows}
        className={clsx(
          styles.textarea,
          error && styles.textareaError,
          disabled && styles.inputDisabled // Reusing input disabled style
        )}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
      />
      {error && <p className={styles.errorText}>{error}</p>}
      {helpText && !error && <p className={styles.helpText}>{helpText}</p>}
    </div>
  );
};

export default Textarea;
