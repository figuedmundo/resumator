import React, { useState, useEffect } from 'react';
import apiService from '@/services/api';
import styles from './CoverLetterSelector.module.css';

const CoverLetterSelector = ({ onSelect, selectedCoverLetter }) => {
    const [coverLetters, setCoverLetters] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchCoverLetters = async () => {
            setIsLoading(true);
            try {
                const response = await apiService.getCoverLetters();
                setCoverLetters(response.cover_letters || []);
            } catch (error) {
                console.error('Failed to fetch cover letters', error);
            }
            setIsLoading(false);
        };

        fetchCoverLetters();
    }, []);

    return (
        <div className={styles.selectorContainer}>
            <label htmlFor="cover-letter-select">Cover Letter</label>
            <select
                id="cover-letter-select"
                value={selectedCoverLetter || ''}
                onChange={(e) => onSelect(e.target.value ? parseInt(e.target.value) : null)}
                disabled={isLoading}
            >
                <option value="">No cover letter</option>
                {coverLetters.map((cl) => (
                    <option key={cl.id} value={cl.id}>
                        {cl.title}
                    </option>
                ))}
            </select>
            {/* TODO: Add options to create from template */}
        </div>
    );
};

export default CoverLetterSelector;
