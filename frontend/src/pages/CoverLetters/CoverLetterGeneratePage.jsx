import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import LoadingSpinner from '../../components/LoadingSpinner/LoadingSpinner';
import apiService from '../../services/api';
import styles from './CoverLetterGeneratePage.module.css';

export default function CoverLetterGeneratePage() {
  const navigate = useNavigate();

  // Form data
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState(null);
  const [coverLetters, setCoverLetters] = useState([]);
  const [selectedCoverLetter, setSelectedCoverLetter] = useState(null);
  const [templates, setTemplates] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [jobDetails, setJobDetails] = useState({
    title: '',
    company: '',
    position: '',
    jobDescription: '',
  });

  // State
  const [generatedContent, setGeneratedContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [resumesResponse, coverLettersResponse, templatesResponse] = await Promise.all([
          apiService.getResumes(),
          apiService.getCoverLetters(),
          apiService.getCoverLetterTemplates(),
        ]);

        const resumeList = resumesResponse.resumes || resumesResponse || [];
        setResumes(resumeList);
        if (resumeList.length > 0) {
          setSelectedResume(resumeList[0]);
        }

        const coverLetterList = coverLettersResponse.cover_letters || coverLettersResponse || [];
        setCoverLetters(coverLetterList);

        const templateList = Array.isArray(templatesResponse) ? templatesResponse : [];
        setTemplates(templateList);

      } catch (err) {
        setError('Failed to load data: ' + err.message);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleGenerate = async () => {
    if (!selectedResume) {
      setError('Please select a resume.');
      return;
    }

    if (!jobDetails.jobDescription) {
      setError('Please provide a job description.');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await apiService.generateCoverLetterAI({
        title: jobDetails.title,
        resume_id: selectedResume.id,
        company: jobDetails.company,
        position: jobDetails.position,
        job_description: jobDetails.jobDescription,
        template_id: selectedTemplate?.id,
        base_cover_letter_content: selectedCoverLetter?.markdown_content,
      });
      setGeneratedContent(response.versions[0].markdown_content || '');
    } catch (err) {
      setError('Failed to generate cover letter: ' + err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSave = async () => {
    if (!generatedContent) {
      setError('No content to save.');
      return;
    }

    try {
      const response = await apiService.createCoverLetter({
        title: `${jobDetails.company} - ${jobDetails.position}`,
        content: generatedContent,
      });
      navigate(`/cover-letters/${response.id}/edit`);
    } catch (err) {
      setError('Failed to save cover letter: ' + err.message);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className={styles.pageContainer}>
      <div className={styles.leftPanel}>
        <h1 className={styles.title}>Generate Cover Letter</h1>

        <div className={styles.formGroup}>
          <label className={styles.label}>Select Resume</label>
          <select
            className={styles.select}
            value={selectedResume?.id || ''}
            onChange={(e) => {
              const resume = resumes.find((r) => r.id === parseInt(e.target.value));
              setSelectedResume(resume);
            }}
          >
            {resumes.map((resume) => (
              <option key={resume.id} value={resume.id}>
                {resume.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Use Existing Cover Letter (Optional)</label>
          <select
            className={styles.select}
            value={selectedCoverLetter?.id || ''}
            onChange={(e) => {
              const cl = coverLetters.find((c) => c.id === parseInt(e.target.value));
              setSelectedCoverLetter(cl);
            }}
          >
            <option value="">None</option>
            {coverLetters.map((cl) => (
              <option key={cl.id} value={cl.id}>
                {cl.title}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Title</label>
          <input
            type="text"
            className={styles.input}
            value={jobDetails.title}
            onChange={(e) => setJobDetails({ ...jobDetails, title: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Company</label>
          <input
            type="text"
            className={styles.input}
            value={jobDetails.company}
            onChange={(e) => setJobDetails({ ...jobDetails, company: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Position</label>
          <input
            type="text"
            className={styles.input}
            value={jobDetails.position}
            onChange={(e) => setJobDetails({ ...jobDetails, position: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Job Description</label>
          <textarea
            className={styles.textarea}
            rows="10"
            value={jobDetails.jobDescription}
            onChange={(e) => setJobDetails({ ...jobDetails, jobDescription: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Template (Optional)</label>
          <select
            className={styles.select}
            value={selectedTemplate?.id || ''}
            onChange={(e) => {
              const t = templates.find((t) => t.id === parseInt(e.target.value));
              setSelectedTemplate(t);
            }}
          >
            <option value="">None</option>
            {templates.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>

        <button className={styles.generateButton} onClick={handleGenerate} disabled={isGenerating}>
          {isGenerating ? <LoadingSpinner size="sm" /> : 'Generate'}
        </button>

        {error && <div className={styles.error}>{error}</div>}
      </div>

      <div className={styles.rightPanel}>
        <div className={styles.previewContainer}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{generatedContent}</ReactMarkdown>
        </div>
        {generatedContent && (
          <button className={styles.saveButton} onClick={handleSave}>
            Save
          </button>
        )}
      </div>
    </div>
  );
}
