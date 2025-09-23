import { useEffect, useRef, useState } from 'react';
import clsx from 'clsx';
import styles from './ConfirmDialog.module.css';

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to continue?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger', 'warning', 'info'
  isLoading = false,
}) {
  const confirmButtonRef = useRef(null);
  const dialogRef = useRef(null);

  // Focus confirm button when dialog opens
  useEffect(() => {
    if (isOpen && confirmButtonRef.current) {
      confirmButtonRef.current.focus();
    }
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen && !isLoading) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, isLoading, onClose]);

  // Handle click outside
  const handleBackdropClick = (e) => {
    if (e.target === dialogRef.current && !isLoading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const getVariantClasses = (variant) => {
    switch (variant) {
      case 'danger':
        return {
          iconContainer: styles.iconContainerDanger,
          icon: styles.iconDanger,
          button: styles.confirmButtonDanger,
        };
      case 'warning':
        return {
          iconContainer: styles.iconContainerWarning,
          icon: styles.iconWarning,
          button: styles.confirmButtonWarning,
        };
      case 'info':
        return {
          iconContainer: styles.iconContainerInfo,
          icon: styles.iconInfo,
          button: styles.confirmButtonInfo,
        };
      default:
        return {
          iconContainer: styles.iconContainerDanger,
          icon: styles.iconDanger,
          button: styles.confirmButtonDanger,
        };
    }
  };

  const variantClasses = getVariantClasses(variant);

  const renderIcon = (variant) => {
    const iconClass = clsx(styles.icon, variantClasses.icon);
    
    switch (variant) {
      case 'info':
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.728-.833-2.498 0L3.316 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
    }
  };

  return (
    <div 
      ref={dialogRef}
      className={clsx(styles.overlay, styles.fadeIn)}
      onClick={handleBackdropClick}
    >
      <div className={styles.dialog}>
        <div className={styles.content}>
          <div className={styles.header}>
            <div className={clsx(styles.iconContainer, variantClasses.iconContainer)}>
              {renderIcon(variant)}
            </div>
            <div className={styles.textContainer}>
              <h3 className={styles.title}>
                {title}
              </h3>
              <div className={styles.messageContainer}>
                <p className={styles.message}>
                  {message}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.footer}>
          <button
            ref={confirmButtonRef}
            type="button"
            disabled={isLoading}
            onClick={onConfirm}
            className={clsx(
              styles.confirmButton,
              variantClasses.button,
              isLoading && styles.confirmButtonDisabled
            )}
          >
            {isLoading ? (
              <div className={styles.confirmButtonLoading}>
                <svg className={styles.loadingSpinner} fill="none" viewBox="0 0 24 24">
                  <circle 
                    className={styles.loadingSpinnerCircle} 
                    cx="12" 
                    cy="12" 
                    r="10" 
                    stroke="currentColor" 
                    strokeWidth="4"
                  />
                  <path 
                    className={styles.loadingSpinnerPath} 
                    fill="currentColor" 
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Loading...
              </div>
            ) : (
              confirmText
            )}
          </button>
          
          <button
            type="button"
            disabled={isLoading}
            onClick={onClose}
            className={clsx(
              styles.cancelButton,
              isLoading && styles.cancelButtonDisabled
            )}
          >
            {cancelText}
          </button>
        </div>
      </div>
    </div>
  );
}

// Hook for easier usage
export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [config, setConfig] = useState({});

  const showConfirm = (options = {}) => {
    setConfig(options);
    setIsOpen(true);
    
    return new Promise((resolve) => {
      const handleConfirm = () => {
        setIsOpen(false);
        resolve(true);
      };
      
      const handleClose = () => {
        setIsOpen(false);
        resolve(false);
      };
      
      setConfig({ ...options, onConfirm: handleConfirm, onClose: handleClose });
    });
  };

  const ConfirmDialogComponent = () => (
    <ConfirmDialog
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      {...config}
    />
  );

  return { showConfirm, ConfirmDialogComponent };
}
