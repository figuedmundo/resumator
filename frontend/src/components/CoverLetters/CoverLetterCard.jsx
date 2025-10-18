import { useState } from 'react';
import clsx from 'clsx';
import styles from './CoverLetterCard.module.css';

/**
 * CoverLetterCard Component
 * Displays a single cover letter with summary and action buttons
 * 
 * Props:
 *  - coverLetter: object with id, title, content
 *  - onView: callback when View button clicked
 *  - onEdit: callback when Edit button clicked
 *  - onDelete: callback when Delete button clicked
 */
export default function CoverLetterCard({ coverLetter, onView, onEdit, onDelete }) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm(`Delete cover letter for ${coverLetter.title}?`)) {
      setIsDeleting(true);
      try {
        await onDelete(coverLetter.id);
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div className={styles.card}>
      <div className={styles.cardContent}>
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <h3 className={styles.title}>{coverLetter.title || 'Untitled'}</h3>
          </div>
        </div>

        {coverLetter.content && (
          <div className={styles.preview}>
            <p className={styles.previewText}>
              {coverLetter.content.substring(0, 150).replace(/\n/g, ' ')}
              {coverLetter.content.length > 150 ? '...' : ''}
            </p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          className={clsx(styles.button, styles.buttonPrimary)}
          onClick={() => onView(coverLetter.id)}
          title="View cover letter"
        >
          <span className={styles.icon}>👁️</span>
          View
        </button>
        <button
          className={clsx(styles.button, styles.buttonSecondary)}
          onClick={() => onEdit(coverLetter.id)}
          title="Edit cover letter"
        >
          <span className={styles.icon}>✏️</span>
          Edit
        </button>
        <button
          className={clsx(styles.button, styles.buttonDanger)}
          onClick={handleDelete}
          disabled={isDeleting}
          title="Delete cover letter"
        >
          <span className={styles.icon}>🗑️</span>
          {isDeleting ? 'Deleting...' : 'Delete'}
        </button>
      </div>
    </div>
  );
}
