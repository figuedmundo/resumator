import React from 'react';
import styles from '../ResumeViewPage.module.css';

const ResumeSource = ({ currentContent }) => {
  return (
    <div className={styles.markdownContainer}>
      <div className={styles.markdownCard}>
        <div className={styles.markdownHeader}>
          <div className={styles.markdownHeaderContent}>
            <div className={styles.markdownHeaderInfo}>
              <h3 className={styles.markdownTitle}>Markdown Source</h3>
              <p className={styles.markdownSubtitle}>
                Raw markdown content of your resume
              </p>
            </div>
            <button
              onClick={() => navigator.clipboard.writeText(currentContent)}
              className={styles.copyButton}
              title="Copy to clipboard"
            >
              <svg className={styles.copyIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copy
            </button>
          </div>
        </div>
        <div className={styles.markdownContent}>
          <pre className={styles.markdownSource}>
            {currentContent || 'No content available'}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ResumeSource;
