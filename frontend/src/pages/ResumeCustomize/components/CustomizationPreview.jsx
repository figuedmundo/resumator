import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import styles from '../ResumeCustomizePage.module.css';

const CustomizationPreview = ({ customizedContent }) => {
  return (
    <div className="h-full bg-white border border-gray-200 rounded-lg overflow-hidden">
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900">Customized Resume Preview</h3>
        <p className="text-sm text-gray-600">Preview of your AI-customized resume</p>
      </div>
      <div className="p-8 overflow-auto h-full">
        <div className="max-w-4xl mx-auto">
          <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-ul:text-gray-700 prose-ol:text-gray-700">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {customizedContent}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPreview;
