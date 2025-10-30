import ReactMarkdown from 'react-markdown';
import CustomizationPreview from './components/CustomizationPreview';

export default function ResumeCustomizePage() {
  const {
    state,
    handlers,
  } = useResumeCustomization();

  const {
    resume,
    originalContent,
    customizedContent,
    versions,
    currentJobDescription,
    customInstructions,
    isLoading,
    isCustomizing,
    error,
    successMessage,
    showVersions,
    viewMode,
    hasChanges,
  } = state;

  const {
    handleCustomization,
    handleVersionRestore,
    setShowVersions,
    setError,
  } = handlers;

  if (isLoading && !resume) {
    return (
      <PageLayout>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      </PageLayout>
    );
  }

  if (error && !resume) {
    return (
      <PageLayout>
        <Alert variant="error" message={error} />
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <ResumeCustomizeHeader state={state} handlers={handlers} />

      <div className={styles.messagesContainer}>
        <Alert variant="success" message={successMessage} />
        <Alert variant="error" message={error} />
      </div>

      <div className="flex-1 overflow-hidden">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8 h-full">
          <div className="flex h-full space-x-6 py-6">
            {showVersions && (
              <div className="w-80 flex-shrink-0">
                <VersionComparison
                  versions={versions}
                  currentContent={customizedContent}
                  onVersionSelect={handleVersionRestore}
                  onClose={() => setShowVersions(false)}
                />
              </div>
            )}

            <div className="flex-1 min-w-0">
              {viewMode === 'customize' && (
                <ResumeCustomizer
                  resume={resume}
                  onCustomizationComplete={handleCustomization}
                  onError={setError}
                  isLoading={isCustomizing}
                  initialJobDescription={currentJobDescription}
                  initialCustomInstructions={customInstructions}
                  className="h-full overflow-auto"
                />
              )}

              {viewMode === 'compare' && hasChanges && (
                <ResumeComparison
                  originalContent={originalContent}
                  customizedContent={customizedContent}
                  jobDescription={currentJobDescription}
                />
              )}

              {viewMode === 'preview' && hasChanges && (
                <CustomizationPreview customizedContent={customizedContent} />
              )}

              {(viewMode === 'compare' || viewMode === 'preview') && !hasChanges && (
                <div className="h-full flex items-center justify-center bg-white border border-gray-200 rounded-lg">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    <h3 className="mt-4 text-sm font-medium text-gray-900">No Customization Yet</h3>
                    <p className="mt-2 text-sm text-gray-500">Create a customized version to see the comparison or preview.</p>
                    <button onClick={() => handlers.setViewMode('customize')} className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200">Start Customizing</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </PageLayout>
  );
}

