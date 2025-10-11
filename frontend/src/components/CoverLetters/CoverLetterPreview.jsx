import { useState } from 'react';
import clsx from 'clsx';
import styles from './CoverLetterPreview.module.css';

/**
 * CoverLetterPreview Component
 * Can be used as either:
 * 1. Modal preview (with isOpen prop)
 * 2. Simple preview pane (with just content prop)
 * 
 * Props:
 *  - content: string of cover letter content to display
 *  - coverLetter: optional - cover letter object for modal mode
 *  - isOpen: optional - for modal mode
 *  - onClose: optional - callback when modal closes
 *  - onEdit: optional - callback when edit button clicked
 *  - onDownload: optional - callback when download button clicked
 */
export default function CoverLetterPreview({ 
  content,
  coverLetter, 
  isOpen, 
  onClose, 
  onEdit, 
  onDownload 
}) {
  const [isDownloading, setIsDownloading] = useState(false);

  // Simple preview mode (pane/inline)
  if (!isOpen && content) {
    return (
      <div className={styles.previewPane}>
        <div className={styles.previewContent}>
          {content.split('\n').map((line, index) => (
            <p key={index} className={styles.line}>
              {line || '\u00A0'}
            </p>
          ))}
        </div>
      </div>
    );
  }

  // Modal preview mode
  if (!isOpen || !coverLetter) {
    return null;
  }

  const handleDownload = async () => {
    setIsDownloading(true);
    try {
      await onDownload(coverLetter.id);
    } finally {
      setIsDownloading(false);
    }
  };

  // Process content with template variables replaced for preview
  const processedContent = coverLetter.content
    ?.replace(/\{\{company\}\}/g, coverLetter.company || '[Company Name]')
    ?.replace(/\{\{position\}\}/g, coverLetter.position || '[Position Title]')
    ?.replace(/\{\{name\}\}/g, coverLetter.name || '[Your Name]')
    ?.replace(/\{\{date\}\}/g, new Date().toLocaleDateString())
    ?.replace(/\{\{hiring_manager\}\}/g, coverLetter.hiring_manager || '[Hiring Manager Name]')
    || '';

  return (
    <>
      {/* Modal Backdrop */}
      <div 
        className={styles.backdrop}
        onClick={onClose}
        role="presentation"
      />

      {/* Modal */}
      <div className={styles.modal}>
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <h2 className={styles.title}>{coverLetter.title || 'Cover Letter'}</h2>
            <p className={styles.subtitle}>
              {coverLetter.company} • {coverLetter.position}
            </p>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close preview"
          >
            ✕
          </button>
        </div>

        <div className={styles.content}>
          <div className={styles.preview}>
            {processedContent.split('\n').map((line, index) => (
              <p key={index} className={styles.line}>
                {line || '\u00A0'}
              </p>
            ))}
          </div>
        </div>

        <div className={styles.footer}>
          <button
            className={clsx(styles.button, styles.buttonSecondary)}
            onClick={onClose}
          >
            Close
          </button>
          <button
            className={clsx(styles.button, styles.buttonSecondary)}
            onClick={() => {
              onEdit(coverLetter.id);
              onClose();
            }}
          >
            <span>✏️</span> Edit
          </button>
          <button
            className={clsx(styles.button, styles.buttonPrimary)}
            onClick={handleDownload}
            disabled={isDownloading}
          >
            <span>⬇️</span> {isDownloading ? 'Downloading...' : 'Download PDF'}
          </button>
        </div>

        {/* Info about template variables */}
        {processedContent.includes('[') && (
          <div className={styles.info}>
            <p className={styles.infoText}>
              💡 Some template variables were not replaced. Check the cover letter content for accuracy.
            </p>
          </div>
        )}
      </div>
    </>
  );
}
