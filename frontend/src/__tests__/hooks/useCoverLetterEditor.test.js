import { renderHook, waitFor, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCoverLetterEditor } from '../../hooks/useCoverLetterEditor';
import apiService from '../../services/api';
import * as ReactRouter from 'react-router-dom';

// Mock dependencies
vi.mock('react-router-dom', async () => ({
  ...(await vi.importActual('react-router-dom')),
  useParams: vi.fn(),
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ state: null })),
}));

vi.mock('../../services/api', () => ({
  default: {
    getCoverLetter: vi.fn(),
    updateCoverLetter: vi.fn(),
    updateCoverLetterVersion: vi.fn(),
    createCoverLetter: vi.fn(),
  },
}));

describe('useCoverLetterEditor', () => {
  const { useParams } = ReactRouter;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with default state for a new cover letter', () => {
    useParams.mockReturnValue({ id: 'new' });

    const { result } = renderHook(() => useCoverLetterEditor());

    expect(result.current.state.isLoading).toBe(false);
    expect(result.current.state.title).toBe('Untitled Cover Letter');
    expect(result.current.state.content).toContain('Dear Hiring Manager');
  });

  it('should load existing cover letter data', async () => {
    const mockCoverLetter = {
      id: 'cl123',
      title: 'My Awesome CL',
      versions: [{ id: 'v1', markdown_content: 'Version 1 content' }],
    };

    useParams.mockReturnValue({ id: 'cl123' });
    apiService.getCoverLetter.mockResolvedValue(mockCoverLetter);

    const { result } = renderHook(() => useCoverLetterEditor());

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    expect(apiService.getCoverLetter).toHaveBeenCalledWith('cl123');
    expect(result.current.state.title).toBe('My Awesome CL');
    expect(result.current.state.versions).toEqual(mockCoverLetter.versions);
    expect(result.current.state.content).toBe('Version 1 content');
  });

  it('should handle manual save for an existing cover letter', async () => {
    useParams.mockReturnValue({ id: 'cl123' });
    apiService.getCoverLetter.mockResolvedValue({
      id: 'cl123',
      title: 'Initial Title',
      versions: [{ id: 'v1', markdown_content: 'Initial content' }],
    });

    const { result } = renderHook(() => useCoverLetterEditor());

    await waitFor(() => {
      expect(result.current.state.isLoading).toBe(false);
    });

    act(() => {
      result.current.handlers.setTitle('Updated Title');
      result.current.handlers.setContent('Updated content');
    });

    await act(async () => {
      await result.current.handlers.handleManualSave();
    });

    expect(apiService.updateCoverLetter).toHaveBeenCalledWith('cl123', { title: 'Updated Title' });
    expect(apiService.updateCoverLetterVersion).toHaveBeenCalledWith('cl123', 'v1', { content: 'Updated content' });
  });
});
