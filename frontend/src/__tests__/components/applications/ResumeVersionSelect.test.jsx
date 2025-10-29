import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useState } from 'react';
import { describe, it, expect, vi } from 'vitest';
import ResumeVersionSelect from '@/components/applications/ResumeVersionSelect';
import apiService from '@/services/api';

// Mock the apiService
vi.mock('@/services/api', () => ({
  default: {
    getResumeVersions: vi.fn(),
  },
}));

const ResumeVersionSelectWrapper = (props) => {
  const [value, setValue] = useState(props.value || '');
  const handleChange = (e) => {
    setValue(e.target.value);
    if (props.onChange) {
      props.onChange(e);
    }
  };
  return <ResumeVersionSelect {...props} value={value} onChange={handleChange} />;
};

describe('ResumeVersionSelect', () => {
  beforeEach(() => {
    apiService.getResumeVersions.mockResolvedValue({
      versions: [
        { id: 101, version: 'v1', is_original: true, job_description: null },
        { id: 102, version: 'v2', is_original: false, job_description: 'Customized for Google' },
      ],
    });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('renders correctly with label and options when resumeId is provided', async () => {
    render(<ResumeVersionSelectWrapper resumeId={1} />);
    expect(screen.getByLabelText('Resume Version')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Loading versions...' })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'v1 (Original)' })).toBeInTheDocument();
      expect(screen.getByRole('option', { name: 'v2 - Customized' })).toBeInTheDocument();
    });
  });

  it('does not load versions if resumeId is not provided', async () => {
    render(<ResumeVersionSelectWrapper resumeId={null} />);
    expect(screen.getByLabelText('Resume Version')).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Select version' })).toBeInTheDocument();
    expect(apiService.getResumeVersions).not.toHaveBeenCalled();
  });

  it('shows loading state initially when resumeId is provided', () => {
    apiService.getResumeVersions.mockReturnValueOnce(new Promise(() => {})); // Never resolve to keep loading
    render(<ResumeVersionSelectWrapper resumeId={1} />);
    expect(screen.getByRole('option', { name: 'Loading versions...' })).toBeInTheDocument();
    expect(screen.getByLabelText('Resume Version')).toBeDisabled();
  });

  it('handles error during resume version fetch', async () => {
    apiService.getResumeVersions.mockRejectedValueOnce(new Error('Failed to fetch versions'));
    const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(<ResumeVersionSelectWrapper resumeId={1} />);

    await waitFor(() => {
      expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to load resume versions:', expect.any(Error));
    });
    expect(screen.getByLabelText('Resume Version')).not.toBeDisabled(); // Should not be disabled after error
    expect(screen.queryByRole('option', { name: 'v1 (Original)' })).not.toBeInTheDocument();
    consoleErrorSpy.mockRestore();
  });

  it('calls onChange when a resume version is selected', async () => {
    const handleChange = vi.fn();
    const user = userEvent.setup();
    render(<ResumeVersionSelectWrapper resumeId={1} onChange={handleChange} />);

    await waitFor(() => {
      expect(screen.getByRole('option', { name: 'v1 (Original)' })).toBeInTheDocument();
    });

    await user.selectOptions(screen.getByLabelText('Resume Version'), '101');
    expect(handleChange).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText('Resume Version')).toHaveValue('101');
  });

  it('displays error message when error prop is provided', async () => {
    render(<ResumeVersionSelectWrapper resumeId={1} error="Version selection is required" />);
    await waitFor(() => {
      expect(screen.getByText('Version selection is required')).toBeInTheDocument();
    });
  });
});
