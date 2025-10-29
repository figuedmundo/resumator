import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useResumeEditor } from '../../hooks/useResumeEditor';
import apiService from '../../services/api';
import * as ReactRouter from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')), // import and retain original exports
  useParams: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ state: null })),
}));

vi.mock('../../services/api', () => ({
  default: {
    getResume: vi.fn(),
    getResumeVersions: vi.fn(),
    updateResumeVersion: vi.fn(),
    createResume: vi.fn(),
    updateResume: vi.fn(),
  },
}));

describe('useResumeEditor', () => {
  const { useParams } = ReactRouter;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state for a new resume', () => {
    useParams.mockReturnValue({ id: 'new' });

    const { result } = renderHook(() => useResumeEditor());

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.title).toBe('Untitled Resume');
    expect(result.current.state.content).toContain('# Your Name');
    expect(result.current.state.versions).toEqual([]);
    expect(result.current.state.error).toBe(null);
  });

  it('should load existing resume data and versions', async () => {
    const mockResume = { id: '123', title: 'My Awesome Resume' };
    const mockVersions = [{ id: 'v1', markdown_content: 'Version 1' }];

    useParams.mockReturnValue({ id: '123' });
    apiService.getResume.mockResolvedValue(mockResume);
    apiService.getResumeVersions.mockResolvedValue({ versions: mockVersions });

    const { result } = renderHook(() => useResumeEditor());

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    expect(apiService.getResume).toHaveBeenCalledWith('123');
    expect(apiService.getResumeVersions).toHaveBeenCalledWith('123');
    expect(result.current.state.title).toBe('My Awesome Resume');
    expect(result.current.state.versions).toEqual(mockVersions);
    expect(result.current.state.content).toBe('Version 1');
  });
});
