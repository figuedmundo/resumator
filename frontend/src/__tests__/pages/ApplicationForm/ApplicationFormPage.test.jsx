
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import ApplicationFormPage from '../../../pages/ApplicationForm/ApplicationFormPage';
import apiService from '../../../services/api';

// Mock the apiService
vi.mock('../../../services/api', () => ({
  default: {
    getResumes: vi.fn(),
    getCoverLetters: vi.fn(),
    getApplication: vi.fn(),
    createApplication: vi.fn(),
    updateApplication: vi.fn(),
    getCoverLetter: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const mockResumes = [
  { id: 1, title: 'Software Engineer Resume', versions: [{ id: 1, version: 1, is_original: true }] },
  { id: 2, title: 'Data Scientist Resume', versions: [{ id: 2, version: 1, is_original: true }] },
];

const mockCoverLetters = [
  { id: 1, title: 'Cover Letter for Google' },
  { id: 2, title: 'Cover Letter for Facebook' },
];

const mockApplication = {
  id: 1,
  company: 'Test Company',
  position: 'Test Position',
  job_description: 'Test Job Description',
  resume_id: 1,
  resume_version_id: 1,
  cover_letter_id: 1,
  cover_letter_version_id: 1,
  status: 'Applied',
  applied_date: '2025-10-27',
  notes: 'Test notes',
  additional_instructions: 'Test instructions',
};

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);

  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/applications/new" element={ui} />
        <Route path="/applications/edit/:id" element={ui} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ApplicationFormPage', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    apiService.getResumes.mockResolvedValue({ resumes: mockResumes });
    apiService.getCoverLetters.mockResolvedValue({ cover_letters: mockCoverLetters });
    apiService.getCoverLetter.mockResolvedValue({ versions: [{ id: 1, version: 1, is_original: true }] });
  });

  it('should render the form for creating a new application', async () => {
    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' });

    await waitFor(() => {
        expect(screen.getByText('New Application')).toBeInTheDocument();
    });
    expect(screen.getByLabelText(/Company Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Position/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Application/i })).toBeInTheDocument();
  });

  it('should display loading state initially', () => {
    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' });
    expect(screen.getByText(/Loading form.../i)).toBeInTheDocument();
  });

  it('should fetch and display resumes and cover letters', async () => {
    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' });

    await waitFor(() => {
      expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      expect(screen.getByText('Cover Letter for Google')).toBeInTheDocument();
    });
  });

  it('should show validation errors for required fields', async () => {
    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' });

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Create Application/i })).toBeEnabled();
    });

    await userEvent.click(screen.getByRole('button', { name: /Create Application/i }));

    expect(await screen.findByText('Company name is required')).toBeInTheDocument();
    expect(screen.getByText('Position is required')).toBeInTheDocument();
    expect(screen.getByText('Please select a resume')).toBeInTheDocument();
    expect(screen.getByText('Please select a resume version')).toBeInTheDocument();
  });

  it('should submit the form with valid data', async () => {
    renderWithRouter(<ApplicationFormPage />, { route: '/applications/new' });

    await waitFor(() => {
        expect(screen.getByRole('button', { name: /Create Application/i })).toBeEnabled();
    });

    await userEvent.type(screen.getByLabelText(/Company Name/i), 'Test Company');
    await userEvent.type(screen.getByLabelText(/Position/i), 'Test Position');
    await userEvent.selectOptions(screen.getByLabelText(/^Resume$/i), '1');
    
    await waitFor(async () => {
        await userEvent.selectOptions(screen.getByRole('combobox', { name: /Resume Version/i }), '1');
    });

    await userEvent.click(screen.getByRole('button', { name: /Create Application/i }));

    await waitFor(() => {
      expect(apiService.createApplication).toHaveBeenCalledWith(
        expect.objectContaining({
          company: 'Test Company',
          position: 'Test Position',
          resume_id: 1,
          resume_version_id: 1,
        })
      );
    });

    expect(await screen.findByText('Application created successfully!')).toBeInTheDocument();
    await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/applications');
    });
  });

  it('should load application data in edit mode', async () => {
    apiService.getApplication.mockResolvedValue(mockApplication);
    renderWithRouter(<ApplicationFormPage />, { route: '/applications/edit/1' });

    await waitFor(() => {
      expect(screen.getByLabelText(/Company Name/i)).toHaveValue('Test Company');
      expect(screen.getByLabelText(/Position/i)).toHaveValue('Test Position');
    });
  });
});
