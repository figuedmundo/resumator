import { renderWithProviders, screen, userEvent, waitFor } from '../../../../test-utils/test-utils';
import LoginPage from '../../../../pages/auth/Login/LoginPage';
import { describe, it, expect, vi } from 'vitest';

describe('LoginPage', () => {
  it('renders the login form', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    renderWithProviders(<LoginPage />);
    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
        expect(screen.getAllByText(/This field is required/i)).toHaveLength(2);
    });
  });

  it('calls login function on valid submission', async () => {
    const login = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(<LoginPage />, { authContextValue: { login } });

    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'Password123');
    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({
        email: 'test@example.com',
        password: 'Password123',
      });
    });
  });

  it('displays an error message on failed login', async () => {
    const login = vi.fn().mockResolvedValue({ success: false, error: 'Invalid credentials' });
    renderWithProviders(<LoginPage />, { 
        authContextValue: { 
            login,
            error: 'Invalid credentials'
        } 
    });

    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Password/i), 'Wrongpassword123');
    await userEvent.click(screen.getByRole('button', { name: /Sign in/i }));

    expect(await screen.findByText(/Sign in failed/i)).toBeInTheDocument();
    expect(await screen.findByText(/Invalid credentials/i)).toBeInTheDocument();
  });
});
