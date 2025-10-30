import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import ResumeCard from '../../../components/resumes/ResumeCard';

describe('ResumeCard', () => {
  const mockResume = {
    id: 'res123',
    title: 'Software Engineer Resume',
    description: 'A resume for a software engineer.',
    status: 'active',
    updated_at: new Date().toISOString(),
    versions: [{ id: 'v1' }],
  };

  const mockOnDeleteClick = vi.fn();

  const renderComponent = (resume = mockResume) => {
    return render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ResumeCard resume={resume} onDeleteClick={mockOnDeleteClick} />
      </MemoryRouter>
    );
  };

  it('renders the resume title and description', () => {
    renderComponent();
    expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
    expect(screen.getByText('A resume for a software engineer.')).toBeInTheDocument();
  });

  it('renders the correct number of versions', () => {
    renderComponent();
    expect(screen.getByText('1 version')).toBeInTheDocument();
  });

  it('calls onDeleteClick when the delete button is clicked', () => {
    renderComponent();
    const deleteButton = screen.getByText('Delete');
    fireEvent.click(deleteButton);
    expect(mockOnDeleteClick).toHaveBeenCalledWith(mockResume);
  });

  it('has correct links for view, edit, and customize', () => {
    renderComponent();
    expect(screen.getByText('View').closest('a')).toHaveAttribute('href', '/resumes/res123');
    expect(screen.getByText('Edit').closest('a')).toHaveAttribute('href', '/resumes/res123/edit');
    expect(screen.getByText('Customize').closest('a')).toHaveAttribute('href', '/resumes/res123/customize');
  });
});
