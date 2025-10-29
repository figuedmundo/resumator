import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { useApplicationForm } from '@/hooks/useApplicationForm';
import apiService from '@/services/api';
import { useNavigate } from 'react-router-dom';

// Mock dependencies
vi.mock('@/services/api');
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(),
}));

describe('useApplicationForm', () => {
  const mockNavigate = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    useNavigate.mockReturnValue(mockNavigate);
    apiService.getApplication.mockResolvedValue({ id: 1, company: 'Test Co' });
    apiService.createApplication.mockResolvedValue({ id: 2, company: 'New Co' });
    apiService.updateApplication.mockResolvedValue({ id: 1, company: 'Updated Co' });
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('initializes with default form data', () => {
    const { result } = renderHook(() => useApplicationForm());
    expect(result.current.formData.company).toBe('');
    expect(result.current.formData.status).toBe('Applied');
  });

  it('loads existing application data if applicationId is provided', async () => {
    const { result } = renderHook(() => useApplicationForm(1));
    
    await waitFor(() => {
      expect(apiService.getApplication).toHaveBeenCalledWith(1);
      expect(result.current.formData.company).toBe('Test Co');
    });
  });

  it('handles form input changes', () => {
    const { result } = renderHook(() => useApplicationForm());
    act(() => {
      result.current.handleChange({ target: { name: 'company', value: 'My Company' } });
    });
    expect(result.current.formData.company).toBe('My Company');
  });

  it('validates the form and sets errors', async () => {
    const { result } = renderHook(() => useApplicationForm());
    let validationResult;
    await act(async () => {
      validationResult = result.current.validateForm();
    });
    expect(validationResult).toBe(false);
    expect(result.current.errors.company).toBe('Company is required');
  });

  it('handles successful form submission for a new application', async () => {
    const { result } = renderHook(() => useApplicationForm(null, mockOnSuccess));
    
    act(() => {
      result.current.handleChange({ target: { name: 'company', value: 'New Co' } });
      result.current.handleChange({ target: { name: 'position', value: 'Dev' } });
      result.current.handleChange({ target: { name: 'resume_id', value: '1' } });
      result.current.handleChange({ target: { name: 'resume_version_id', value: '1' } });
      result.current.handleChange({ target: { name: 'applied_date', value: '2025-10-29' } });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(apiService.createApplication).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalledWith({ id: 2, company: 'New Co' });
  });

  it('handles successful form submission for an existing application', async () => {
    const { result } = renderHook(() => useApplicationForm(1, mockOnSuccess));
    
    act(() => {
      result.current.handleChange({ target: { name: 'company', value: 'Updated Co' } });
      result.current.handleChange({ target: { name: 'position', value: 'Dev' } });
      result.current.handleChange({ target: { name: 'resume_id', value: '1' } });
      result.current.handleChange({ target: { name: 'resume_version_id', value: '1' } });
      result.current.handleChange({ target: { name: 'applied_date', value: '2025-10-29' } });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(apiService.updateApplication).toHaveBeenCalled();
    expect(mockOnSuccess).toHaveBeenCalledWith({ id: 1, company: 'Updated Co' });
  });

  it('navigates on successful submission if onSuccess is not provided', async () => {
    const { result } = renderHook(() => useApplicationForm());
    
    act(() => {
      result.current.handleChange({ target: { name: 'company', value: 'New Co' } });
      result.current.handleChange({ target: { name: 'position', value: 'Dev' } });
      result.current.handleChange({ target: { name: 'resume_id', value: '1' } });
      result.current.handleChange({ target: { name: 'resume_version_id', value: '1' } });
      result.current.handleChange({ target: { name: 'applied_date', value: '2025-10-29' } });
    });

    await act(async () => {
      await result.current.handleSubmit({ preventDefault: vi.fn() });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/applications');
  });
});
