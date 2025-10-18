import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import apiService from '../../services/api';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import styles from './CoverLetterDetailPage.module.css';

export default function CoverLetterDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [coverLetter, setCoverLetter] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCoverLetter = async () => {
      try {
        const data = await apiService.getCoverLetter(id);
        setCoverLetter(data);
      } catch (err) {
        setError(err.message);
      }
      setIsLoading(false);
    };

    fetchCoverLetter();
  }, [id]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return <div className={styles.errorContainer}>{error}</div>;
  }

  if (!coverLetter) {
    return <div>Cover letter not found.</div>;
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.header}>
        <button onClick={() => navigate('/cover-letters')} className={styles.backButton}>
          &larr; Back to Cover Letters
        </button>
        <h1 className={styles.title}>{coverLetter.title}</h1>
        <Link to={`/cover-letters/${id}/edit`} className={styles.editButton}>
          Edit
        </Link>
      </div>
      <div className={styles.contentContainer}>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {coverLetter.versions.length > 0 ? coverLetter.versions[0].markdown_content : ''}
        </ReactMarkdown>
      </div>
    </div>
  );
}
