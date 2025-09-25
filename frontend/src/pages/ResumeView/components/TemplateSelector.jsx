import { useState, useEffect } from "react";
import clsx from 'clsx';
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import apiService from "../../../services/secureApi";
import { devLog } from "@/utils/helpers";
import TemplateCard from "./TemplateCard";
import { defaultTemplates } from "@/config/templateConfig";
import styles from './TemplateSelector.module.css';

const TemplateSelector = ({
  selectedTemplate = "modern",
  onTemplateChange,
  className = "",
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadTemplates = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await apiService.getPDFTemplates();

        const enrichedTemplates = (response?.templates || []).map((t) => {
          const fallback = defaultTemplates.find((d) => d.id === t.id) || {};
          return {
            ...fallback,
            ...t,
            name: t.name || fallback.name,
            description: t.description || fallback.description,
          };
        });

        setTemplates(
          enrichedTemplates.length > 0 ? enrichedTemplates : defaultTemplates
        );
        devLog("Templates loaded:", enrichedTemplates);
      } catch (err) {
        console.error("Failed to load templates:", err);
        setError("Failed to load templates");
        setTemplates(defaultTemplates);
      } finally {
        setLoading(false);
      }
    };

    loadTemplates();
  }, []);

  const handleTemplateSelect = (templateId) => {
    if (onTemplateChange && templateId !== selectedTemplate) {
      onTemplateChange(templateId);
      devLog("Template selected:", templateId);
    }
  };

  if (loading) {
    return (
      <div className={clsx(styles.loadingContainer, className)}>
        <div className={styles.loadingContent}>
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  const selectedTemplateData = templates.find((t) => t.id === selectedTemplate);

  return (
    <div className={clsx(styles.container, className)}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div className={styles.headerText}>
            <h3 className={styles.title}>
              Template Selection
            </h3>
            <p className={styles.subtitle}>
              Choose a template style for your resume
            </p>
          </div>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Template Grid */}
      <div className={styles.content}>
        <div className={styles.templateGrid}>
          {templates.map((template) => (
            <TemplateCard
              key={template.id}
              template={template}
              selected={selectedTemplate === template.id}
              onSelect={handleTemplateSelect}
            />
          ))}
        </div>

        {/* Selected Template Info */}
        {selectedTemplate && selectedTemplateData && (
          <div className={styles.selectedInfo}>
            <div className={styles.selectedInfoContent}>
              <div className={styles.selectedIcon}>
                <svg
                  className={styles.selectedIconSvg}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className={styles.selectedText}>
                <div className={styles.selectedTitle}>
                  {selectedTemplateData.name} Template Selected
                </div>
                <div className={styles.selectedDescription}>
                  Your resume will be generated using this template style
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TemplateSelector;
