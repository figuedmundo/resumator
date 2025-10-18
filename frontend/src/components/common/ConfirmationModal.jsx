import React from 'react';
import styles from './ConfirmationModal.module.css';

const ConfirmationModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{title}</h3>
        <p className={styles.message}>{message}</p>
        <div className={styles.actions}>
          <button onClick={onCancel} className={`${styles.button} ${styles.cancelButton}`}>
            Cancel
          </button>
          <button onClick={onConfirm} className={`${styles.button} ${styles.confirmButton}`}>
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationModal;
