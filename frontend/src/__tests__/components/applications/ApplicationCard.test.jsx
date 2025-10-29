import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ApplicationCard from '../../../components/applications/ApplicationCard';

vi.mock('../../../components/Applications', () => ({
  StatusBadge: ({ status }) => <span data-testid="status-badge">{status}</span>,
  StatusSelect: ({ value, onChange }) => (
    <select data-testid="status-select" value={value} onChange={e => onChange(e.target.value)}>
      <option value="applied">Applied</option>
      <option value="interviewing">Interviewing</option>
    </select>
  ),
}));

describe('ApplicationCard', () => {
  const mockApplication = {
    id: 'app123',
    position: 'Frontend Developer',
    company: 'Tech Corp',
    status: 'applied',
    applied_date: new Date().toISOString(),
    notes: 'A great opportunity.',
    cover_letter_version_id: 'clv1',
  };

  const mockHandlers = {
    onStatusChange: vi.fn(),
    onDelete: vi.fn(),
    onDownloadResume: vi.fn(),
    onDownloadCoverLetter: vi.fn(),
  };

  const renderComponent = (application = mockApplication) => {
    return render(
      <MemoryRouter>
        <ApplicationCard application={application} {...mockHandlers} operationLoading={false} />
      </MemoryRouter>
    );
  };

  it('renders application details correctly', () => {
    renderComponent();
    expect(screen.getByText('Frontend Developer')).toBeInTheDocument();
    expect(screen.getByText('Tech Corp')).toBeInTheDocument();
    expect(screen.getByText('A great opportunity.')).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toHaveTextContent('applied');
  });

  it('calls onStatusChange when status is changed', () => {
    renderComponent();
    const statusSelect = screen.getByTestId('status-select');
    fireEvent.change(statusSelect, { target: { value: 'interviewing' } });
    expect(mockHandlers.onStatusChange).toHaveBeenCalledWith('app123', 'interviewing');
  });

  it('calls onDelete when delete button is clicked', () => {
    renderComponent();
    const deleteButton = screen.getByTitle('Delete application');
    fireEvent.click(deleteButton);
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockApplication);
  });

  it('calls download handlers when download buttons are clicked', () => {
    renderComponent();
    const resumeButton = screen.getByTitle('Download resume');
    const clButton = screen.getByTitle('Download cover letter');
    fireEvent.click(resumeButton);
    fireEvent.click(clButton);
    expect(mockHandlers.onDownloadResume).toHaveBeenCalledWith('app123', 'Tech Corp');
    expect(mockHandlers.onDownloadCoverLetter).toHaveBeenCalledWith('app123', 'Tech Corp');
  });
});
