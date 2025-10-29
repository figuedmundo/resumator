import React from 'react';
import clsx from 'clsx';
import styles from './Common.module.css';

const Alert = ({ variant = 'success', message }) => {
  if (!message) return null;

  const isSuccess = variant === 'success';
  const alertClasses = isSuccess ? styles.successAlert : styles.errorAlert;
  const contentClasses = isSuccess ? styles.successContent : styles.errorContent;
  const iconClasses = isSuccess ? styles.successIcon : styles.errorIcon;
  const textClasses = isSuccess ? styles.successMessage : styles.errorMessage;

  const SuccessIcon = () => (
    <svg className={iconClasses} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
    </svg>
  );

  const ErrorIcon = () => (
    <svg className={iconClasses} viewBox="0 0 20 20" fill="currentColor">
      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
    </svg>
  );

  return (
    <div className={alertClasses} data-testid={`alert-${variant}`}>
      <div className={contentClasses}>
        {isSuccess ? <SuccessIcon /> : <ErrorIcon />}
        <div className={isSuccess ? styles.successText : styles.errorText}>
          <p className={textClasses}>{message}</p>
        </div>
      </div>
    </div>
  );
};

export default Alert;
