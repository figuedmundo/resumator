import { Link } from 'react-router-dom';
import clsx from 'clsx';
import styles from '../../pages/Resumes/ResumesPage.module.css';

const ResumeCard = ({ resume, onDeleteClick }) => {

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'active':
        return styles.statusActive;
      case 'draft':
        return styles.statusDraft;
      default:
        return styles.statusDefault;
    }
  };

  return (
    <div className={clsx(styles.resumeCard, "hover:shadow-md")}>
      <div className={styles.resumeCardContent}>
        <div className={styles.resumeCardHeader}>
          <h3 className={styles.resumeTitle}>
            {resume.title || 'Untitled Resume'}
          </h3>
          <div className={styles.statusBadge}>
            <span className={clsx(
              styles.statusBadgeInner,
              getStatusBadgeClass(resume.status)
            )}>
              {resume.status || 'Draft'}
            </span>
          </div>
        </div>
        <p className={styles.resumeDescription}>
          {resume.description || 'No description available.'}
        </p>
        <div className={styles.resumeMeta}>
          <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Updated {new Date(resume.updated_at).toLocaleDateString()}
        </div>
        <div className={styles.resumeMeta}>
          <svg className={styles.metaIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17v4a2 2 0 002 2h4M13 13h4a2 2 0 012 2v4a2 2 0 01-2 2h-4m-6-6V9a2 2 0 012-2h2m0 0V5a2 2 0 012-2h4a2 2 0 012 2v2m0 0a2 2 0 01-2 2h-4a2 2 0 01-2-2V5z" />
          </svg>
          {resume.versions?.length || 1} version{(resume.versions?.length || 1) !== 1 ? 's' : ''}
        </div>
      </div>
      <div className={styles.resumeFooter}>
        <div className={styles.resumeActions}>
          <Link
            to={`/resumes/${resume.id}`}
            className={clsx(
              styles.actionLink,
              styles.actionLinkView,
              "hover:text-blue-500 transition-colors duration-200"
            )}
          >
            View
          </Link>
          <Link
            to={`/resumes/${resume.id}/edit`}
            className={clsx(
              styles.actionLink,
              styles.actionLinkEdit,
              "hover:text-gray-500 transition-colors duration-200"
            )}
          >
            Edit
          </Link>
          <Link
            to={`/resumes/${resume.id}/customize`}
            className={clsx(
              styles.actionLink,
              styles.actionLinkCustomize,
              "hover:text-green-500 transition-colors duration-200"
            )}
          >
            Customize
          </Link>
          <button
            onClick={() => onDeleteClick(resume)}
            className={clsx(
              styles.actionLink,
              styles.actionLinkDelete,
              "hover:text-red-500 transition-colors duration-200"
            )}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ResumeCard;
