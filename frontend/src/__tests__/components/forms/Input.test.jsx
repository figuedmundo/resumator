import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Input from '@/components/forms/Input';
import styles from '@/components/forms/Forms.module.css';

describe('Input component', () => {
  it('renders the label and input', () => {
    render(<Input label="Test Label" name="test-input" />);
    expect(screen.getByLabelText('Test Label')).toBeInTheDocument();
  });

  it('displays the value', () => {
    render(<Input label="Test Label" name="test-input" value="Test Value" onChange={() => {}} />);
    expect(screen.getByLabelText('Test Label')).toHaveValue('Test Value');
  });

  it('calls onChange handler when typed in', () => {
    const handleChange = vi.fn();
    render(<Input label="Test Label" name="test-input" onChange={handleChange} />);
    const input = screen.getByLabelText('Test Label');
    fireEvent.change(input, { target: { value: 'new value' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays an error message', () => {
    render(<Input label="Test Label" name="test-input" error="This is an error" />);
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('shows a required indicator', () => {
    render(<Input label="Test Label" name="test-input" required />);
    const label = screen.getByText('Test Label');
    expect(label).toHaveClass(styles.labelRequired);
  });

  it('is disabled when the disabled prop is true', () => {
    render(<Input label="Test Label" name="test-input" disabled />);
    expect(screen.getByLabelText('Test Label')).toBeDisabled();
  });

  it('displays help text when provided and there is no error', () => {
    render(<Input label="Test Label" name="test-input" helpText="This is help text." />);
    expect(screen.getByText('This is help text.')).toBeInTheDocument();
  });

  it('does not display help text when there is an error', () => {
    render(<Input label="Test Label" name="test-input" helpText="This is help text." error="This is an error." />);
    expect(screen.queryByText('This is help text.')).not.toBeInTheDocument();
    expect(screen.getByText('This is an error.')).toBeInTheDocument();
  });
});
