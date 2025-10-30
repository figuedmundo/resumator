import React from 'react';
import styles from './Common.module.css';

const PageLayout = ({ children }) => {
  return (
    <div className={styles.pageLayout}>
      {children}
    </div>
  );
};

export default PageLayout;
