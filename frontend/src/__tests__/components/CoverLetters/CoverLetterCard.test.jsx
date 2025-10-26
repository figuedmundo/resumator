import { render, screen, fireEvent } from '@testing-library/react';
import CoverLetterCard from '../../../components/CoverLetters/CoverLetterCard';
import { vi } from 'vitest';

describe('CoverLetterCard', () => {
  const coverLetter = {
    id: 1,
    title: 'My Cover Letter',
    content: 'This is the content of my cover letter.',
    updated_at: new Date().toISOString(),
  };

  it('renders the cover letter title and summary', () => {
    render(<CoverLetterCard coverLetter={coverLetter} />);
    expect(screen.getByText('My Cover Letter')).toBeInTheDocument();
    expect(screen.getByText('This is the content of my cover letter.')).toBeInTheDocument();
  });

  it('calls the onView callback when the view button is clicked', () => {
    const onView = vi.fn();
    render(<CoverLetterCard coverLetter={coverLetter} onView={onView} />);
    fireEvent.click(screen.getByTitle('View cover letter'));
    expect(onView).toHaveBeenCalledWith(1);
  });

  it('calls the onEdit callback when the edit button is clicked', () => {
    const onEdit = vi.fn();
    render(<CoverLetterCard coverLetter={coverLetter} onEdit={onEdit} />);
    fireEvent.click(screen.getByTitle('Edit cover letter'));
    expect(onEdit).toHaveBeenCalledWith(1);
  });

  it('calls the onDelete callback when the delete button is clicked', () => {
    const onDelete = vi.fn();
    render(<CoverLetterCard coverLetter={coverLetter} onDelete={onDelete} />);
    fireEvent.click(screen.getByTitle('Delete cover letter'));
    expect(onDelete).toHaveBeenCalledWith(coverLetter);
  });
});
