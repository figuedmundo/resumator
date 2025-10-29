import React from 'react';
import clsx from 'clsx';
import styles from './Common.module.css'; // Assuming pagination styles will be moved here

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePageChange = (page) => {
    if (page < 1 || page > totalPages) return;
    onPageChange(page);
  };

  const renderPageNumbers = () => {
    const pages = [];
    const maxPagesToShow = 5;
    const startPage = Math.max(1, Math.min(totalPages - maxPagesToShow + 1, currentPage - 2));
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          aria-current={currentPage === i ? 'page' : undefined}
          className={clsx(
            styles.pageNumber,
            currentPage === i ? styles.pageNumberActive : styles.pageNumberInactive
          )}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  return (
    <div className={styles.pagination}>
      <div className={styles.paginationContent}>
        {/* Mobile Pagination */}
        <div className={styles.paginationMobile}>
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={clsx(styles.paginationButton, styles.paginationButtonPrev)}
          >
            Previous
          </button>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={clsx(styles.paginationButton, styles.paginationButtonNext)}
          >
            Next
          </button>
        </div>

        {/* Desktop Pagination */}
        <div className={styles.paginationDesktop}>
          <nav className={styles.paginationNav}>
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={clsx(styles.paginationNavButton, styles.paginationNavButtonFirst)}
            >
              Previous
            </button>
            {renderPageNumbers()}
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={clsx(styles.paginationNavButton, styles.paginationNavButtonLast)}
            >
              Next
            </button>
          </nav>
        </div>
      </div>
    </div>
  );
};

export default Pagination;
