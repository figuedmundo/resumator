import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
    render(
      <MemoryRouter>
        <ApplicationForm />
      </MemoryRouter>
    );
    
    await waitFor(() => {
        expect(screen.getByText('Create Application')).toBeInTheDocument();
    });

    fireEvent.click(screen.getByText('Create Application'));

    expect(await screen.findByText('Company is required')).toBeInTheDocument();
    expect(await screen.findByText('Position is required')).toBeInTheDocument();
    expect(await screen.findByText('Please select a resume')).toBeInTheDocument();
  });

  it('calls onSuccess on successful submission', async () => {
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

    fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'Test Company' } });
    fireEvent.change(screen.getByLabelText(/Position/i), { target: { value: 'Test Position' } });
    fireEvent.change(screen.getByRole('combobox', { name: /Resume$/i }), { target: { value: '1' } });
    
    await waitFor(() => {
        expect(screen.getByRole('combobox', { name: /Resume Version/i })).toBeInTheDocument();
    });
    fireEvent.change(screen.getByRole('combobox', { name: /Resume Version/i }), { target: { value: '1' } });


    fireEvent.click(screen.getByText('Create Application'));

    await waitFor(() => {
      expect(apiService.createApplication).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    });
  });
});
