import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import TemplateSelector from './TemplateSelector';
import styles from '../ResumeViewPage.module.css';

const ResumePreview = ({
  resume,
  selectedTemplate,
  handleTemplateChange,
  htmlLoading,
  iframeSrc,
  currentContent,
  isDownloadingPDF,
  handleDownloadPDF,
  handlePrint,
}) => {
  return (
    <div className={styles.previewGrid}>
      <div className={styles.templateColumn}>
        <TemplateSelector
          selectedTemplate={selectedTemplate}
          onTemplateChange={handleTemplateChange}
          className={styles.templateFit}
        />
      </div>

      <div className={styles.previewColumn}>
        <div className={styles.previewCard}>
          <div className={styles.previewHeader}>
            <div className={styles.previewHeaderContent}>
              <div className={styles.previewHeaderLeft}>
                <h3 className={styles.previewTitle}>Resume Preview</h3>
                <p className={styles.previewSubtitle}>
                  Formatted preview using {selectedTemplate} template
                </p>
              </div>
              <div className={styles.previewHeaderActions}>
                <button
                  onClick={handlePrint}
                  disabled={htmlLoading || !iframeSrc}
                  className={styles.previewActionButton}
                  title="Print resume"
                >
                  <svg className={styles.previewActionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                </button>
                <button
                  onClick={handleDownloadPDF}
                  disabled={htmlLoading || isDownloadingPDF}
                  className={styles.previewDownloadButton}
                >
                  {isDownloadingPDF ? (
                    <>
                      <LoadingSpinner size="sm" className="mr-2" />
                      <span>Downloading...</span>
                    </>
                  ) : (
                    <>
                      <svg className={styles.previewDownloadIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span>Download PDF</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
          <div className={styles.previewContent}>
            {htmlLoading ? (
              <div className={styles.previewLoading}>
                <LoadingSpinner size="md" />
                <span>Loading preview...</span>
              </div>
            ) : iframeSrc ? (
              <div className={styles.previewDocument} key={selectedTemplate}>
                <iframe
                  src={iframeSrc}
                  className={styles.previewIframe}
                  title="Resume Preview"
                  sandbox="allow-same-origin"
                />
              </div>
            ) : (
              <div className={styles.previewDocument}>
                <div className={styles.previewProse}>
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {currentContent}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumePreview;
