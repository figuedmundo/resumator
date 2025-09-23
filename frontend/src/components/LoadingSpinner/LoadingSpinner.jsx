import clsx from 'clsx';
import styles from './LoadingSpinner.module.css';

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'blue', 
  text = null,
  className = '' 
}) {
  const sizeClass = {
    sm: styles.sizeSmall,
    md: styles.sizeMedium,
    lg: styles.sizeLarge,
    xl: styles.sizeExtraLarge,
  };

  const colorClass = {
    blue: styles.colorBlue,
    white: styles.colorWhite,
    gray: styles.colorGray,
    red: styles.colorRed,
    green: styles.colorGreen,
  };

  return (
    <div className={clsx(styles.container, className)}>
      <div className={styles.spinnerWrapper}>
        <svg
          className={clsx(
            styles.spinner,
            sizeClass[size],
            colorClass[color]
          )}
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className={styles.spinnerCircle}
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className={styles.spinnerPath}
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 
               0 0 5.373 0 12h4zm2 5.291A7.962 
               7.962 0 014 12H0c0 3.042 1.135 
               5.824 3 7.938l3-2.647z"
          />
        </svg>
        {text && (
          <p className={clsx(styles.text, colorClass[color])}>
            {text}
          </p>
        )}
      </div>
    </div>
  );
}

// Fullscreen loading overlay
export function LoadingOverlay({ text = 'Loading...' }) {
  return (
    <div className={styles.overlay}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Page loading component
export function PageLoading({ text = 'Loading page...' }) {
  return (
    <div className={styles.pageLoading}>
      <LoadingSpinner size="lg" text={text} />
    </div>
  );
}

// Button loading component
export function ButtonLoading({ size = 'sm', className = '' }) {
  return (
    <LoadingSpinner 
      size={size} 
      color="white" 
      className={className}
    />
  );
}

// Card loading skeleton
export function CardSkeleton({ className = '' }) {
  return (
    <div className={clsx(styles.skeleton, className)}>
      <div className={styles.cardSkeleton}>
        <div className={clsx(styles.skeletonLine, styles.skeletonLineLarge)}></div>
        <div className={clsx(styles.skeletonLine, styles.skeletonLineMedium)}></div>
        <div className={clsx(styles.skeletonLine, styles.skeletonLineSmall)}></div>
        <div className={styles.skeletonActions}>
          <div className={styles.skeletonButton}></div>
          <div className={styles.skeletonButton}></div>
        </div>
      </div>
    </div>
  );
}

// List item skeleton
export function ListItemSkeleton({ items = 3 }) {
  return (
    <div className={styles.listSkeletonContainer}>
      {Array.from({ length: items }, (_, index) => (
        <div key={index} className={styles.listSkeletonItem}>
          <div className={styles.listSkeletonItemInner}>
            <div className={styles.listSkeletonAvatar}></div>
            <div className={styles.listSkeletonContent}>
              <div className={styles.listSkeletonTitle}></div>
              <div className={styles.listSkeletonSubtitle}></div>
            </div>
            <div className={styles.listSkeletonAction}></div>
          </div>
        </div>
      ))}
    </div>
  );
}
