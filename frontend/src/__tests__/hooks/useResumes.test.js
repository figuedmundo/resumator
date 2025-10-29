import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useResumes } from '../../hooks/useResumes';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    getResumes: vi.fn(),
    deleteResume: vi.fn(),
  },
}));

describe('useResumes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch resumes on initial load', async () => {
    const mockResumes = [{ id: 1, title: 'Test Resume' }];
    apiService.getResumes.mockResolvedValue({ resumes: mockResumes });

    const { result } = renderHook(() => useResumes());

    expect(result.current.state.isLoading).toBe(true);

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    expect(result.current.state.resumes).toEqual(mockResumes);
  });

  it('should handle delete correctly', async () => {
    const mockResumes = [{ id: 1, title: 'Test Resume' }];
    apiService.getResumes.mockResolvedValue({ resumes: mockResumes });

    const { result } = renderHook(() => useResumes());

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    act(() => {
      result.current.handlers.handleDeleteClick(mockResumes[0]);
    });

    expect(result.current.state.deleteConfirm).toEqual(mockResumes[0]);

    await act(async () => {
      await result.current.handlers.handleDeleteConfirm();
    });

    expect(apiService.deleteResume).toHaveBeenCalledWith(1);
    expect(result.current.state.resumes).toEqual([]);
    expect(result.current.state.successMessage).not.toBe(null);
  });
});
