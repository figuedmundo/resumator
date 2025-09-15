import { useState } from 'react';
import clsx from 'clsx';
import styles from './TemplateCard.module.css';

const TemplateCard = ({
  template,
  selected,
  onSelect,
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getPreviewClasses = (templateId) => {
    switch (templateId) {
      case 'modern':
        return {
          preview: styles.previewModern,
          header: styles.previewHeaderModern,
          content: styles.previewContentModern,
          dot: styles.featureDotModern,
        };
      case 'classic':
        return {
          preview: styles.previewClassic,
          header: styles.previewHeaderClassic,
          content: styles.previewContentClassic,
          dot: styles.featureDotClassic,
        };
      default:
        return {
          preview: styles.previewMinimal,
          header: styles.previewHeaderMinimal,
          content: styles.previewContentMinimal,
          dot: styles.featureDotMinimal,
        };
    }
  };

  const templateClasses = getPreviewClasses(template.id);

  return (
    <div
      className={clsx(
        styles.card,
        selected ? styles.cardSelected : styles.cardDefault,
        "hover:shadow-md",
        !selected && "hover:border-gray-300"
      )}
      onClick={() => onSelect(template.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Selection Indicator */}
      {selected && (
        <div className={styles.selectionBadge}>
          <svg
            className={styles.checkIcon}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
      )}

      {/* Template Preview */}
      <div className={styles.previewContainer}>
        <div className={clsx(styles.preview, templateClasses.preview)}>
          <div className={clsx(styles.previewHeader, templateClasses.header)}>
            John Doe
          </div>

          <div className={clsx(styles.previewContent, templateClasses.content)}>
            <div className={styles.sectionTitle}>EXPERIENCE</div>
            <div className={clsx(styles.mockLine, styles.mockLineLarge)}></div>
            <div className={clsx(styles.mockLine, styles.mockLineMedium, styles.mockLineThreeQuarter)}></div>
            <div className={clsx(styles.mockLine, styles.mockLineMedium, styles.mockLineHalf)}></div>

            <div className={styles.sectionTitleSpaced}>EDUCATION</div>
            <div className={clsx(styles.mockLine, styles.mockLineMedium, styles.mockLineFiveSixth)}></div>
            <div className={clsx(styles.mockLine, styles.mockLineMedium, styles.mockLineTwoThird)}></div>

            <div className={styles.sectionTitleSpaced}>SKILLS</div>
            <div className={clsx(styles.mockLine, styles.mockLineMedium, styles.mockLineFourFifth)}></div>
          </div>
        </div>
      </div>

      {/* Template Info */}
      <div className={styles.info}>
        <h4 className={styles.title}>{template.name}</h4>
        <p className={styles.description}>{template.description}</p>

        {template.features && (
          <div className={styles.features}>
            {template.features.map((feature, index) => (
              <div key={index} className={styles.feature}>
                <div className={clsx(styles.featureDot, templateClasses.dot)}></div>
                {feature}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Hover Overlay */}
      <div
        className={clsx(
          styles.hoverOverlay,
          selected || !isHovered ? styles.hoverOverlayHidden : styles.hoverOverlayVisible
        )}
      ></div>
    </div>
  );
};

export default TemplateCard;
