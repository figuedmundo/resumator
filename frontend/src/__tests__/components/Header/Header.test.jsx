import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import Header from '../../../components/Header/Header';
import { ThemeProvider } from '../../../contexts/ThemeContext';
import { AuthContext } from '../../../hooks/useAuth';

describe('Header', () => {
  const mockAuth = {
    user: { email: 'test@example.com', full_name: 'Test User' },
    logout: vi.fn(),
  };

  const renderComponent = () => {
    return render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <AuthContext.Provider value={mockAuth}>
          <ThemeProvider>
            <Header />
          </ThemeProvider>
        </AuthContext.Provider>
      </MemoryRouter>
    );
  };

  it('renders the theme toggle button', () => {
    renderComponent();
    const toggleButton = screen.getByTitle(/Switch to/);
    expect(toggleButton).toBeInTheDocument();
  });

  it('toggles the theme when the button is clicked', () => {
    renderComponent();
    const toggleButton = screen.getByTitle(/Switch to/);

    // Check initial state (defaults to light)
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    // Click to switch to dark
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(true);

    // Click to switch back to light
    fireEvent.click(toggleButton);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
