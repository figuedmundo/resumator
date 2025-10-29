import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import useApplicationList from '../../hooks/useApplicationList';
import apiService from '../../services/api';

vi.mock('../../services/api', () => ({
  default: {
    getApplications: vi.fn(),
  },
}));

describe('useApplicationList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should fetch applications on initial load', async () => {
    const mockApps = { applications: [{ id: 1, title: 'Test App' }], total: 1 };
    apiService.getApplications.mockResolvedValue(mockApps);

    const { result } = renderHook(() => useApplicationList());

    expect(result.current.state.loading).toBe(true);

    await waitFor(() => {
      expect(result.current.state.loading).toBe(false);
    });

    expect(result.current.state.applications).toEqual(mockApps.applications);
    expect(result.current.state.totalCount).toBe(1);
  });

  it('should handle page changes', async () => {
    apiService.getApplications.mockResolvedValue({ applications: [], total: 20 });
    const { result } = renderHook(() => useApplicationList(10)); // 10 per page

    await waitFor(() => {
      expect(result.current.state.totalPages).toBe(2);
    });

    act(() => {
      result.current.handlers.handlePageChange(2);
    });

    await waitFor(() => {
        expect(result.current.state.currentPage).toBe(2);
    });
  });

  it('should handle search', async () => {
    apiService.getApplications.mockResolvedValue({ applications: [], total: 0 });
    const { result } = renderHook(() => useApplicationList());

    act(() => {
      result.current.handlers.setSearchQuery('test');
    });

    act(() => {
      result.current.handlers.handleSearch();
    });

    await waitFor(() => {
      expect(apiService.getApplications).toHaveBeenCalledWith(expect.objectContaining({ search: 'test' }));
    });
  });
});
