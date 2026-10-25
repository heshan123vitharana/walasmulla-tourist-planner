import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '../LoginPage';
import RegisterPage from '../RegisterPage';
import { AuthProvider } from '../../context/AuthContext';
import { ToastProvider } from '../../context/ToastContext';

function renderWithProviders(ui) {
  return render(
    <MemoryRouter>
      <ToastProvider>
        <AuthProvider>
          {ui}
        </AuthProvider>
      </ToastProvider>
    </MemoryRouter>
  );
}

describe('LoginPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders login form inputs and submit button', () => {
    renderWithProviders(<LoginPage />);
    expect(screen.getByLabelText(/Username/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign in/i })).toBeInTheDocument();
  });

  it('toggles password visibility when eye icon is clicked', () => {
    renderWithProviders(<LoginPage />);
    const passwordInput = screen.getByLabelText(/^Password/i, { selector: 'input' });
    expect(passwordInput).toHaveAttribute('type', 'password');

    const toggleButton = screen.getByRole('button', { name: /Show password/i });
    fireEvent.click(toggleButton);

    expect(passwordInput).toHaveAttribute('type', 'text');
    expect(screen.getByRole('button', { name: /Hide password/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Hide password/i }));
    expect(passwordInput).toHaveAttribute('type', 'password');
  });

  it('enforces lockout cooldown when lock is stored in localStorage', () => {
    const lockUntil = Date.now() + 25 * 1000;
    localStorage.setItem('wtp_login_lock_until', lockUntil.toString());

    renderWithProviders(<LoginPage />);
    expect(screen.getByText(/Security Cooldown Active/i)).toBeInTheDocument();
    expect(screen.getByText(/Locked/i)).toBeInTheDocument();
  });
});

describe('RegisterPage Component', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  it('renders register form inputs with password and confirm fields', () => {
    renderWithProviders(<RegisterPage />);
    expect(screen.getByLabelText(/^Username/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm Password/i, { selector: 'input' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create Account/i })).toBeInTheDocument();
  });

  it('toggles password and confirm password visibility', () => {
    renderWithProviders(<RegisterPage />);
    const passwordInput = screen.getByLabelText(/^Password/i, { selector: 'input' });
    const confirmInput = screen.getByLabelText(/^Confirm Password/i, { selector: 'input' });

    expect(passwordInput).toHaveAttribute('type', 'password');
    expect(confirmInput).toHaveAttribute('type', 'password');

    const toggleButtons = screen.getAllByRole('button', { name: /Show password/i });
    expect(toggleButtons.length).toBe(2);

    // Toggle main password
    fireEvent.click(toggleButtons[0]);
    expect(passwordInput).toHaveAttribute('type', 'text');

    // Toggle confirm password
    fireEvent.click(toggleButtons[1]);
    expect(confirmInput).toHaveAttribute('type', 'text');
  });

  it('shows error if passwords do not match upon submit', async () => {
    renderWithProviders(<RegisterPage />);
    const usernameInput = screen.getByLabelText(/^Username/i, { selector: 'input' });
    const passwordInput = screen.getByLabelText(/^Password/i, { selector: 'input' });
    const confirmInput = screen.getByLabelText(/^Confirm Password/i, { selector: 'input' });

    fireEvent.change(usernameInput, { target: { value: 'validuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'different123' } });

    fireEvent.click(screen.getByRole('button', { name: /Create Account/i }));

    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
  });
});
