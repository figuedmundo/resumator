import { useState, useMemo } from 'react';
import clsx from 'clsx';
import { formatDate } from '../../utils/helpers';
import styles from './VersionComparison.module.css';

export default function VersionComparison({ 
  versions, 
  currentContent, 
  onVersionSelect, 
  onClose, 
  showCurrentFirst = true,
  currentVersionLabel = "Current Version" 
}) {
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [showDiff, setShowDiff] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Simple diff function (basic line-by-line comparison)
  const generateDiff = useMemo(() => {
    if (!selectedVersion || !showDiff) return null;

    const currentLines = currentContent.split('\n');
    const versionLines = selectedVersion.content.split('\n');
    const maxLines = Math.max(currentLines.length, versionLines.length);
    const diff = [];

    for (let i = 0; i < maxLines; i++) {
      const currentLine = currentLines[i] || '';
      const versionLine = versionLines[i] || '';

      if (currentLine === versionLine) {
        diff.push({ type: 'equal', current: currentLine, version: versionLine, lineNumber: i + 1 });
      } else if (currentLines[i] === undefined) {
        diff.push({ type: 'removed', current: '', version: versionLine, lineNumber: i + 1 });
      } else if (versionLines[i] === undefined) {
        diff.push({ type: 'added', current: currentLine, version: '', lineNumber: i + 1 });
      } else {
        diff.push({ type: 'changed', current: currentLine, version: versionLine, lineNumber: i + 1 });
      }
    }

    return diff;
  }, [selectedVersion, currentContent, showDiff]);

  const handleVersionSelect = (version) => {
    setSelectedVersion(version);
    setShowDiff(false);
  };

  const handleRestoreVersion = () => {
    if (selectedVersion && onVersionSelect) {
      onVersionSelect(selectedVersion);
    }
  };

  // Filter versions based on search term
  const filteredVersions = versions?.filter(version => 
    !searchTerm || 
    version.content?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    formatDate(version.created_at, 'MMM dd, yyyy').toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (!versions || versions.length === 0) {
    return (
      <div className={styles.emptyContainer}>
        <div className={styles.header}>
          <div className={styles.headerTop}>
            <h3 className={styles.title}>Version History</h3>
            <button
              onClick={onClose}
              className={styles.closeButton}
            >
              <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className={styles.emptyMessage}>No version history available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <h3 className={styles.title}>Version History</h3>
          <button
            onClick={onClose}
            className={styles.closeButton}
          >
            <svg className={styles.closeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className={styles.searchContainer}>
          <div className={styles.searchWrapper}>
            <input
              type="text"
              placeholder="Search versions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={styles.searchInput}
            />
            <div className={styles.searchIcon}>
              <svg className={styles.searchIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {selectedVersion && (
          <div className={styles.actionButtons}>
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={clsx(
                styles.diffButton,
                showDiff ? styles.diffButtonActive : styles.diffButtonInactive
              )}
            >
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </button>
            <button
              onClick={handleRestoreVersion}
              className={styles.restoreButton}
            >
              Restore Version
            </button>
          </div>
        )}
      </div>

      {/* Version List */}
      <div className={styles.versionList}>
        <div className={styles.versionListContent}>
          {/* Current Version */}
          {showCurrentFirst && (
            <div className={styles.currentVersion}>
              <div className={styles.currentVersionContent}>
                <div className={styles.currentVersionInfo}>
                  <div className={styles.currentVersionLabel}>{currentVersionLabel}</div>
                  <div className={styles.currentVersionDate}>{formatDate(new Date(), 'relative')}</div>
                </div>
                <span className={styles.currentBadge}>
                  Current
                </span>
              </div>
              {/* Content preview */}
              <div className={styles.currentVersionPreview}>
                {currentContent ? `${currentContent.length} characters` : 'No content'}
              </div>
            </div>
          )}

          {/* Version History */}
          {filteredVersions.length === 0 && searchTerm && (
            <div className={styles.noResults}>
              <p className={styles.noResultsText}>No versions found for "{searchTerm}"</p>
            </div>
          )}
          
          {filteredVersions.map((version, index) => (
            <div
              key={version.id}
              className={clsx(
                styles.versionItem,
                selectedVersion?.id === version.id
                  ? styles.versionItemSelected
                  : styles.versionItemDefault
              )}
              onClick={() => handleVersionSelect(version)}
            >
              <div className={styles.versionItemHeader}>
                <div className={styles.versionInfo}>
                  <div className={styles.versionNumber}>
                    Version {versions.length - versions.indexOf(version)}
                  </div>
                  <div className={styles.versionDateRelative}>
                    {formatDate(version.created_at, 'relative')}
                  </div>
                  <div className={styles.versionDateAbsolute}>
                    {formatDate(version.created_at, 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                {selectedVersion?.id === version.id && (
                  <span className={styles.selectedBadge}>
                    Selected
                  </span>
                )}
              </div>
              
              {/* Version stats and type */}
              <div className={styles.versionStats}>
                <div className={styles.versionMetrics}>
                  <span>{version.content?.length || 0} characters</span>
                  <span>{(version.content?.split('\n') || []).length} lines</span>
                </div>
                {version.customization_context && (
                  <span className={styles.aiBadge}>
                    AI Customized
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Diff View */}
      {showDiff && selectedVersion && generateDiff && (
        <div className={styles.diffView}>
          <div className={styles.diffContent}>
            <h4 className={styles.diffTitle}>
              Changes from Version {versions.length - versions.findIndex(v => v.id === selectedVersion.id)} to Current
            </h4>
            <div className={styles.diffContainer}>
              <div className={styles.diffList}>
                {generateDiff
                  .filter(line => line.type !== 'equal')
                  .slice(0, 50) // Limit to first 50 differences for performance
                  .map((line, index) => (
                    <div key={index} className="px-4 py-2 text-sm font-mono">
                      <div className="flex items-start space-x-2">
                        <span className="text-gray-400 text-xs w-8 flex-shrink-0">
                          {line.lineNumber}
                        </span>
                        <div className="flex-1 min-w-0">
                          {line.type === 'added' && (
                            <div className="bg-green-50 text-green-800 px-2 py-1 rounded">
                              <span className="text-green-600 mr-1">+</span>
                              {line.current}
                            </div>
                          )}
                          {line.type === 'removed' && (
                            <div className="bg-red-50 text-red-800 px-2 py-1 rounded">
                              <span className="text-red-600 mr-1">-</span>
                              {line.version}
                            </div>
                          )}
                          {line.type === 'changed' && (
                            <div className="space-y-1">
                              <div className="bg-red-50 text-red-800 px-2 py-1 rounded">
                                <span className="text-red-600 mr-1">-</span>
                                {line.version}
                              </div>
                              <div className="bg-green-50 text-green-800 px-2 py-1 rounded">
                                <span className="text-green-600 mr-1">+</span>
                                {line.current}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
              
              {generateDiff.filter(line => line.type !== 'equal').length > 50 && (
                <div className={styles.diffTruncated}>
                  Showing first 50 changes. Full diff available in editor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Version Preview */}
      {selectedVersion && !showDiff && (
        <div className={styles.previewView}>
          <div className={styles.previewContent}>
            <h4 className={styles.previewTitle}>
              Version {versions.length - versions.findIndex(v => v.id === selectedVersion.id)} Preview
            </h4>
            {selectedVersion.customization_context && (
              <div className={styles.aiContext}>
                <p className={styles.aiContextTitle}>AI Customization Context:</p>
                <p className={styles.aiContextText}>
                  {selectedVersion.customization_context.substring(0, 200)}...
                </p>
              </div>
            )}
            <div className={styles.previewContainer}>
              <pre className={styles.previewText}>
                {selectedVersion.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}