import React, { useState, useEffect } from 'react';
import apiService from '@/services/api';
import styles from './CoverLetterCustomizationModal.module.css';

const CoverLetterCustomizationModal = ({ application, onClose, onSave }) => {
    const [coverLetterContent, setCoverLetterContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (application?.cover_letter_version) {
            setCoverLetterContent(application.cover_letter_version.markdown_content);
        }
    }, [application]);

    const handleSave = async () => {
        setIsLoading(true);
        try {
            // This is a placeholder. In a real implementation, we would
            // likely have a more sophisticated way to update the content,
            // probably creating a new version.
            await apiService.updateApplication(application.id, {
                // This is not the right way to do it, we need a new endpoint
                // to update the cover letter content for an application.
            });
            onSave();
        } catch (error) {
            console.error('Failed to save customized cover letter', error);
        }
        setIsLoading(false);
    };

    if (!application) return null;

    return (
        <div className={styles.modalBackdrop}>
            <div className={styles.modalContent}>
                <h2>Customize Cover Letter for {application.company}</h2>
                <textarea
                    value={coverLetterContent}
                    onChange={(e) => setCoverLetterContent(e.target.value)}
                    rows={20}
                    disabled={isLoading}
                />
                <div className={styles.modalActions}>
                    <button onClick={onClose} disabled={isLoading}>Cancel</button>
                    <button onClick={handleSave} disabled={isLoading}>
                        {isLoading ? 'Saving...' : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CoverLetterCustomizationModal;
