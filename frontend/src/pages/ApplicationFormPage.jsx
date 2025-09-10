import { useParams } from 'react-router-dom';
import ApplicationForm from '../components/application/ApplicationForm';

export default function ApplicationFormPage() {
  const { id } = useParams();
  const isEdit = !!id;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {isEdit ? 'Edit Application' : 'New Application'}
        </h1>
        <p className="mt-1 text-sm text-gray-600">
          {isEdit 
            ? 'Update your job application details'
            : 'Create a new job application to track your job search'
          }
        </p>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <ApplicationForm applicationId={id} />
      </div>
    </div>
  );
}
