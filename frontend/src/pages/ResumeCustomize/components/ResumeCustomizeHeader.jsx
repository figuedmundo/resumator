import React from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import styles from '../ResumeCustomizePage.module.css';

const ResumeCustomizeHeader = ({ state, handlers }) => {
  const { resume, viewMode, hasChanges, versions, isLoading } = state;
  const { navigate, setViewMode, setShowVersions, handleDiscardCustomization, handleSaveCustomization, handleSaveAsApplication } = handlers;

  return (
    <div className={styles.header}>
      <div className={styles.headerContainer}>
        <div className={styles.headerContent}>
          <div className={styles.headerLeft}>
            <button onClick={() => navigate(`/resumes/${resume?.id}`)} className={styles.backButton}>
              <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to Resume
            </button>
            <div className={styles.headerInfo}>
              <h1 className={styles.title}>Customize: {resume?.title}</h1>
              <p className={styles.subtitle}>Use AI to tailor your resume for specific job descriptions</p>
            </div>
          </div>

          <div className={styles.headerRight}>
            <div className={styles.viewModeToggle}>
              <button onClick={() => setViewMode('customize')} className={clsx(styles.viewModeButton, viewMode === 'customize' ? styles.viewModeButtonActive : styles.viewModeButtonInactive)}>Customize</button>
              <button onClick={() => setViewMode('compare')} disabled={!hasChanges} className={clsx(styles.viewModeButton, viewMode === 'compare' ? styles.viewModeButtonActive : styles.viewModeButtonInactive)}>Compare</button>
              <button onClick={() => setViewMode('preview')} disabled={!hasChanges} className={clsx(styles.viewModeButton, viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive)}>Preview</button>
            </div>

            {versions.length > 0 && (
              <button onClick={() => setShowVersions(true)} className="p-2 text-gray-600 hover:text-gray-900 transition-colors duration-200" title="Version History">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              </button>
            )}

            {hasChanges && (
              <div className="flex items-center space-x-2">
                <button onClick={handleDiscardCustomization} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">Discard Changes</button>
                <button onClick={handleSaveCustomization} disabled={isLoading} className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200">
                  {isLoading ? <><LoadingSpinner size="sm" className="mr-2" />Saving...</> : 'Save as Version'}
                </button>
                <button onClick={handleSaveAsApplication} disabled={isLoading} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200">
                  {isLoading ? <><LoadingSpinner size="sm" className="mr-2" />Saving...</> : 'Save as Application'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeCustomizeHeader;
