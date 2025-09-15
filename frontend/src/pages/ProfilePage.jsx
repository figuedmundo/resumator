import styles from '../styles/modules/pages/ProfilePage.module.css';

export default function ProfilePage() {
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <h1 className={styles.title}>Profile Settings</h1>
        <p className={styles.subtitle}>This page will contain user profile settings.</p>
        <p className={styles.comingSoon}>Coming soon...</p>
      </div>
    </div>
  );
}
