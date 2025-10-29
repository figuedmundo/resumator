import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useApplications } from '../../hooks/applications/useApplications';
import apiService from '../../services/api';

// Mock the API service
vi.mock('../../services/api', () => ({
  default: {
    updateApplication: vi.fn(),
    deleteApplication: vi.fn(),
  },
}));

// Mock the helpers
vi.mock('../../utils/helpers', () => ({
  devLog: vi.fn(),
  getErrorMessage: vi.fn((err) => err.message || 'An unknown error occurred.'),
}));

describe('useApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial State', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useApplications());

      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe('');
      expect(typeof result.current.updateApplicationStatus).toBe('function');
      expect(typeof result.current.deleteApplication).toBe('function');
      expect(typeof result.current.clearError).toBe('function');
    });
  });

  describe('updateApplicationStatus', () => {
    it('should successfully update application status', async () => {
      const mockOnSuccess = vi.fn();
      const applicationId = 1;
      const newStatus = 'interview';

      apiService.updateApplication.mockResolvedValue({
        id: applicationId,
        status: newStatus,
      });

      const { result } = renderHook(() => useApplications());

      let success;
      await act(async () => {
        success = await result.current.updateApplicationStatus(
          applicationId,
          newStatus,
          mockOnSuccess
        );
      });

      expect(success).toBe(true);
      expect(apiService.updateApplication).toHaveBeenCalledWith(applicationId, {
        status: newStatus,
      });
      expect(mockOnSuccess).toHaveBeenCalledWith(applicationId, newStatus);
      expect(result.current.error).toBe('');
    });

    it('should set loading state during update', async () => {
      const applicationId = 1;
      const newStatus = 'interview';

      let resolveUpdate;
      apiService.updateApplication.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveUpdate = resolve;
          })
      );

      const { result } = renderHook(() => useApplications());

      let updatePromise;
      await act(async () => {
        updatePromise = result.current.updateApplicationStatus(applicationId, newStatus);
      });

      // Give React time to update loading state
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveUpdate({ id: applicationId, status: newStatus });
        await updatePromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle update error and set error message', async () => {
      const errorMessage = 'Failed to update application status';
      apiService.updateApplication.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useApplications());

      let success;
      await act(async () => {
        success = await result.current.updateApplicationStatus(1, 'interview');
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should work without onSuccess callback', async () => {
      apiService.updateApplication.mockResolvedValue({ id: 1, status: 'interview' });

      const { result } = renderHook(() => useApplications());

      let success;
      await act(async () => {
        success = await result.current.updateApplicationStatus(1, 'interview');
      });

      expect(success).toBe(true);
      expect(result.current.error).toBe('');
    });

    it('should clear previous error when new update starts', async () => {
      const { result } = renderHook(() => useApplications());

      // First update fails
      apiService.updateApplication.mockRejectedValueOnce(new Error('First error'));
      await act(async () => {
        await result.current.updateApplicationStatus(1, 'interview');
      });
      expect(result.current.error).toBe('First error');

      // Second update succeeds
      apiService.updateApplication.mockResolvedValue({ id: 1, status: 'offer' });
      await act(async () => {
        await result.current.updateApplicationStatus(1, 'offer');
      });
      expect(result.current.error).toBe('');
    });
  });

  describe('deleteApplication', () => {
    it('should successfully delete application', async () => {
      const mockOnSuccess = vi.fn();
      const applicationId = 1;

      apiService.deleteApplication.mockResolvedValue({});

      const { result } = renderHook(() => useApplications());

      let success;
      await act(async () => {
        success = await result.current.deleteApplication(
          applicationId,
          mockOnSuccess
        );
      });

      expect(success).toBe(true);
      expect(apiService.deleteApplication).toHaveBeenCalledWith(applicationId);
      expect(mockOnSuccess).toHaveBeenCalledWith(applicationId);
      expect(result.current.error).toBe('');
    });

    it('should set loading state during deletion', async () => {
      const applicationId = 1;

      let resolveDelete;
      apiService.deleteApplication.mockImplementation(
        () =>
          new Promise((resolve) => {
            resolveDelete = resolve;
          })
      );

      const { result } = renderHook(() => useApplications());

      let deletePromise;
      await act(async () => {
        deletePromise = result.current.deleteApplication(applicationId);
      });

      // Give React time to update loading state
      await act(async () => {
        await Promise.resolve();
      });

      expect(result.current.loading).toBe(true);

      await act(async () => {
        resolveDelete({});
        await deletePromise;
      });

      expect(result.current.loading).toBe(false);
    });

    it('should handle deletion error and set error message', async () => {
      const errorMessage = 'Failed to delete application';
      apiService.deleteApplication.mockRejectedValue(new Error(errorMessage));

      const { result } = renderHook(() => useApplications());

      let success;
      await act(async () => {
        success = await result.current.deleteApplication(1);
      });

      expect(success).toBe(false);
      expect(result.current.error).toBe(errorMessage);
      expect(result.current.loading).toBe(false);
    });

    it('should work without onSuccess callback', async () => {
      apiService.deleteApplication.mockResolvedValue({});

      const { result } = renderHook(() => useApplications());

      let success;
      await act(async () => {
        success = await result.current.deleteApplication(1);
      });

      expect(success).toBe(true);
      expect(result.current.error).toBe('');
    });

    it('should clear previous error when new deletion starts', async () => {
      const { result } = renderHook(() => useApplications());

      // First deletion fails
      apiService.deleteApplication.mockRejectedValueOnce(new Error('First error'));
      await act(async () => {
        await result.current.deleteApplication(1);
      });
      expect(result.current.error).toBe('First error');

      // Second deletion succeeds
      apiService.deleteApplication.mockResolvedValue({});
      await act(async () => {
        await result.current.deleteApplication(2);
      });
      expect(result.current.error).toBe('');
    });
  });

  describe('clearError', () => {
    it('should clear error message', async () => {
      apiService.updateApplication.mockRejectedValue(new Error('Test error'));

      const { result } = renderHook(() => useApplications());

      // Trigger an error
      await act(async () => {
        await result.current.updateApplicationStatus(1, 'interview');
      });
      expect(result.current.error).toBe('Test error');

      // Clear the error
      act(() => {
        result.current.clearError();
      });
      expect(result.current.error).toBe('');
    });
  });

  describe('Error Handling', () => {
    it('should handle API error without message', async () => {
      apiService.updateApplication.mockRejectedValue(new Error());

      const { result } = renderHook(() => useApplications());

      await act(async () => {
        await result.current.updateApplicationStatus(1, 'interview');
      });

      expect(result.current.error).toBe('An unknown error occurred.');
    });
  });

  describe('Concurrent Operations', () => {
    it('should handle multiple operations sequentially', async () => {
      apiService.updateApplication.mockResolvedValue({ id: 1, status: 'interview' });
      apiService.deleteApplication.mockResolvedValue({});

      const { result } = renderHook(() => useApplications());

      let success1, success2;
      await act(async () => {
        success1 = await result.current.updateApplicationStatus(1, 'interview');
        success2 = await result.current.deleteApplication(2);
      });

      expect(success1).toBe(true);
      expect(success2).toBe(true);
      expect(result.current.error).toBe('');
    });
  });
});
