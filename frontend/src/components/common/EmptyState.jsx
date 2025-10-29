import React from 'react';
import styles from './Common.module.css';

const EmptyState = ({ icon, title, description, actions }) => {
  return (
    <div className={styles.emptyState}>
      {icon && <div className={styles.emptyStateIcon}>{icon}</div>}
      <h3 className={styles.emptyStateTitle}>{title}</h3>
      <p className={styles.emptyStateDescription}>{description}</p>
      {actions && <div className={styles.emptyStateActions}>{actions}</div>}
    </div>
  );
};

export default EmptyState;
