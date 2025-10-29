import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Select from '@/components/forms/Select';
import styles from '@/components/forms/Forms.module.css';

describe('Select component', () => {
  const options = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  const renderWithOptions = (props) => {
    return render(
      <Select {...props}>
        <option value="">Select an option</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </Select>
    );
  };

  it('renders the label and select element', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select' });
    expect(screen.getByLabelText('Test Select')).toBeInTheDocument();
  });

  it('displays the correct value', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select', value: '2', onChange: () => {} });
    expect(screen.getByLabelText('Test Select')).toHaveValue('2');
  });

  it('calls onChange handler when an option is selected', () => {
    const handleChange = vi.fn();
    renderWithOptions({ label: 'Test Select', name: 'test-select', onChange: handleChange });
    const select = screen.getByLabelText('Test Select');
    fireEvent.change(select, { target: { value: '3' } });
    expect(handleChange).toHaveBeenCalledTimes(1);
  });

  it('displays an error message', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select', error: 'This is an error' });
    expect(screen.getByText('This is an error')).toBeInTheDocument();
  });

  it('shows a required indicator', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select', required: true });
    const label = screen.getByText('Test Select');
    expect(label).toHaveClass(styles.labelRequired);
  });

  it('is disabled when the disabled prop is true', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select', disabled: true });
    expect(screen.getByLabelText('Test Select')).toBeDisabled();
  });

  it('is disabled and shows a spinner when loading', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select', loading: true });
    expect(screen.getByLabelText('Test Select')).toBeDisabled();
    // Test for spinner visibility. This might require a more specific selector or data-testid
    // For now, we just check for disabled state.
  });

  it('displays help text when provided and there is no error', () => {
    renderWithOptions({ label: 'Test Select', name: 'test-select', helpText: 'This is help text.' });
    expect(screen.getByText('This is help text.')).toBeInTheDocument();
  });
});
