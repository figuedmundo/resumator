import { render, screen, fireEvent } from '@testing-library/react';
import CoverLetterList from '../../../components/CoverLetters/CoverLetterList';
import { vi } from 'vitest';

describe('CoverLetterList', () => {
  const coverLetters = [
    { id: 1, title: 'Cover Letter 1', content: 'Content 1', updated_at: new Date().toISOString() },
    { id: 2, title: 'Cover Letter 2', content: 'Content 2', updated_at: new Date().toISOString() },
  ];

  it('renders a list of cover letters', () => {
    render(<CoverLetterList coverLetters={coverLetters} />);
    expect(screen.getByText('Cover Letter 1')).toBeInTheDocument();
    expect(screen.getByText('Cover Letter 2')).toBeInTheDocument();
  });

  it('displays a loading message when loading', () => {
    render(<CoverLetterList loading={true} />);
    expect(screen.getByText('Loading cover letters...')).toBeInTheDocument();
  });

  it('displays an empty state message when there are no cover letters', () => {
    render(<CoverLetterList coverLetters={[]} />);
    expect(screen.getByText('No Cover Letters Yet')).toBeInTheDocument();
  });

  it('filters the list by search term', () => {
    render(<CoverLetterList coverLetters={coverLetters} />);
    const searchInput = screen.getByPlaceholderText('Search cover letters...');
    fireEvent.change(searchInput, { target: { value: 'Cover Letter 1' } });
    expect(screen.getByText('Cover Letter 1')).toBeInTheDocument();
    expect(screen.queryByText('Cover Letter 2')).not.toBeInTheDocument();
  });
});
