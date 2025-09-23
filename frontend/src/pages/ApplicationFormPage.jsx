import { useParams } from 'react-router-dom';
import ApplicationForm from '../components/application/ApplicationForm';
import styles from '../styles/modules/pages/ApplicationFormPage.module.css';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const isEdit = !!id;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>
          {isEdit ? 'Edit Application' : 'New Application'}
        </h1>
        <p className={styles.subtitle}>
          {isEdit 
            ? 'Update your job application details'
            : 'Create a new job application to track your job search'
          }
        </p>
      </div>

      <div className={styles.formCard}>
        <ApplicationForm applicationId={id} />
      </div>
    </div>
  );
}
