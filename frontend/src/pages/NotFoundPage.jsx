import { Link } from 'react-router-dom';
import styles from '../styles/modules/pages/NotFoundPage.module.css';

export default function NotFoundPage() {
  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <main className={styles.main}>
          <p className={styles.errorCode}>404</p>
          <div className={styles.messageSection}>
            <div className={styles.messageContainer}>
              <h1 className={styles.title}>
                Page not found
              </h1>
              <p className={styles.subtitle}>
                Please check the URL in the address bar and try again.
              </p>
            </div>
            <div className={styles.actionsContainer}>
              <Link
                to="/"
                className={styles.homeButton}
              >
                Go back home
              </Link>
              <Link
                to="/resumes"
                className={styles.resumesButton}
              >
                View Resumes
              </Link>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
