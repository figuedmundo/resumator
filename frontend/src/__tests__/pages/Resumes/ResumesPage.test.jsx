/**
 * Tests for ResumesPage Component
 * Tests user interactions and rendering behavior for the resumes list page.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { renderWithProviders } from '../../../test-utils/test-utils';
import ResumesPage from '../../../pages/Resumes/ResumesPage';
import apiService from '../../../services/api';

// Mock the API service
vi.mock('../../../services/api', () => ({
  default: {
    getResumes: vi.fn(),
    deleteResume: vi.fn(),
  },
}));

// Mock the LoadingSpinner component
vi.mock('../../../components/LoadingSpinner/LoadingSpinner', () => ({
  default: () => <div data-testid="loading-spinner">Loading...</div>,
}));

// Mock the ConfirmDialog component
vi.mock('../../../components/Applications/components/ConfirmDialog', () => ({
  default: ({ isOpen, onClose, onConfirm, title, message, confirmText }) => {
    if (!isOpen) return null;
    return (
      <div role="dialog" aria-labelledby="dialog-title">
        <h2 id="dialog-title">{title}</h2>
        <p>{message}</p>
        <button onClick={onConfirm}>{confirmText}</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  },
}));

describe('ResumesPage', () => {
  const mockResumes = [
    {
      id: 1,
      title: 'Software Engineer Resume',
      description: 'My main resume for tech positions',
      status: 'active',
      updated_at: '2024-01-15T10:00:00Z',
      versions: [{}, {}], // 2 versions
    },
    {
      id: 2,
      title: 'Marketing Resume',
      description: 'Resume for marketing roles',
      status: 'draft',
      updated_at: '2024-01-10T10:00:00Z',
      versions: [{}], // 1 version
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading State', () => {
    it('should display loading spinner while fetching resumes', () => {
      /**
       * GIVEN: API is loading
       * WHEN: Component mounts
       * THEN: Should display loading spinner
       */
      apiService.getResumes.mockImplementation(
        () => new Promise(() => {}) // Never resolves
      );

      renderWithProviders(<ResumesPage />);

      expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
    });
  });

  describe('Empty State', () => {
    it('should display empty state when no resumes exist', async () => {
      /**
       * GIVEN: User has no resumes
       * WHEN: Component loads
       * THEN: Should display empty state with create button
       */
      apiService.getResumes.mockResolvedValue({ resumes: [] });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(/no resumes/i)).toBeInTheDocument();
      });

      expect(screen.getByText(/get started by creating a new resume/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /new resume/i })).toBeInTheDocument();
    });
  });

  describe('Resume List Display', () => {
    it('should display list of resumes with correct information', async () => {
      /**
       * GIVEN: User has multiple resumes
       * WHEN: Component loads
       * THEN: Should display all resumes with their information
       */
      apiService.getResumes.mockResolvedValue({ resumes: mockResumes });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      // Check first resume
      expect(screen.getByText('My main resume for tech positions')).toBeInTheDocument();
      expect(screen.getByText(/active/i)).toBeInTheDocument();
      expect(screen.getByText('2 versions')).toBeInTheDocument();

      // Check second resume
      expect(screen.getByText('Marketing Resume')).toBeInTheDocument();
      expect(screen.getByText('Resume for marketing roles')).toBeInTheDocument();
      expect(screen.getByText(/draft/i)).toBeInTheDocument();
      expect(screen.getByText('1 version')).toBeInTheDocument();
    });

    it('should display formatted dates for updated_at', async () => {
      /**
       * GIVEN: Resumes with different update dates
       * WHEN: Component loads
       * THEN: Should display formatted dates
       */
      apiService.getResumes.mockResolvedValue({ resumes: mockResumes });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      // Dates should be formatted as locale strings
      const datePattern = /Updated \d{1,2}\/\d{1,2}\/\d{4}/;
      const dateElements = screen.getAllByText(datePattern);
      expect(dateElements.length).toBeGreaterThan(0);
    });

    it('should display action links for each resume', async () => {
      /**
       * GIVEN: User has resumes
       * WHEN: Component loads
       * THEN: Should display View, Edit, Customize, and Delete actions
       */
      apiService.getResumes.mockResolvedValue({ resumes: mockResumes });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      // Each resume should have action links
      const viewLinks = screen.getAllByRole('link', { name: /view/i });
      const editLinks = screen.getAllByRole('link', { name: /edit/i });
      const customizeLinks = screen.getAllByRole('link', { name: /customize/i });
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });

      expect(viewLinks).toHaveLength(mockResumes.length);
      expect(editLinks).toHaveLength(mockResumes.length);
      expect(customizeLinks).toHaveLength(mockResumes.length);
      expect(deleteButtons).toHaveLength(mockResumes.length);
    });

    it('should have correct links for resume actions', async () => {
      /**
       * GIVEN: User has resumes
       * WHEN: Component loads
       * THEN: Links should point to correct routes
       */
      apiService.getResumes.mockResolvedValue({ resumes: [mockResumes[0]] });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: /^view$/i })).toHaveAttribute(
        'href',
        '/resumes/1'
      );
      expect(screen.getByRole('link', { name: /^edit$/i })).toHaveAttribute(
        'href',
        '/resumes/1/edit'
      );
      expect(screen.getByRole('link', { name: /^customize$/i })).toHaveAttribute(
        'href',
        '/resumes/1/customize'
      );
    });
  });

  describe('Error Handling', () => {
    it('should display error message when API call fails', async () => {
      /**
       * GIVEN: API returns error
       * WHEN: Component loads
       * THEN: Should display error message
       */
      const errorMessage = 'Failed to load resumes';
      apiService.getResumes.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Should not show loading spinner or resumes
      expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument();
    });
  });

  describe('Delete Functionality', () => {
    it('should open confirmation dialog when delete button is clicked', async () => {
      apiService.getResumes.mockResolvedValue({ resumes: [mockResumes[0]] });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);

      await waitFor(() => {
        expect(screen.getByRole('dialog')).toBeInTheDocument();
      });

      expect(screen.getByText(/delete resume/i)).toBeInTheDocument();
      expect(screen.getByText(/software engineer resume/i)).toBeInTheDocument();
    });

    it('should delete resume when confirmed', async () => {
      /**
       * GIVEN: User confirms deletion
       * WHEN: Confirmation is clicked
       * THEN: Should call API and remove resume from list
       */
      apiService.getResumes.mockResolvedValue({ resumes: mockResumes });
      apiService.deleteResume.mockResolvedValue({});

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      // Click delete on first resume
      const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
      await userEvent.click(deleteButtons[0]);

      // Confirm deletion
      const dialog = await screen.findByRole('dialog');
      const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(apiService.deleteResume).toHaveBeenCalledWith(1);
      });

      // Resume should be removed from list
      await waitFor(() => {
        expect(screen.queryByText('Software Engineer Resume')).not.toBeInTheDocument();
      });

      // Success message should appear
      expect(
        screen.getByText(/resume "software engineer resume" deleted successfully/i)
      ).toBeInTheDocument();
    });

    it('should close dialog without deleting when cancel is clicked', async () => {
      /**
       * GIVEN: Delete dialog is open
       * WHEN: User clicks cancel
       * THEN: Should close dialog without deleting
       */
      apiService.getResumes.mockResolvedValue({ resumes: [mockResumes[0]] });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);

      const dialog = await screen.findByRole('dialog');
      const cancelButton = within(dialog).getByRole('button', { name: /cancel/i });
      await userEvent.click(cancelButton);

      await waitFor(() => {
        expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      });

      expect(apiService.deleteResume).not.toHaveBeenCalled();
      expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
    });

    it('should display error message when delete fails', async () => {
      /**
       * GIVEN: Delete API call fails
       * WHEN: User confirms deletion
       * THEN: Should display error message
       */
      const errorMessage = 'Failed to delete resume';
      apiService.getResumes.mockResolvedValue({ resumes: [mockResumes[0]] });
      apiService.deleteResume.mockRejectedValue(new Error(errorMessage));

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      const deleteButton = screen.getByRole('button', { name: /delete/i });
      await userEvent.click(deleteButton);

      const dialog = await screen.findByRole('dialog');
      const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(errorMessage)).toBeInTheDocument();
      });

      // Resume should still be in the list
      expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
    });
  });

  describe('Create Resume Button', () => {
    it('should display create resume button in header', async () => {
      /**
       * GIVEN: Component is rendered
       * WHEN: Page loads
       * THEN: Should display create resume button
       */
      apiService.getResumes.mockResolvedValue({ resumes: [] });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByRole('link', { name: /create resume/i })).toBeInTheDocument();
      });

      expect(screen.getByRole('link', { name: /create resume/i })).toHaveAttribute(
        'href',
        '/resumes/new'
      );
    });
  });

  describe('API Response Formats', () => {
    it('should handle API response with resumes array directly', async () => {
      /**
       * GIVEN: API returns array directly (not wrapped in object)
       * WHEN: Component loads
       * THEN: Should display resumes correctly
       */
      apiService.getResumes.mockResolvedValue(mockResumes);

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      expect(screen.getByText('Marketing Resume')).toBeInTheDocument();
    });

    it('should handle API response with resumes property', async () => {
      /**
       * GIVEN: API returns object with resumes property
       * WHEN: Component loads
       * THEN: Should display resumes correctly
       */
      apiService.getResumes.mockResolvedValue({ resumes: mockResumes });

      renderWithProviders(<ResumesPage />);

      await waitFor(() => {
        expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
      });

      expect(screen.getByText('Marketing Resume')).toBeInTheDocument();
    });
  });

  describe('Success Message', () => {
    it('should auto-hide success message after 3 seconds', async () => {
      /**
       * GIVEN: Resume is deleted successfully
       * WHEN: 3 seconds pass
       * THEN: Success message should disappear
       */
      vi.useFakeTimers();

      try {
        apiService.getResumes.mockResolvedValue({ resumes: [mockResumes[0]] });
        apiService.deleteResume.mockResolvedValue({});

        renderWithProviders(<ResumesPage />);

        await waitFor(() => {
          expect(screen.getByText('Software Engineer Resume')).toBeInTheDocument();
        });

        const deleteButton = screen.getByRole('button', { name: /delete/i });
        await userEvent.click(deleteButton);

        const dialog = await screen.findByRole('dialog');
        const confirmButton = within(dialog).getByRole('button', { name: /delete/i });
        await userEvent.click(confirmButton);

        // Wait for success message
        await waitFor(() => {
          expect(screen.getByText(/deleted successfully/i)).toBeInTheDocument();
        });

        // Fast-forward time
        vi.advanceTimersByTime(3000);

        await waitFor(() => {
          expect(screen.queryByText(/deleted successfully/i)).not.toBeInTheDocument();
        });
      } finally {
        vi.useRealTimers();
      }
    });
  });
});
