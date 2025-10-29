import { useRef } from 'react';
import { EditorView } from '@codemirror/view';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } => '@codemirror/theme-one-dark';
import CodeMirror from '@uiw/react-codemirror';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { useCoverLetterEditor } from '../../hooks/useCoverLetterEditor';
import CoverLetterEditorHeader from './components/CoverLetterEditorHeader';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import MarkdownToolbar from '../ResumeEditor/components/MarkdownToolbar';
import styles from './CoverLetterEditorPage.module.css';

export default function CoverLetterEditorPage() {
  const { state, handlers } = useCoverLetterEditor();
  const codeMirrorRef = useRef(null);

  const {
    isLoading,
    error,
    viewMode,
    content,
    isDarkMode,
  } = state;

  const {
    setContent,
    setError,
  } = handlers;

  const insertMarkdown = (markdownText) => {
    const view = codeMirrorRef.current?.view;
    if (!view) return;

    const { state } = view;
    const selection = state.selection.main;
    const wrappedText = markdownText.replace(/text/, (match) =>
      selection.from !== selection.to ? state.sliceDoc(selection.from, selection.to) : match
    );

    const transaction = state.update({
      changes: { from: selection.from, to: selection.to, insert: wrappedText },
      selection: { anchor: selection.from + wrappedText.length },
    });
    view.dispatch(transaction);
    view.focus();
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <CoverLetterEditorHeader state={state} handlers={handlers} />

      {error && (
        <div className={styles.errorContainer}>
          <div className={styles.errorContent}>
            <div className={styles.errorAlert}>
              <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className={styles.errorText}>{error}</p>
              <button onClick={() => setError(null)} className={styles.errorClose}>
                <svg className={styles.errorCloseIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {viewMode === 'edit' && <MarkdownToolbar onInsert={insertMarkdown} />}

      <div className={styles.mainContent}>
        {viewMode === 'edit' ? (
          <div className={styles.editorPanelFull}>
            <div className={styles.editorWrapper}>
              <CodeMirror
                ref={codeMirrorRef}
                value={content}
                onChange={(value) => setContent(value)}
                extensions={[
                  markdown(),
                  EditorView.lineWrapping,
                  EditorView.theme({
                    '&': { fontSize: '14px' },
                    '.cm-content': { padding: '16px', minHeight: '100%' },
                    '.cm-focused': { outline: 'none' },
                    '.cm-editor': { height: '100%' },
                    '.cm-scroller': { fontFamily: 'ui-monospace, "SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace' },
                  }),
                ]}
                theme={isDarkMode ? oneDark : 'light'}
                height="100%"
                basicSetup={{
                  lineNumbers: true,
                  foldGutter: true,
                  dropCursor: false,
                  allowMultipleSelections: false,
                  highlightSelectionMatches: false,
                }}
              />
            </div>
          </div>
        ) : (
          <div className={styles.previewPanelFull}>
            <div className={styles.previewContent}>
              <div className={styles.previewProse}>
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}