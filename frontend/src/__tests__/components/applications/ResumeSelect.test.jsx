import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import ResumeSelect from '@/components/applications/ResumeSelect';
import apiService from '@/services/api';

// Mock the apiService
vi.mock('@/services/api', () => ({
  default: {
    getResumes: vi.fn(),
  },
}));

const ResumeSelectWrapper = (props) => {
  const [value, setValue] = useState(props.value || '');
  const handleChange = (e) => {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  return <ResumeSelect {...props} value={value} onChange={handleChange} />;
};

describe('ResumeSelect', () => {
  beforeEach(() => {
    apiService.getResumes.mockResolvedValue({
      resumes: [
        { id: 1, title: 'Resume 1', is_default: false },
        { id: 2, title: 'Resume 2', is_default: true },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with label and options', async () => {
    render(<ResumeSelectWrapper />);
    expect(screen.getByLabelText('Resume')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Loading resumes...' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Resume 1' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'Resume 2 (Default)' })).toBeInTheDocument();
    });
  });

  it('shows loading state initially', () => {
    apiService.getResumes.mockReturnValueOnce(new Promise(() => {})); // Never resolve to keep loading
    render(<ResumeSelectWrapper />);
    expect(screen.getByRole('option', { name: 'Loading resumes...' })).toBeInTheDocument();
    expect(screen.getByLabelText('Resume')).toBeDisabled();
  });

  it('handles error during resume fetch', async () => {
    apiService.getResumes.mockRejectedValueOnce(new Error('Failed to fetch'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ResumeSelectWrapper />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load resumes:', expect.any(Error));
    });
    expect(screen.getByLabelText('Resume')).not.toBeDisabled(); // Should not be disabled after error
    expect(screen.queryByRole('option', { name: 'Resume 1' })).not.toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('calls onChange when a resume is selected', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<ResumeSelectWrapper onChange={handleChange} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'Resume 1' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Resume'), '1');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Resume')).toHaveValue('1');
  });

  it('displays error message when error prop is provided', async () => {
    render(<ResumeSelectWrapper error="Resume selection is required" />);
    await waitFor(() => {
      expect(screen.getByText('Resume selection is required')).toBeInTheDocument();
    });
  });
});
