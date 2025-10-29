import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ApplicationForm from '../../../../pages/ApplicationForm/components/ApplicationForm';
import { vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import apiService from '../../../../services/api';

// Mock the apiService
vi.mock('@/services/api', () => ({
  default: {
    createApplication: vi.fn(),
    updateApplication: vi.fn(),
    getApplication: vi.fn(),
    getResumes: vi.fn(() => Promise.resolve({ resumes: [{ id: 1, title: 'Test Resume' }] })),
    getResumeVersions: vi.fn(() => Promise.resolve({ versions: [{ id: 1, version: 'v1' }] })),
  },
}));

describe('ApplicationForm', () => {
  beforeEach(() => {
    apiService.createApplication.mockClear();
    apiService.updateApplication.mockClear();
    apiService.getApplication.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });
  it('renders the form and submits new application', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    apiService.createApplication.mockResolvedValue({ id: 1 });

    render(
      <MemoryRouter>
        <ApplicationForm onSuccess={onSuccess} />
      </MemoryRouter>
    );

    // Wait for resumes to load
    await screen.findByText('Test Resume');

    await user.type(screen.getByLabelText(/Company/i), 'Test Company');
    await user.type(screen.getByLabelText(/Position/i), 'Test Position');
    await user.selectOptions(screen.getByLabelText('Resume'), '1');
    
    // Wait for versions to load
    await screen.findByText('v1');
    await user.selectOptions(screen.getByLabelText('Resume Version'), '1');

    await user.click(screen.getByRole('button', { name: /Create Application/i }));

    await waitFor(() => {
      expect(apiService.createApplication).toHaveBeenCalled();
      expect(onSuccess).toHaveBeenCalledWith({ id: 1 });
    });
  });

  it('does not submit with empty required fields', async () => {
    const user = userEvent.setup();
    const onSuccess = vi.fn();
    render(
      <MemoryRouter>
        <ApplicationForm onSuccess={onSuccess} />
      </MemoryRouter>
    );

    await screen.findByText('Test Resume');

    await user.click(screen.getByRole('button', { name: /Create Application/i }));

    expect(apiService.createApplication).not.toHaveBeenCalled();
    expect(onSuccess).not.toHaveBeenCalled();
  });
});
