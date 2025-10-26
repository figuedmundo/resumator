import { renderHook, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../../hooks/useAuth';
import apiService from '../../services/api';
import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the apiService
vi.mock('../../services/api');

describe('useAuth hook', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    // Mock localStorage
    Storage.prototype.getItem = vi.fn();
    Storage.prototype.setItem = vi.fn();
    Storage.prototype.removeItem = vi.fn();
  });

  it('should have correct initial state', () => {
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should handle successful login', async () => {
    const mockUser = { id: 1, email: 'test@test.com' };
    apiService.login.mockResolvedValue({ user: mockUser });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });

    expect(result.current.user).toEqual(mockUser);
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should handle failed login', async () => {
    const error = 'Invalid credentials';
    apiService.login.mockRejectedValue({ response: { data: { detail: error } } });
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });

    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'wrong' });
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.error).toBe(error);
  });

  it('should handle logout', async () => {
    // First, simulate a logged-in state
    const mockUser = { id: 1, email: 'test@test.com' };
    apiService.login.mockResolvedValue({ user: mockUser });
    apiService.isAuthenticated.mockReturnValue(true);
    const { result } = renderHook(() => useAuth(), { wrapper: AuthProvider });
    await act(async () => {
      await result.current.login({ email: 'test@test.com', password: 'password' });
    });

    // Then, logout
    await act(async () => {
      await result.current.logout();
    });

    expect(result.current.user).toBeNull();
    expect(result.current.isAuthenticated).toBe(false);
    expect(apiService.logout).toHaveBeenCalled();
  });
});
