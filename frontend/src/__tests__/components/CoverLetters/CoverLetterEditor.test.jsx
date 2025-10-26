import { render, screen, fireEvent } from '@testing-library/react';
import CoverLetterEditor from '../../../components/CoverLetters/CoverLetterEditor';
import { vi } from 'vitest';

describe('CoverLetterEditor', () => {
  it('renders with initial content', () => {
    render(<CoverLetterEditor initialContent="Initial content" />);
    expect(screen.getByText('Initial content')).toBeInTheDocument();
  });

  it('calls onChange when content is changed', () => {
    const onChange = vi.fn();
    render(<CoverLetterEditor onChange={onChange} />);
    const textarea = screen.getByPlaceholderText('Write your cover letter here... You can use {{variable}} to insert template variables.');
    fireEvent.change(textarea, { target: { value: 'New content' } });
    expect(onChange).toHaveBeenCalledWith('New content');
  });

  it('calls onSave when save button is clicked', () => {
    const onSave = vi.fn();
    render(<CoverLetterEditor initialContent="Some content" onSave={onSave} />);
    fireEvent.click(screen.getByText('Save Cover Letter'));
    expect(onSave).toHaveBeenCalledWith('Some content');
  });

  it('disables save button when content is empty', () => {
    render(<CoverLetterEditor initialContent=" " />);
    expect(screen.getByText('Save Cover Letter')).toBeDisabled();
  });

  it('inserts a template variable when a variable button is clicked', () => {
    const onChange = vi.fn();
    render(<CoverLetterEditor onChange={onChange} />);
    fireEvent.click(screen.getByText('Insert Template Variables'));
    fireEvent.click(screen.getByText('Company Name'));
    expect(onChange).toHaveBeenCalledWith(expect.stringContaining('{{company}}'));
  });
});
