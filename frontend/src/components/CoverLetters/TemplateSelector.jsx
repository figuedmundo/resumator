import { useState } from 'react';
import clsx from 'clsx';
import styles from './TemplateSelector.module.css';

/**
 * TemplateSelector Component
 * Dropdown or card grid to select cover letter templates
 * 
 * Props:
 *  - templates: array of template objects
 *  - selectedTemplate: currently selected template
 *  - onSelect: callback when template is selected
 *  - displayMode: 'dropdown' or 'grid' (default: 'grid')
 */
export default function TemplateSelector({ 
  templates = [], 
  selectedTemplate, 
  onSelect,
  displayMode = 'grid'
}) {
  const [showPreview, setShowPreview] = useState(null);
  const [expandedDropdown, setExpandedDropdown] = useState(false);

  const defaultTemplates = [
    {
      id: 'professional',
      name: 'Professional',
      description: 'Classic and formal cover letter format',
      preview: 'Dear [Hiring Manager],\n\nI am writing to express my strong interest in the [Position] role at [Company]...'
    },
    {
      id: 'modern',
      name: 'Modern',
      description: 'Contemporary style with clean formatting',
      preview: '[Your Name]\n[Your Email] | [Your Phone]\n\n[Company Name]\n[Position Title]\n\nI\'m excited to apply for...'
    },
    {
      id: 'creative',
      name: 'Creative',
      description: 'Engaging format for creative roles',
      preview: 'Greetings!\n\nI\'ve been following [Company]\'s work and would love to contribute to your team...'
    },
    {
      id: 'concise',
      name: 'Concise',
      description: 'Straight to the point, for quick readers',
      preview: 'To: [Hiring Manager]\nRe: Application for [Position]\n\nI\'m interested in the [Position] at [Company]...'
    }
  ];

  const templateList = templates.length > 0 ? templates : defaultTemplates;

  if (displayMode === 'dropdown') {
    return (
      <div className={styles.dropdownContainer}>
        <label className={styles.label}>Select Template</label>
        <div className={styles.dropdownWrapper}>
          <button
            className={styles.dropdownButton}
            onClick={() => setExpandedDropdown(!expandedDropdown)}
          >
            <span className={styles.selectedValue}>
              {selectedTemplate?.name || 'Choose a template...'}
            </span>
            <svg className={clsx(styles.chevron, expandedDropdown && styles.chevronOpen)}>
              <path d="M19 9l-7 7-7-7" stroke="currentColor" strokeWidth={2} fill="none" />
            </svg>
          </button>

          {expandedDropdown && (
            <div className={styles.dropdownMenu}>
              {templateList.map(template => (
                <button
                  key={template.id}
                  className={clsx(
                    styles.dropdownItem,
                    selectedTemplate?.id === template.id && styles.dropdownItemSelected
                  )}
                  onClick={() => {
                    onSelect(template);
                    setExpandedDropdown(false);
                  }}
                >
                  <div className={styles.dropdownItemContent}>
                    <div className={styles.dropdownItemName}>{template.name}</div>
                    <div className={styles.dropdownItemDesc}>{template.description}</div>
                  </div>
                  {selectedTemplate?.id === template.id && (
                    <span className={styles.checkmark}>✓</span>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // Grid view
  return (
    <div className={styles.gridContainer}>
      <div className={styles.gridHeader}>
        <h3 className={styles.gridTitle}>Select a Template</h3>
        <p className={styles.gridSubtitle}>Choose a starting point for your cover letter</p>
      </div>

      <div className={styles.templateGrid}>
        {templateList.map(template => (
          <div
            key={template.id}
            className={clsx(
              styles.templateCard,
              selectedTemplate?.id === template.id && styles.templateCardSelected
            )}
          >
            <div className={styles.cardHeader}>
              <h4 className={styles.cardTitle}>{template.name}</h4>
              {selectedTemplate?.id === template.id && (
                <span className={styles.selectedBadge}>Selected</span>
              )}
            </div>

            <p className={styles.cardDescription}>{template.description}</p>

            <div className={styles.cardPreview}>
              <pre className={styles.previewText}>{template.preview}</pre>
            </div>

            <div className={styles.cardActions}>
              <button
                className={styles.previewButton}
                onClick={() => setShowPreview(showPreview?.id === template.id ? null : template)}
              >
                {showPreview?.id === template.id ? 'Hide Preview' : 'Preview'}
              </button>
              <button
                className={clsx(
                  styles.selectButton,
                  selectedTemplate?.id === template.id && styles.selectButtonActive
                )}
                onClick={() => onSelect(template)}
              >
                {selectedTemplate?.id === template.id ? 'Selected' : 'Select'}
              </button>
            </div>

            {/* Expanded Preview */}
            {showPreview?.id === template.id && (
              <div className={styles.expandedPreview}>
                <div className={styles.expandedPreviewContent}>
                  {template.preview.split('\n').map((line, i) => (
                    <p key={i} className={styles.previewLine}>
                      {line || '\u00A0'}
                    </p>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
