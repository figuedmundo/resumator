import { EyeIcon, PencilSquareIcon, TrashIcon } from '@heroicons/react/24/outline';
import BaseCard from '../common/BaseCard';

/**
 * CoverLetterCard Component
 * Displays a single cover letter with summary and action buttons, styled with Tailwind CSS.
 * 
 * Props:
 *  - coverLetter: object with id, title, and a summary/content.
 *  - onView: callback when View button clicked, receives cover letter ID.
 *  - onEdit: callback when Edit button clicked, receives cover letter ID.
 *  - onDelete: callback when Delete button clicked, receives the full cover letter object.
 */
export default function CoverLetterCard({ coverLetter, onView, onEdit, onDelete }) {
  const { id, title, content, updated_at } = coverLetter;

  const getSummary = (text) => {
    if (!text) return 'No content available.';
    const summary = text.substring(0, 120).replace(/\n/g, ' ');
    return text.length > 120 ? `${summary}...` : summary;
  };

  const cardHeader = (
    <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
      {title || 'Untitled Cover Letter'}
    </h3>
  );

  const cardFooter = (
    <div className="flex items-center justify-end space-x-3">
      <button
        onClick={() => onView(id)}
        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
        title="View cover letter"
      >
        <EyeIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onEdit(id)}
        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-gray-700 bg-gray-200 hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200 dark:hover:bg-gray-500 transition-colors"
        title="Edit cover letter"
      >
        <PencilSquareIcon className="h-5 w-5" />
      </button>
      <button
        onClick={() => onDelete(coverLetter)}
        className="inline-flex items-center justify-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 dark:hover:bg-red-500 transition-colors"
        title="Delete cover letter"
      >
        <TrashIcon className="h-5 w-5" />
      </button>
    </div>
  );

  return (
    <BaseCard header={cardHeader} footer={cardFooter}>
      <p className="text-sm text-gray-600 dark:text-gray-400 h-12">
        {getSummary(content)}
      </p>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">
        Last updated: {new Date(updated_at).toLocaleDateString()}
      </p>
    </BaseCard>
  );
}
