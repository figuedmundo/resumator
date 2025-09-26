import { useState, useEffect } from "react";
import clsx from 'clsx';
import LoadingSpinner from "../../../components/LoadingSpinner/LoadingSpinner";
import apiService from "../../../services/secureApi";
import { devLog } from "@/utils/helpers";
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

      {/* Template Cards */}
      <div className={styles.content}>
        <div className={styles.templateCards}>
          {templates.map((template) => (
            <button
              key={template.id}
              onClick={() => handleTemplateSelect(template.id)}
              className={clsx(
                styles.templateCard,
                selectedTemplate === template.id ? styles.templateCardSelected : styles.templateCardDefault
              )}
            >
              <div className={styles.templateCardContent}>
                <div className={styles.templateCardHeader}>
                  <span className={styles.templateName}>{template.name}</span>
                  {selectedTemplate === template.id && (
                    <div className={styles.selectedBadge}>
                      <svg
                        className={styles.selectedIcon}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                  )}
                </div>
                <p className={styles.templateDescription}>{template.description}</p>
                {template.features && (
                  <div className={styles.templateFeatures}>
                    {template.features.slice(0, 2).map((feature, index) => (
                      <span key={index} className={styles.featureTag}>
                        {feature}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default TemplateSelector;
