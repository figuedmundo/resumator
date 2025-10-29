import clsx from 'clsx';
import styles from './Forms.module.css';

const Input = ({ label, name, type = 'text', value, onChange, error, required, placeholder, disabled, helpText }) => {
  return (
    <div className={styles.formGroup}>
      {label && (
        <label htmlFor={name} className={clsx(styles.label, required && styles.labelRequired)}>
          {label}
        </label>
      )}
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={clsx(
          styles.input,
          error && styles.inputError,
          disabled && styles.inputDisabled
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

export default Input;
