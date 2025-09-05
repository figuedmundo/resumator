import { useState, useMemo } from 'react';
import { formatDate } from '../../utils/helpers';

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
      <div className="bg-white rounded-lg border border-gray-200 h-full">
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-500 text-sm">No version history available yet.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Version History</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search */}
        <div className="mb-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search versions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>
        </div>

        {selectedVersion && (
          <div className="flex flex-wrap gap-2 mb-4">
            <button
              onClick={() => setShowDiff(!showDiff)}
              className={`px-3 py-1 text-sm rounded-md transition-colors duration-200 ${
                showDiff 
                  ? 'bg-blue-100 text-blue-800' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {showDiff ? 'Hide Diff' : 'Show Diff'}
            </button>
            <button
              onClick={handleRestoreVersion}
              className="px-3 py-1 text-sm bg-green-100 text-green-800 hover:bg-green-200 rounded-md transition-colors duration-200"
            >
              Restore Version
            </button>
          </div>
        )}
      </div>

      {/* Version List */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-3">
          {/* Current Version */}
          {showCurrentFirst && (
            <div className="border border-blue-200 rounded-lg p-3 bg-blue-50">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-blue-900">{currentVersionLabel}</div>
                  <div className="text-sm text-blue-700">{formatDate(new Date(), 'relative')}</div>
                </div>
                <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                  Current
                </span>
              </div>
              {/* Content preview */}
              <div className="mt-2 text-xs text-blue-600">
                {currentContent ? `${currentContent.length} characters` : 'No content'}
              </div>
            </div>
          )}

          {/* Version History */}
          {filteredVersions.length === 0 && searchTerm && (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No versions found for "{searchTerm}"</p>
            </div>
          )}
          
          {filteredVersions.map((version, index) => (
            <div
              key={version.id}
              className={`border rounded-lg p-3 cursor-pointer transition-all duration-200 ${
                selectedVersion?.id === version.id
                  ? 'border-blue-300 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => handleVersionSelect(version)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-gray-900">
                    Version {versions.length - versions.indexOf(version)}
                  </div>
                  <div className="text-sm text-gray-500">
                    {formatDate(version.created_at, 'relative')}
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    {formatDate(version.created_at, 'MMM dd, yyyy HH:mm')}
                  </div>
                </div>
                {selectedVersion?.id === version.id && (
                  <span className="px-2 py-1 bg-blue-200 text-blue-800 text-xs rounded-full">
                    Selected
                  </span>
                )}
              </div>
              
              {/* Version stats and type */}
              <div className="mt-2 flex items-center justify-between">
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <span>{version.content?.length || 0} characters</span>
                  <span>{(version.content?.split('\n') || []).length} lines</span>
                </div>
                {version.customization_context && (
                  <span className="px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
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
        <div className="flex-1 border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Changes from Version {versions.length - versions.findIndex(v => v.id === selectedVersion.id)} to Current
            </h4>
            <div className="bg-white border rounded-lg max-h-96 overflow-y-auto">
              <div className="divide-y divide-gray-100">
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
                <div className="px-4 py-2 text-center text-sm text-gray-500 bg-gray-50">
                  Showing first 50 changes. Full diff available in editor.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Selected Version Preview */}
      {selectedVersion && !showDiff && (
        <div className="flex-1 border-t border-gray-200 bg-gray-50">
          <div className="p-4">
            <h4 className="font-medium text-gray-900 mb-3">
              Version {versions.length - versions.findIndex(v => v.id === selectedVersion.id)} Preview
            </h4>
            {selectedVersion.customization_context && (
              <div className="mb-3 p-3 bg-purple-50 border border-purple-200 rounded-lg">
                <p className="text-xs text-purple-800 font-medium mb-1">AI Customization Context:</p>
                <p className="text-xs text-purple-700">
                  {selectedVersion.customization_context.substring(0, 200)}...
                </p>
              </div>
            )}
            <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">
                {selectedVersion.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}