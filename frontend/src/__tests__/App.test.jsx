import { screen } from '@testing-library/react';
import { renderWithProviders } from '../test-utils/test-utils';
import App from '../App';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiService from '../services/api';

describe('App', () => {
  beforeEach(() => {
    // Reset mocks before each test
    vi.restoreAllMocks();
  });

  it('renders login page for unauthenticated users', () => {
    // For this test, apiService.isAuthenticated should return false
    vi.spyOn(apiService, 'isAuthenticated').mockReturnValue(false);

    renderWithProviders(<App />, {
      initialAuthState: { user: null, isAuthenticated: false, isLoading: false },
    });

    expect(screen.getByText(/Sign in to your account/i)).toBeInTheDocument();
  });

  it('renders dashboard for authenticated users', () => {
    const mockUser = { id: 1, email: 'test@test.com', full_name: 'Test User' };
    // For this test, apiService.isAuthenticated should return true
    vi.spyOn(apiService, 'isAuthenticated').mockReturnValue(true);
    vi.spyOn(apiService, 'getCurrentUser').mockReturnValue(mockUser);

    renderWithProviders(<App />, {
      initialAuthState: {
        user: mockUser,
        isAuthenticated: true,
        isLoading: false,
      },
    });

    // The DashboardPage should be rendered, which contains the text "Dashboard"
    expect(screen.getByText(/Dashboard/i)).toBeInTheDocument();
  });
});