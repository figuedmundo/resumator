import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationForm from '../../../../pages/ApplicationForm/components/ApplicationForm';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import apiService from '../../../../services/api';

// Mock the apiService
vi.mock('../../../../services/api', () => ({
  default: {
    getResumes: vi.fn(),
    getResumeVersions: vi.fn(),
    createApplication: vi.fn(),
  },
}));

describe('ApplicationForm', () => {
  beforeEach(() => {
    apiService.getResumes.mockResolvedValue({
      resumes: [{ id: 1, title: 'Test Resume' }],
    });
    apiService.getResumeVersions.mockResolvedValue({
      versions: [{ id: 1, version: 'v1' }],
    });
  });

  it('renders the form', async () => {
    render(
      <MemoryRouter>
        <ApplicationForm />
      </MemoryRouter>
    );
    await waitFor(() => {
        expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();
    expect(screen.getByRole('combobox', { name: /Resume$/i })).toBeInTheDocument();
  });


  it('shows validation errors for required fields', async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <ApplicationForm />
      </MemoryRouter>
    );
    
    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Create Application/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole('button', { name: /Create Application/i }));

    await waitFor(() => {
      expect(screen.getByText('Company is required')).toBeInTheDocument();
    });
    expect(screen.getByText('Position is required')).toBeInTheDocument();
    expect(screen.getByText('Please select a resume')).toBeInTheDocument();
  });


  it('calls onSuccess on successful submission', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    apiService.createApplication.mockResolvedValue({ id: 1 });

    render(
      <MemoryRouter>
        <ApplicationForm onSuccess={onSuccess} />
      </MemoryRouter>
    );

    await waitFor(() => {
        expect(screen.getByLabelText(/Company/i)).toBeInTheDocument();
    });

    await user.type(screen.getByLabelText(/Company/i), 'Test Company');
    await user.type(screen.getByLabelText(/Position/i), 'Test Position');
    await user.selectOptions(screen.getByRole('combobox', { name: /Resume$/i }), '1');
    
    await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /Resume Version/i })).toBeInTheDocument();
    });
    await user.selectOptions(screen.getByRole('combobox', { name: /Resume Version/i }), '1');


    await user.click(screen.getByText('Create Application'));

    await waitFor(() => {
      expect(apiService.createApplication).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
