import { useState, useEffect } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import apiService from "../../services/api";
import { devLog } from "../../utils/helpers";
import TemplateCard from "./TemplateCard";
import { defaultTemplates } from "../../config/templateConfig";

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
      <div
        className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}
      >
        <div className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" />
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border border-gray-200 ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Template Selection
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Choose a template style for your resume
            </p>
          </div>
          {error && (
            <div className="text-sm text-red-600 bg-red-50 px-3 py-1 rounded-md">
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Template Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
        {selectedTemplate && (
          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center">
              <div className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3">
                <svg
                  className="w-5 h-5"
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
              <div>
                <div className="font-medium text-blue-900">
                  {templates.find((t) => t.id === selectedTemplate)?.name}{" "}
                  Template Selected
                </div>
                <div className="text-sm text-blue-700">
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
