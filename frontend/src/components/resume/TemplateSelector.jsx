import { useState, useEffect } from "react";
import LoadingSpinner from "../common/LoadingSpinner";
import apiService from "../../services/api";
import { devLog } from "../../utils/helpers";

const TemplateSelector = ({
  selectedTemplate = "modern",
  onTemplateChange,
  className = "",
}) => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const defaultTemplates = [
    {
      id: "modern",
      name: "Modern",
      description:
        "Clean, modern design with blue accents and professional layout",
      preview: "/api/v1/templates/modern/preview.png",
      features: ["ATS-friendly", "Color accents", "Modern typography"],
    },
    {
      id: "classic",
      name: "Classic",
      description: "Traditional black and white design with timeless appeal",
      preview: "/api/v1/templates/classic/preview.png",
      features: ["Traditional format", "Black & white", "Serif fonts"],
    },
    {
      id: "minimal",
      name: "Minimal",
      description: "Clean, contemporary design with subtle gradients",
      preview: "/api/v1/templates/minimal/preview.png",
      features: ["Minimalist", "Clean lines", "Space-efficient"],
    },
  ];

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
  }, []); // runs once

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
            <div
              key={template.id}
              className={`relative group cursor-pointer rounded-lg border-2 transition-all duration-200 hover:shadow-md ${
                selectedTemplate === template.id
                  ? "border-blue-500 bg-blue-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
              onClick={() => handleTemplateSelect(template.id)}
            >
              {/* Selection Indicator */}
              {selectedTemplate === template.id && (
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center z-10">
                  <svg
                    className="w-4 h-4"
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

              {/* Template Preview */}
              <div className="aspect-[3/4] bg-gray-100 rounded-t-lg overflow-hidden">
                <div
                  className={`w-full h-full p-4 text-xs ${
                    template.id === "modern"
                      ? "bg-gradient-to-br from-blue-50 to-blue-100 text-blue-900"
                      : template.id === "classic"
                      ? "bg-white text-gray-900 border-2 border-gray-800"
                      : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-800"
                  }`}
                >
                  <div
                    className={`font-bold text-center pb-2 mb-2 ${
                      template.id === "modern"
                        ? "border-b-2 border-blue-400"
                        : template.id === "classic"
                        ? "border-b border-gray-800"
                        : "border-b border-gray-400"
                    }`}
                  >
                    John Doe
                  </div>

                  <div
                    className={`text-xs space-y-1 ${
                      template.id === "modern"
                        ? "text-blue-800"
                        : template.id === "classic"
                        ? "text-gray-800"
                        : "text-gray-700"
                    }`}
                  >
                    <div className="font-semibold">EXPERIENCE</div>
                    <div className="h-2 bg-current opacity-20 rounded"></div>
                    <div className="h-1 bg-current opacity-20 rounded w-3/4"></div>
                    <div className="h-1 bg-current opacity-20 rounded w-1/2"></div>

                    <div className="font-semibold mt-2">EDUCATION</div>
                    <div className="h-1 bg-current opacity-20 rounded w-5/6"></div>
                    <div className="h-1 bg-current opacity-20 rounded w-2/3"></div>

                    <div className="font-semibold mt-2">SKILLS</div>
                    <div className="h-1 bg-current opacity-20 rounded w-4/5"></div>
                  </div>
                </div>
              </div>

              {/* Template Info */}
              <div className="p-4">
                <h4 className="font-semibold text-gray-900 mb-2">
                  {template.name}
                </h4>
                <p className="text-sm text-gray-600 mb-3">
                  {template.description}
                </p>

                {template.features && (
                  <div className="space-y-1">
                    {template.features.map((feature, index) => (
                      <div
                        key={index}
                        className="flex items-center text-xs text-gray-500"
                      >
                        <div
                          className={`w-2 h-2 rounded-full mr-2 ${
                            template.id === "modern"
                              ? "bg-blue-400"
                              : template.id === "classic"
                              ? "bg-gray-600"
                              : "bg-gray-400"
                          }`}
                        ></div>
                        {feature}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Hover Overlay */}
              <div
                className={`absolute inset-0 rounded-lg transition-opacity duration-200 ${
                  selectedTemplate === template.id
                    ? "opacity-0"
                    : "opacity-0 group-hover:opacity-10 bg-blue-500"
                }`}
              ></div>
            </div>
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
