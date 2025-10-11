import { useState, useEffect } from 'react';
import clsx from 'clsx';
import styles from './CoverLetterEditor.module.css';

/**
 * CoverLetterEditor Component
 * Rich text editor for cover letters with template variables support
 * 
 * Props:
 *  - initialContent: initial content for the editor
 *  - onChange: callback when content changes
 *  - onSave: callback when save button clicked
 *  - isLoading: boolean to disable form while loading
 *  - metadata: object with company, position, etc. for templates
 */
export default function CoverLetterEditor({ 
  initialContent = '', 
  onChange, 
  onSave, 
  isLoading = false,
  metadata = {}
}) {
  const [content, setContent] = useState(initialContent);
  const [showVariables, setShowVariables] = useState(false);

  useEffect(() => {
    setContent(initialContent);
  }, [initialContent]);

  const handleContentChange = (e) => {
    const newContent = e.target.value;
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }
  };

  const insertVariable = (variable) => {
    const textarea = document.querySelector(`.${styles.textarea}`);
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = 
      content.substring(0, start) + 
      `{{${variable}}}` + 
      content.substring(end);
    
    setContent(newContent);
    if (onChange) {
      onChange(newContent);
    }

    // Reset cursor position
    setTimeout(() => {
      textarea.selectionStart = start + variable.length + 4;
      textarea.selectionEnd = textarea.selectionStart;
      textarea.focus();
    }, 0);
  };

  const handleSave = () => {
    if (onSave) {
      onSave(content);
    }
  };

  const commonVariables = [
    { label: 'Company Name', value: 'company' },
    { label: 'Position Title', value: 'position' },
    { label: 'Your Name', value: 'name' },
    { label: 'Today\'s Date', value: 'date' },
    { label: 'Hiring Manager Name', value: 'hiring_manager' },
    { label: 'Job Description', value: 'job_description' },
  ];

  return (
    <div className={styles.editor}>
      <div className={styles.header}>
        <h2 className={styles.title}>Cover Letter Editor</h2>
        <p className={styles.subtitle}>Use {{variable}} syntax to insert template variables</p>
      </div>

      <div className={styles.editorContainer}>
        <textarea
          className={styles.textarea}
          value={content}
          onChange={handleContentChange}
          placeholder="Write your cover letter here... You can use {{variable}} to insert template variables."
          disabled={isLoading}
        />
      </div>

      <div className={styles.variablesSection}>
        <button
          type="button"
          className={styles.variablesToggle}
          onClick={() => setShowVariables(!showVariables)}
          disabled={isLoading}
        >
          <span className={styles.toggleIcon}>
            {showVariables ? '▼' : '▶'}
          </span>
          Insert Template Variables
        </button>

        {showVariables && (
          <div className={styles.variablesList}>
            {commonVariables.map((variable) => (
              <button
                key={variable.value}
                type="button"
                className={styles.variableButton}
                onClick={() => insertVariable(variable.value)}
                disabled={isLoading}
                title={`Insert {{${variable.value}}}`}
              >
                <span className={styles.variableLabel}>{variable.label}</span>
                <code className={styles.variableCode}>{{'{{'}{variable.value}{'}}'}}}</code>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className={styles.actions}>
        <button
          type="button"
          className={clsx(styles.button, styles.buttonPrimary)}
          onClick={handleSave}
          disabled={isLoading || !content.trim()}
        >
          {isLoading ? 'Saving...' : 'Save Cover Letter'}
        </button>
      </div>

      <div className={styles.info}>
        <p className={styles.infoText}>
          💡 Tip: Template variables like {{'{{'}}company{{'}}'}} will be automatically replaced when generating cover letters.
        </p>
      </div>
    </div>
  );
}
