import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import clsx from 'clsx';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../services/api';
import styles from './DashboardPage.module.css';

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalResumes: 0,
    totalCoverLetters: 0,
    totalApplications: 0,
    recentResumes: [],
    recentCoverLetters: [],
    recentApplications: []
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Fetch dashboard statistics
      const [resumesResponse, coverLettersResponse, applicationsResponse] = await Promise.all([
        apiService.getResumes({ limit: 5 }),
        apiService.getCoverLetters({ limit: 5 }),
        apiService.getApplications({ limit: 5 })
      ]);

      setStats({
        totalResumes: resumesResponse.total || resumesResponse.length,
        totalCoverLetters: coverLettersResponse.total || coverLettersResponse.length,
        totalApplications: applicationsResponse.total || applicationsResponse.length,
        recentResumes: resumesResponse.resumes || resumesResponse.slice(0, 5),
        recentCoverLetters: coverLettersResponse.cover_letters || coverLettersResponse.slice(0, 5),
        recentApplications: applicationsResponse.applications || applicationsResponse.slice(0, 5)
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'Applied':
        return styles.statusBadgeApplied;
      case 'Interviewing':
        return styles.statusBadgeInterviewing;
      case 'Offer':
        return styles.statusBadgeOffer;
      case 'Rejected':
        return styles.statusBadgeRejected;
      default:
        return styles.statusBadgeDefault;
    }
  };

  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Welcome Header */}
      <div className={styles.welcomeSection}>
        <h1 className={styles.welcomeTitle}>
          Welcome back, {user?.full_name?.split(' ')[0] || 'User'}!
        </h1>
        <p className={styles.welcomeSubtitle}>
          Manage your resumes, cover letters, and job applications all in one place.
        </p>
      </div>

      {/* Error Alert */}
      {error && (
        <div className={styles.errorAlert}>
          <div className={styles.errorContent}>
            <svg className={styles.errorIcon} viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            <div className={styles.errorText}>
              <p className={styles.errorMessage}>{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statsCard}>
          <div className={styles.statsCardContent}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIcon}>
                <svg className={styles.statsIconResumes} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className={styles.statsCardData}>
                <dl>
                  <dt className={styles.statsCardLabel}>Total Resumes</dt>
                  <dd className={styles.statsCardValue}>{stats.totalResumes}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className={styles.statsCardFooter}>
            <Link to="/resumes" className={clsx(styles.statsCardLink, styles.statsCardLinkResumes)}>
              View all resumes
            </Link>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsCardContent}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIcon}>
                <svg className={styles.statsIconCoverLetters} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className={styles.statsCardData}>
                <dl>
                  <dt className={styles.statsCardLabel}>Total Cover Letters</dt>
                  <dd className={styles.statsCardValue}>{stats.totalCoverLetters}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className={styles.statsCardFooter}>
            <Link to="/cover-letters" className={clsx(styles.statsCardLink, styles.statsCardLinkCoverLetters)}>
              View all cover letters
            </Link>
          </div>
        </div>

        <div className={styles.statsCard}>
          <div className={styles.statsCardContent}>
            <div className={styles.statsCardInner}>
              <div className={styles.statsCardIcon}>
                <svg className={styles.statsIconApplications} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
                </svg>
              </div>
              <div className={styles.statsCardData}>
                <dl>
                  <dt className={styles.statsCardLabel}>Total Applications</dt>
                  <dd className={styles.statsCardValue}>{stats.totalApplications}</dd>
                </dl>
              </div>
            </div>
          </div>
          <div className={styles.statsCardFooter}>
            <Link to="/applications" className={clsx(styles.statsCardLink, styles.statsCardLinkApplications)}>
              View all applications
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActionsSection}>
        <h2 className={styles.quickActionsTitle}>Quick Actions</h2>
        <div className={styles.quickActionsGrid}>
          <Link to="/resumes/new" className={styles.quickActionCard}>
            <div className={styles.quickActionContent}>
              <div className={clsx(styles.quickActionIcon, styles.quickActionIconResume)}>
                <svg className={clsx(styles.quickActionIconSvg, styles.quickActionIconSvgResume)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className={styles.quickActionText}>
                <h3 className={styles.quickActionTitle}>Create New Resume</h3>
                <p className={styles.quickActionDescription}>Upload or create a new resume</p>
              </div>
            </div>
          </Link>

          <Link to="/cover-letters/new" className={styles.quickActionCard}>
            <div className={styles.quickActionContent}>
              <div className={clsx(styles.quickActionIcon, styles.quickActionIconCoverLetter)}>
                <svg className={clsx(styles.quickActionIconSvg, styles.quickActionIconSvgCoverLetter)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className={styles.quickActionText}>
                <h3 className={styles.quickActionTitle}>Create New Cover Letter</h3>
                <p className={styles.quickActionDescription}>Generate or write a cover letter</p>
              </div>
            </div>
          </Link>

          <Link to="/applications/new" className={styles.quickActionCard}>
            <div className={styles.quickActionContent}>
              <div className={clsx(styles.quickActionIcon, styles.quickActionIconApplication)}>
                <svg className={clsx(styles.quickActionIconSvg, styles.quickActionIconSvgApplication)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <div className={styles.quickActionText}>
                <h3 className={styles.quickActionTitle}>Track New Application</h3>
                <p className={styles.quickActionDescription}>Add a new job application</p>
              </div>
            </div>
          </Link>
        </div>
      </div>

      {/* Documents Section - Resumes & Cover Letters Side by Side */}
      <div className={styles.documentsSection}>
        <h2 className={styles.documentsSectionTitle}>Your Documents</h2>
        <div className={styles.documentsGrid}>
          {/* Recent Resumes */}
          <div className={styles.documentCard}>
            <div className={styles.documentCardHeader}>
              <h3 className={styles.documentCardTitle}>
                <svg className={styles.documentCardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Recent Resumes
              </h3>
              <Link to="/resumes" className={styles.viewAllLink}>
                View all
              </Link>
            </div>
            <div className={styles.documentCardContent}>
              {stats.recentResumes.length > 0 ? (
                <div className={styles.documentList}>
                  {stats.recentResumes.map((resume) => (
                    <div key={resume.id} className={styles.documentItem}>
                      <div className={styles.documentItemIcon}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className={styles.documentItemInfo}>
                        <Link to={`/resumes/${resume.id}`} className={styles.documentItemTitle}>
                          {resume.title || 'Untitled Resume'}
                        </Link>
                        <p className={styles.documentItemMeta}>
                          Updated {new Date(resume.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/resumes/${resume.id}/edit`} className={styles.documentItemAction}>
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className={styles.emptyStateText}>No resumes yet</p>
                  <Link to="/resumes/new" className={clsx(styles.emptyStateAction, styles.emptyStateActionResumes)}>
                    Create your first resume
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Recent Cover Letters */}
          <div className={styles.documentCard}>
            <div className={styles.documentCardHeader}>
              <h3 className={styles.documentCardTitle}>
                <svg className={styles.documentCardIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                Recent Cover Letters
              </h3>
              <Link to="/cover-letters" className={styles.viewAllLink}>
                View all
              </Link>
            </div>
            <div className={styles.documentCardContent}>
              {stats.recentCoverLetters.length > 0 ? (
                <div className={styles.documentList}>
                  {stats.recentCoverLetters.map((coverLetter) => (
                    <div key={coverLetter.id} className={styles.documentItem}>
                      <div className={styles.documentItemIcon}>
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <div className={styles.documentItemInfo}>
                        <Link to={`/cover-letters/${coverLetter.id}`} className={styles.documentItemTitle}>
                          {coverLetter.title || 'Untitled Cover Letter'}
                        </Link>
                        <p className={styles.documentItemMeta}>
                          Updated {new Date(coverLetter.updated_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Link to={`/cover-letters/${coverLetter.id}/edit`} className={styles.documentItemAction}>
                        Edit
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.emptyState}>
                  <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <p className={styles.emptyStateText}>No cover letters yet</p>
                  <Link to="/cover-letters/new" className={clsx(styles.emptyStateAction, styles.emptyStateActionCoverLetters)}>
                    Create your first cover letter
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className={styles.applicationsSection}>
        <div className={styles.applicationsSectionHeader}>
          <h2 className={styles.applicationsSectionTitle}>Recent Applications</h2>
          <Link to="/applications" className={styles.viewAllLink}>
            View all
          </Link>
        </div>
        <div className={styles.applicationsCard}>
          {stats.recentApplications.length > 0 ? (
            <div className={styles.applicationsList}>
              {stats.recentApplications.map((application) => (
                <div key={application.id} className={styles.applicationItem}>
                  <div className={styles.applicationItemLeft}>
                    <Link to={`/applications/${application.id}`} className={styles.applicationItemTitle}>
                      {application.position || 'Untitled Position'}
                    </Link>
                    <p className={styles.applicationItemCompany}>
                      {application.company} • {new Date(application.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={styles.applicationItemRight}>
                    <span className={clsx(styles.statusBadge, getStatusBadgeClass(application.status))}>
                      {application.status || 'Applied'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <svg className={styles.emptyStateIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2V6" />
              </svg>
              <p className={styles.emptyStateText}>No applications yet</p>
              <Link to="/applications/new" className={clsx(styles.emptyStateAction, styles.emptyStateActionApplications)}>
                Track your first application
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
