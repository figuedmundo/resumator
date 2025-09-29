import { useState } from 'react';
import clsx from 'clsx';
import styles from './VersionPicker.module.css';

export default function VersionPicker({
  versions = [],
  selectedVersionId,
  onVersionSelect,
  className,
  label = 'Version:',
  showCount = true
}) {
  const [isOpen, setIsOpen] = useState(false);

  if (!versions || versions.length === 0) {
    return null;
  }

  const selectedVersion = versions.find(v => v.id === selectedVersionId) || versions[0];

  const handleSelect = (version) => {
    onVersionSelect(version);
    setIsOpen(false);
  };

  return (
    <div className={clsx(styles.container, className)}>
      {label && (
        <span className={styles.label}>
          {label}
        </span>
      )}
      
      <div className={styles.dropdown}>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={styles.trigger}
        >
          <span className={styles.selectedText}>
            {selectedVersion.version}
            {selectedVersion.is_original && (
              <span className={styles.badge}>Original</span>
            )}
            {selectedVersion.job_description && (
              <span className={styles.badgeCustom}>Customized</span>
            )}
          </span>
          <svg 
            className={clsx(styles.chevron, isOpen && styles.chevronOpen)} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isOpen && (
          <>
            <div 
              className={styles.backdrop} 
              onClick={() => setIsOpen(false)}
            />
            <div className={styles.menu}>
              <div className={styles.menuHeader}>
                <span className={styles.menuTitle}>Select Version</span>
                {showCount && (
                  <span className={styles.menuCount}>
                    {versions.length} {versions.length === 1 ? 'version' : 'versions'}
                  </span>
                )}
              </div>
              <div className={styles.menuItems}>
                {versions.map((version) => (
                  <button
                    key={version.id}
                    type="button"
                    onClick={() => handleSelect(version)}
                    className={clsx(
                      styles.menuItem,
                      version.id === selectedVersionId && styles.menuItemSelected
                    )}
                  >
                    <div className={styles.menuItemContent}>
                      <div className={styles.menuItemHeader}>
                        <span className={styles.menuItemVersion}>
                          {version.version}
                        </span>
                        {version.is_original && (
                          <span className={styles.menuItemBadge}>Original</span>
                        )}
                        {version.job_description && (
                          <span className={styles.menuItemBadgeCustom}>Customized</span>
                        )}
                      </div>
                      {version.job_description && (
                        <p className={styles.menuItemDesc}>
                          {version.job_description.substring(0, 60)}...
                        </p>
                      )}
                      <span className={styles.menuItemDate}>
                        {new Date(version.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    {version.id === selectedVersionId && (
                      <svg 
                        className={styles.checkIcon} 
                        fill="none" 
                        stroke="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
