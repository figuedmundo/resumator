import { renderWithProviders, screen, waitFor } from '../../../../test-utils/test-utils';
import userEvent from '@testing-library/user-event';
import RegisterPage from '../../../../pages/auth/Register/RegisterPage';
import { describe, it, expect, vi } from 'vitest';

describe('RegisterPage', () => {
  it('renders the registration form', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create account/i })).toBeInTheDocument();
  });

  it('shows validation errors for invalid input', async () => {
    renderWithProviders(<RegisterPage />);
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/This field is required/i).length).toBe(4);
      expect(screen.getByText(/You must accept the terms and conditions/i)).toBeInTheDocument();
    });
  });

  it('calls register function on valid submission', async () => {
    const register = vi.fn().mockResolvedValue({ success: true });
    renderWithProviders(<RegisterPage />, { authContextValue: { register } });

    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/^Password/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/Confirm password/i), 'Password123');
    await userEvent.click(screen.getByLabelText(/I agree to the/i));
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        email: 'test@example.com',
        username: 'testuser',
        password: 'Password123',
      });
    });
  });

  it('displays an error message on failed registration', async () => {
    const register = vi.fn().mockResolvedValue({ success: false, error: 'Email already exists' });
    renderWithProviders(<RegisterPage />, { 
        authContextValue: { 
            register,
            error: 'Email already exists'
        } 
    });

    await userEvent.type(screen.getByLabelText(/Email address/i), 'test@example.com');
    await userEvent.type(screen.getByLabelText(/Username/i), 'testuser');
    await userEvent.type(screen.getByLabelText(/^Password/i), 'Password123');
    await userEvent.type(screen.getByLabelText(/Confirm password/i), 'Password123');
    await userEvent.click(screen.getByLabelText(/I agree to the/i));
    await userEvent.click(screen.getByRole('button', { name: /Create account/i }));

    expect(await screen.findByText(/Registration failed/i)).toBeInTheDocument();
    expect(await screen.findByText(/Email already exists/i)).toBeInTheDocument();
  });
});