import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Textarea from '@/components/forms/Textarea';
import styles from '@/components/forms/Forms.module.css';

describe('Textarea component', () => {
  it('renders the label and textarea', () => {
    render(<Textarea label="Test Label" name="test-textarea" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('displays the value', () => {
    render(<Textarea label="Test Label" name="test-textarea" value="Test Value" onChange={() => {}} />);
    expect(screen.getByLabelText('Test Label')).toHaveValue('Test Value');
  });

  it('calls onChange handler when typed in', () => {
    const handleChange = vi.fn();
    render(<Textarea label="Test Label" name="test-textarea" onChange={handleChange} />);
    const textarea = screen.getByLabelText('Test Label');
    fireEvent.change(textarea, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays an error message', () => {
    render(<Textarea label="Test Label" name="test-textarea" error="This is an error" />);
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('shows a required indicator', () => {
    render(<Textarea label="Test Label" name="test-textarea" required />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass(styles.labelRequired);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Textarea label="Test Label" name="test-textarea" disabled />);
    expect(screen.getByLabelText('Test Label')).toBeDisabled();
  });

  it('displays help text when provided and there is no error', () => {
    render(<Textarea label="Test Label" name="test-textarea" helpText="This is help text." />);
    expect(screen.getByText('This is help text.')).toBeInTheDocument();
  });

  it('does not display help text when there is an error', () => {
    render(<Textarea label="Test Label" name="test-textarea" helpText="This is help text." error="This is an error." />);
    expect(screen.queryByText('This is help text.')).not.toBeInTheDocument();
    expect(screen.getByText('This is an error.')).toBeInTheDocument();
  });

  it('respects the rows prop', () => {
    render(<Textarea label="Test Label" name="test-textarea" rows={5} />);
    expect(screen.getByLabelText('Test Label')).toHaveAttribute('rows', '5');
  });
});
