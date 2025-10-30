import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import CoverLetterCard from '../../../components/CoverLetters/CoverLetterCard';

describe('CoverLetterCard', () => {
  const mockCoverLetter = {
    id: 'cl123',
    title: 'My Test CL',
    content: 'This is the content of the cover letter.',
    updated_at: new Date().toISOString(),
  };

  const mockHandlers = {
    onView: vi.fn(),
    onEdit: vi.fn(),
    onDelete: vi.fn(),
  };

  const renderComponent = (coverLetter = mockCoverLetter) => {
    return render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <CoverLetterCard coverLetter={coverLetter} {...mockHandlers} />
      </MemoryRouter>
    );
  };

  it('renders cover letter details correctly', () => {
    renderComponent();
    expect(screen.getByText('My Test CL')).toBeInTheDocument();
    expect(screen.getByText(/This is the content/)).toBeInTheDocument();
  });

  it('calls handlers when buttons are clicked', () => {
    renderComponent();
    const viewButton = screen.getByTitle('View cover letter');
    const editButton = screen.getByTitle('Edit cover letter');
    const deleteButton = screen.getByTitle('Delete cover letter');

    fireEvent.click(viewButton);
    expect(mockHandlers.onView).toHaveBeenCalledWith('cl123');

    fireEvent.click(editButton);
    expect(mockHandlers.onEdit).toHaveBeenCalledWith('cl123');

    fireEvent.click(deleteButton);
    expect(mockHandlers.onDelete).toHaveBeenCalledWith(mockCoverLetter);
  });
});