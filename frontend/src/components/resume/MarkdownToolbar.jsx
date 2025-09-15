import { useState } from 'react';
import clsx from 'clsx';
import styles from './MarkdownToolbar.module.css';

export default function MarkdownToolbar({ onInsert }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTemplateMenuVisible, setIsTemplateMenuVisible] = useState(false);

  const toolbarItems = [
    {
      id: 'heading1',
      icon: 'H1',
      title: 'Heading 1',
      shortcut: 'Ctrl+1',
      text: '# ',
    },
    {
      id: 'heading2',
      icon: 'H2',
      title: 'Heading 2',
      shortcut: 'Ctrl+2',
      text: '## ',
    },
    {
      id: 'heading3',
      icon: 'H3',
      title: 'Heading 3',
      shortcut: 'Ctrl+3',
      text: '### ',
    },
    {
      id: 'bold',
      icon: (
        <svg className={styles.toolIconSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M15.6 10.79c.97-.67 1.65-1.77 1.65-2.79 0-2.26-1.75-4-4-4H7v14h7.04c2.09 0 3.71-1.7 3.71-3.79 0-1.52-.86-2.82-2.15-3.42zM10 6.5h3c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5h-3v-3zm3.5 9H10v-3h3.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5z"/>
        </svg>
      ),
      title: 'Bold',
      shortcut: 'Ctrl+B',
      text: '**bold text**',
    },
    {
      id: 'italic',
      icon: (
        <svg className={styles.toolIconSvg} fill="currentColor" viewBox="0 0 24 24">
          <path d="M10 4v3h2.21l-3.42 8H6v3h8v-3h-2.21l3.42-8H18V4h-8z"/>
        </svg>
      ),
      title: 'Italic',
      shortcut: 'Ctrl+I',
      text: '*italic text*',
    },
    {
      id: 'divider1',
      type: 'divider',
    },
    {
      id: 'bullet-list',
      icon: (
        <svg className={styles.toolIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      ),
      title: 'Bullet List',
      text: '\n- List item 1\n- List item 2\n- List item 3\n',
    },
    {
      id: 'numbered-list',
      icon: (
        <svg className={styles.toolIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2M7 4h10M7 4l-2 2m12-2l2 2M5 8v8a1 1 0 001 1h12a1 1 0 001-1V8M9 12h6" />
        </svg>
      ),
      title: 'Numbered List',
      text: '\n1. First item\n2. Second item\n3. Third item\n',
    },
    {
      id: 'link',
      icon: (
        <svg className={styles.toolIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      ),
      title: 'Link',
      text: '[link text](https://example.com)',
    },
    {
      id: 'divider2',
      type: 'divider',
    },
    {
      id: 'code',
      icon: (
        <svg className={styles.toolIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
        </svg>
      ),
      title: 'Inline Code',
      text: '`code`',
    },
    {
      id: 'code-block',
      icon: (
        <svg className={styles.toolIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
      ),
      title: 'Code Block',
      text: '\n```\ncode block\n```\n',
    },
    {
      id: 'table',
      icon: (
        <svg className={styles.toolIconSvg} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0V4a1 1 0 011-1h16a1 1 0 011 1v16a1 1 0 01-1 1H5a1 1 0 01-1-1V10z" />
        </svg>
      ),
      title: 'Table',
      text: '\n| Header 1 | Header 2 | Header 3 |\n|----------|----------|----------|\n| Row 1    | Data     | Data     |\n| Row 2    | Data     | Data     |\n',
    },
    {
      id: 'divider3',
      type: 'divider',
    },
    {
      id: 'horizontal-rule',
      icon: '—',
      title: 'Horizontal Rule',
      text: '\n---\n',
    },
  ];

  const resumeTemplates = [
    {
      id: 'experience',
      title: 'Professional Experience',
      text: '\n### Job Title\n**Company Name** | Location | Start Date - End Date\n\n- Key responsibility or achievement\n- Use action verbs and quantify results\n- Include technologies used and impact\n\n',
    },
    {
      id: 'project',
      title: 'Project Entry',
      text: '\n### Project Name\n**Technologies:** List technologies used\n- Brief description of the project\n- What problem it solved or what you learned\n- Link to demo or repository if available\n\n',
    },
    {
      id: 'education',
      title: 'Education Entry',
      text: '\n### Degree Name\n**University Name** | Location | Graduation Year\n- **GPA:** 3.X/4.0 (if relevant)\n- **Relevant Coursework:** List relevant courses\n\n',
    },
    {
      id: 'skills',
      title: 'Skills Section',
      text: '\n## Technical Skills\n\n### Programming Languages\n- Language 1 (Proficiency Level)\n- Language 2 (Proficiency Level)\n\n### Frameworks & Technologies\n- Framework/Tool 1\n- Framework/Tool 2\n\n',
    },
  ];

  const handleInsert = (item) => {
    if (onInsert && item.text) {
      onInsert(item.text);
    }
  };

  return (
    <div className={styles.toolbar}>
      <div className={styles.container}>
        <div className={styles.toolbarRow}>
          <div className={styles.toolsSection}>
            {/* Basic formatting tools - always visible */}
            {toolbarItems.slice(0, 8).map((item) => {
              if (item.type === 'divider') {
                return <div key={item.id} className={styles.divider} />;
              }

              return (
                <button
                  key={item.id}
                  onClick={() => handleInsert(item)}
                  className={clsx(styles.toolButton, "hover:text-gray-900 hover:bg-gray-100")}
                  title={`${item.title}${item.shortcut ? ` (${item.shortcut})` : ''}`}
                >
                  {typeof item.icon === 'string' ? (
                    <span className={styles.toolIcon}>{item.icon}</span>
                  ) : (
                    item.icon
                  )}
                </button>
              );
            })}

            {/* Expandable section */}
            {isExpanded && (
              <>
                {toolbarItems.slice(8).map((item) => {
                  if (item.type === 'divider') {
                    return <div key={item.id} className={styles.divider} />;
                  }

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleInsert(item)}
                      className={clsx(styles.toolButton, "hover:text-gray-900 hover:bg-gray-100")}
                      title={item.title}
                    >
                      {typeof item.icon === 'string' ? (
                        <span className={styles.toolIcon}>{item.icon}</span>
                      ) : (
                        item.icon
                      )}
                    </button>
                  );
                })}

                <div className={styles.divider} />

                {/* Resume Template Dropdown */}
                <div
                  className={styles.templateDropdown}
                  onMouseEnter={() => setIsTemplateMenuVisible(true)}
                  onMouseLeave={() => setIsTemplateMenuVisible(false)}
                >
                  <button className={clsx(styles.templateButton, "hover:text-gray-900 hover:bg-gray-100")}>
                    <svg className={styles.templateButtonIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className={styles.templateButtonText}>Templates</span>
                    <svg className={styles.templateButtonChevron} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  <div className={clsx(
                    styles.templateMenu,
                    isTemplateMenuVisible && styles.templateMenuVisible
                  )}>
                    <div className={styles.templateMenuContent}>
                      {resumeTemplates.map((template) => (
                        <button
                          key={template.id}
                          onClick={() => handleInsert(template)}
                          className={clsx(styles.templateMenuItem, "hover:bg-gray-100")}
                        >
                          {template.title}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Expand/Collapse Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={clsx(styles.expandButton, "hover:text-gray-900 hover:bg-gray-100")}
            title={isExpanded ? 'Show Less' : 'Show More'}
          >
            <svg 
              className={clsx(
                styles.expandIcon,
                isExpanded && styles.expandIconRotated
              )} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>

        {/* Quick Tips */}
        {isExpanded && (
          <div className={styles.quickTips}>
            <div className={styles.quickTipsContent}>
              <span className={styles.quickTipsLabel}>💡 Tips:</span>
              <span className={styles.quickTip}>Use **bold** for company names</span>
              <span className={styles.quickTip}>Use bullet points for achievements</span>
              <span className={styles.quickTip}>Quantify results with numbers</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
