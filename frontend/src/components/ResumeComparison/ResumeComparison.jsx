// frontend/src/components/ResumeComparison/ResumeComparison.jsx
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from './ResumeComparison.module.css';

export default function ResumeComparison({ 
  originalContent, 
  customizedContent, 
  jobDescription = '' 
}) {
  const [viewMode, setViewMode] = useState('toggle'); // 'toggle' or 'split'
  const [activeVersion, setActiveVersion] = useState('customized'); // 'original' or 'customized'

  // Calculate some basic statistics
  const originalWordCount = originalContent.split(/\s+/).length;
  const customizedWordCount = customizedContent.split(/\s+/).length;
  const wordDifference = customizedWordCount - originalWordCount;

  return (
    <div className={styles.container}>
      {/* Control Bar */}
      <div className={styles.controlBar}>
        <div className={styles.controlBarContent}>
          <div className={styles.controls}>
            {/* View Mode Selector */}
            <div className={styles.viewModeSelector}>
              <span className={styles.viewModeLabel}>View:</span>
              <div className={styles.viewModeButtons}>
                <button
                  onClick={() => setViewMode('toggle')}
                  className={`${styles.viewModeButton} ${
                    viewMode === 'toggle' ? styles.viewModeButtonActive : ''
                  }`}
                >
                  Toggle
                </button>
                <button
                  onClick={() => setViewMode('split')}
                  className={`${styles.viewModeButton} ${
                    viewMode === 'split' ? styles.viewModeButtonActive : ''
                  }`}
                >
                  Split View
                </button>
              </div>
            </div>

            {/* Statistics */}
            <div className={styles.statistics}>
              <div className={styles.statItem}>
                <svg className={styles.statIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span>
                  {wordDifference > 0 ? '+' : ''}{wordDifference} words
                </span>
              </div>
              <div className={styles.statItemHidden}>
                <span>{originalWordCount} → {customizedWordCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className={styles.contentArea}>
        {viewMode === 'toggle' ? (
          <ToggleView
            originalContent={originalContent}
            customizedContent={customizedContent}
            activeVersion={activeVersion}
            setActiveVersion={setActiveVersion}
            jobDescription={jobDescription}
          />
        ) : (
          <SplitView
            originalContent={originalContent}
            customizedContent={customizedContent}
            jobDescription={jobDescription}
          />
        )}
      </div>
    </div>
  );
}

function ToggleView({ 
  originalContent, 
  customizedContent, 
  activeVersion, 
  setActiveVersion,
  jobDescription 
}) {
  return (
    <div className={styles.toggleView}>
      {/* Version Toggle Bar */}
      <div className={styles.toggleBar}>
        <div className={styles.toggleBarContent}>
          <div className={styles.versionButtons}>
            <button
              onClick={() => setActiveVersion('original')}
              className={`${styles.versionButton} ${
                activeVersion === 'original' ? styles.versionButtonActiveOriginal : ''
              }`}
            >
              <div className={styles.versionButtonInner}>
                <div>
                  <div className={styles.versionButtonHeader}>
                    <h3 className={`${styles.versionButtonTitle} ${
                      activeVersion === 'original' ? styles.versionButtonTitleActive : ''
                    }`}>
                      Original Resume
                    </h3>
                    {activeVersion === 'original' && (
                      <span className={styles.viewingBadge}>
                        Viewing
                      </span>
                    )}
                  </div>
                  <p className={styles.versionButtonSubtitle}>Your original resume content</p>
                </div>
                <svg 
                  className={`${styles.checkIcon} ${
                    activeVersion === 'original' ? styles.checkIconVisible : ''
                  }`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>

            <button
              onClick={() => setActiveVersion('customized')}
              className={`${styles.versionButton} ${
                activeVersion === 'customized' ? styles.versionButtonActiveCustomized : ''
              }`}
            >
              <div className={styles.versionButtonInner}>
                <div>
                  <div className={styles.versionButtonHeader}>
                    <h3 className={`${styles.versionButtonTitle} ${
                      activeVersion === 'customized' ? styles.versionButtonTitleActiveCustomized : styles.versionButtonTitleCustomized
                    }`}>
                      Customized Resume
                    </h3>
                    {activeVersion === 'customized' && (
                      <span className={styles.viewingBadgeCustomized}>
                        Viewing
                      </span>
                    )}
                  </div>
                  <p className={styles.versionButtonSubtitleCustomized}>AI-tailored for the job</p>
                </div>
                <svg 
                  className={`${styles.checkIconCustomized} ${
                    activeVersion === 'customized' ? styles.checkIconVisible : ''
                  }`}
                  fill="currentColor" 
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Content Display */}
      <div className={styles.toggleContent}>
        <div className={styles.toggleContentInner}>
          <div className={`${styles.resumeCard} ${
            activeVersion === 'original' ? styles.resumeCardOriginal : styles.resumeCardCustomized
          }`}>
            {/* Header */}
            <div className={`${styles.resumeHeader} ${
              activeVersion === 'original' ? styles.resumeHeaderOriginal : styles.resumeHeaderCustomized
            }`}>
              <div className={styles.resumeHeaderContent}>
                <div>
                  <h3 className={`${styles.resumeTitle} ${
                    activeVersion === 'original' ? styles.resumeTitleOriginal : styles.resumeTitleCustomized
                  }`}>
                    {activeVersion === 'original' ? 'Original Resume' : 'Customized Resume'}
                  </h3>
                  {activeVersion === 'customized' && jobDescription && (
                    <p className={styles.jobDescriptionHint}>
                      Tailored for: {jobDescription.substring(0, 80)}...
                    </p>
                  )}
                </div>
                <button
                  onClick={() => setActiveVersion(activeVersion === 'original' ? 'customized' : 'original')}
                  className={`${styles.switchButton} ${
                    activeVersion === 'original' ? styles.switchButtonOriginal : styles.switchButtonCustomized
                  }`}
                >
                  <span>Switch to {activeVersion === 'original' ? 'Customized' : 'Original'}</span>
                  <svg className={styles.switchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Resume Content */}
            <div className={styles.resumeContent}>
              <div className={styles.prose}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {activeVersion === 'original' ? originalContent : customizedContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Quick Switch Hint */}
          <div className={styles.switchHint}>
            <p className={styles.switchHintText}>
              <span className={styles.switchHintDesktop}>Press the buttons above or use </span>
              <span className={styles.switchHintMobile}>Tap above to </span>
              switch between versions
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SplitView({ originalContent, customizedContent, jobDescription }) {
  return (
    <div className={styles.splitView}>
      <div className={styles.splitViewContent}>
        <div className={styles.splitViewGrid}>
          {/* Original Resume */}
          <div className={styles.splitCard}>
            <div className={styles.splitHeaderOriginal}>
              <div className={styles.splitHeaderContent}>
                <div>
                  <h3 className={styles.splitTitleOriginal}>Original Resume</h3>
                  <p className={styles.splitSubtitleOriginal}>Your original resume content</p>
                </div>
                <span className={styles.splitBadgeOriginal}>
                  Original
                </span>
              </div>
            </div>
            <div className={styles.splitContent}>
              <div className={styles.prose}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {originalContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>

          {/* Customized Resume */}
          <div className={styles.splitCardCustomized}>
            <div className={styles.splitHeaderCustomized}>
              <div className={styles.splitHeaderContent}>
                <div>
                  <h3 className={styles.splitTitleCustomized}>Customized Resume</h3>
                  <p className={styles.splitSubtitleCustomized}>AI-tailored for the job</p>
                  {jobDescription && (
                    <p className={styles.splitJobHint}>
                      {jobDescription.substring(0, 60)}...
                    </p>
                  )}
                </div>
                <span className={styles.splitBadgeCustomized}>
                  Customized
                </span>
              </div>
            </div>
            <div className={styles.splitContent}>
              <div className={styles.prose}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {customizedContent}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        </div>

        {/* Info Message for Mobile */}
        <div className={styles.mobileHint}>
          <div className={styles.mobileHintContent}>
            <p className={styles.mobileHintText}>
              💡 Tip: Switch to <strong>Toggle view</strong> for easier mobile comparison
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
