import ApplicationList from './components/ApplicationList';
import styles from './ApplicationsPage.module.css';

export default function ApplicationsPage() {
  return (
    <div className={styles.container}>
      <ApplicationList />
    </div>
  );
}
