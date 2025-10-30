import React from 'react';
import clsx from 'clsx';
import styles from './Common.module.css';

const BaseCard = ({ header, children, footer, className }) => {
  return (
    <div className={clsx(styles.baseCard, className)}>
      {header && <div className={styles.baseCardHeader}>{header}</div>}
      <div className={styles.baseCardBody}>{children}</div>
      {footer && <div className={styles.baseCardFooter}>{footer}</div>}
    </div>
  );
};

export default BaseCard;
