import ApplicationList from '../components/application/ApplicationList';
import styles from '../styles/modules/pages/ApplicationsPage.module.css';

export default function ApplicationsPage() {
  return (
    <div className={styles.container}>
      <ApplicationList />
    </div>
  );
}
