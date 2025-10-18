import { useState, useMemo } from 'react';
import clsx from 'clsx';
import CoverLetterCard from './CoverLetterCard';
import styles from './CoverLetterList.module.css';

/**
 * CoverLetterList Component
 * Displays a filterable and searchable list of cover letters
 * 
 * Props:
 *  - coverLetters: array of cover letter objects
 *  - loading: boolean indicating loading state
 *  - onSelectCoverLetter: callback when a cover letter is selected
 *  - onDelete: callback when delete action triggered
 */
export default function CoverLetterList({ 
  coverLetters = [],
  loading = false,
  onSelectCoverLetter,
  onDelete,
  onEdit
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState('grid');

  // Filter and search
  const filteredLetters = useMemo(() => {
    return coverLetters.filter(letter => {
      const matchesSearch = 
        letter.title?.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSearch;
    });
  }, [coverLetters, searchTerm]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner} />
        <p className={styles.loadingText}>Loading cover letters...</p>
      </div>
    );
  }

  if (coverLetters.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>📄</div>
        <h3 className={styles.emptyTitle}>No Cover Letters Yet</h3>
        <p className={styles.emptyText}>
          Create your first cover letter to get started
        </p>
      </div>
    );
  }

  if (filteredLetters.length === 0) {
    return (
      <div className={styles.emptyState}>
        <div className={styles.emptyIcon}>🔍</div>
        <h3 className={styles.emptyTitle}>No Results Found</h3>
        <p className={styles.emptyText}>
          Try adjusting your search or filters
        </p>
      </div>
    );
  }

  return (
    <div className={styles.listContainer}>
      {/* Filters and Search */}
      <div className={styles.controlsSection}>
        <div className={styles.searchBox}>
          <svg className={styles.searchIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            className={styles.searchInput}
            placeholder="Search cover letters..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        <div className={styles.filtersRow}>
          <div className={styles.viewModeButtons}>
            <button
              className={clsx(styles.viewButton, viewMode === 'grid' && styles.viewButtonActive)}
              onClick={() => setViewMode('grid')}
              title="Grid view"
            >
              ⊞
            </button>
            <button
              className={clsx(styles.viewButton, viewMode === 'list' && styles.viewButtonActive)}
              onClick={() => setViewMode('list')}
              title="List view"
            >
              ≡
            </button>
          </div>
        </div>

        <div className={styles.resultsInfo}>
          Showing {filteredLetters.length} of {coverLetters.length} cover letters
        </div>
      </div>

      {/* Cover Letters Grid/List */}
      <div className={clsx(
        styles.lettersList,
        viewMode === 'grid' ? styles.gridView : styles.listView
      )}>
        {filteredLetters.map(letter => (
          <CoverLetterCard
            key={letter.id}
            coverLetter={letter}
            onView={onSelectCoverLetter}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
