import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext, AuthProvider } from '@/hooks/useAuth';
import { vi } from 'vitest';

/**
 * Custom render with all providers.
 * Use this instead of @testing-library/react render.
 */
export function renderWithProviders(
  ui,
  {
    initialAuthState = { user: null, isAuthenticated: false, isLoading: false },
    authContextValue = {},
    route = '/',
    ...renderOptions
  } = {}
) {
  window.history.pushState({}, 'Test page', route);

  function Wrapper({ children }) {
    const authValue = {
      ...initialAuthState,
      login: vi.fn().mockResolvedValue({ success: true }),
      register: vi.fn(),
      logout: vi.fn(),
      clearError: vi.fn(),
      updateUser: vi.fn(),
      ...authContextValue,
    };

    return (
      <BrowserRouter>
        <AuthContext.Provider value={authValue}>
          {children}
        </AuthContext.Provider>
      </BrowserRouter>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from @testing-library/react
export * from '@testing-library/react';
export { default as userEvent } from '@testing-library/user-event';
