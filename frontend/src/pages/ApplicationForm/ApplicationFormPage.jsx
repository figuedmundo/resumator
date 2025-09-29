import { useParams } from 'react-router-dom';
import ApplicationWizard from './components/ApplicationWizard';
import styles from './ApplicationFormPage.module.css';

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
            : 'Create a new job application with AI-powered resume customization'
          }
        </p>
      </div>

      <ApplicationWizard applicationId={id} />
    </div>
  );
}
