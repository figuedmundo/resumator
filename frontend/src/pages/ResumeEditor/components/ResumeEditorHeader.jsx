import { Link } from 'react-router-dom';
import clsx from 'clsx';
import LoadingSpinner from '../../../components/LoadingSpinner/LoadingSpinner';
import VersionPicker from '../../../components/Resumes/VersionPicker';
import styles from '../ResumeEditorPage.module.css';

const ResumeEditorHeader = ({ state, handlers }) => {
  const {
    id,
    title,
    saveStatus,
    isSaving,
    viewMode,
    versions,
    selectedVersionId,
    isDarkMode,
    showVersions,
    showUploadZone,
  } = state;

  const {
    navigate,
    setTitle,
    setViewMode,
    setSelectedVersionId,
    setShowVersions,
    setIsDarkMode,
    setShowUploadZone,
    handleManualSave,
  } = handlers;

  const getSaveStatusColor = () => {
    switch (saveStatus) {
      case 'saved': return styles.saveStatusSaved;
      case 'saving': return styles.saveStatusSaving;
      case 'unsaved': return styles.saveStatusUnsaved;
      case 'error': return styles.saveStatusError;
      default: return 'text-gray-600';
    }
  };

  const getSaveStatusText = () => {
    switch (saveStatus) {
      case 'saved': return '✓ Saved';
      case 'saving': return 'Saving...';
      case 'unsaved': return '• Unsaved changes';
      case 'error': return '⚠ Save failed';
      default: return '';
    }
  };

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div className={styles.headerLeft}>
          <button
            onClick={() => navigate('/resumes')}
            className={styles.backButton}
          >
            <svg className={styles.backIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Resumes
          </button>
          <div className={styles.titleSection}>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={styles.titleInput}
              placeholder="Resume Title"
            />
            <span className={clsx(styles.saveStatus, getSaveStatusColor())}>
              {getSaveStatusText()}
            </span>
          </div>
        </div>

        <div className={styles.headerRight}>
          <div className={styles.viewModeToggle}>
            <button
              onClick={() => setViewMode('edit')}
              className={clsx(
                styles.viewModeButton,
                viewMode === 'edit' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
              )}
            >
              Edit
            </button>
            <button
              onClick={() => setViewMode('preview')}
              className={clsx(
                styles.viewModeButton,
                viewMode === 'preview' ? styles.viewModeButtonActive : styles.viewModeButtonInactive
              )}
            >
              Preview
            </button>
          </div>

          {versions.length > 0 && (
            <VersionPicker
              versions={versions}
              selectedVersionId={selectedVersionId}
              onVersionSelect={(version) => setSelectedVersionId(version.id)}
              showCount={false}
            />
          )}

          {versions.length > 0 && (
            <button
              onClick={() => setShowVersions(!showVersions)}
              className={styles.actionButton}
              title="Version History"
            >
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </button>
          )}

          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={styles.actionButton}
            title={isDarkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {isDarkMode ? (
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ) : (
              <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0112 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <button
            onClick={() => setShowUploadZone(!showUploadZone)}
            className={styles.actionButton}
            title="Upload file"
          >
            <svg className={styles.actionIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
          </button>

          {id && id !== 'new' && (
            <Link
              to={`/resumes/${id}`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
              View Resume
            </Link>
          )}

          <button
            onClick={handleManualSave}
            disabled={isSaving || saveStatus === 'saved'}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isSaving ? (
              <>
                <LoadingSpinner size="sm" className="mr-2" />
                Saving...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                Save
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeEditorHeader;
