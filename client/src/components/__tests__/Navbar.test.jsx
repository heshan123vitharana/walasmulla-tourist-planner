/**
 * Navbar.test.jsx — Unit tests for the Navbar navigation component.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Navbar from '../Navbar';

/* ─── Mocks ────────────────────────────────────────────────────── */
const mockLogout = vi.fn();
const mockNavigate = vi.fn();
let mockUser = null;
let mockIsAdmin = false;
let mockPlaceIds = [];

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: mockUser,
    logout: mockLogout,
    isAdmin: mockIsAdmin,
  }),
}));

vi.mock('../../context/PlanContext', () => ({
  usePlan: () => ({
    placeIds: mockPlaceIds,
  }),
}));

function renderNavbar() {
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>,
  );
}

/* ─── Tests ────────────────────────────────────────────────────── */
describe('Navbar', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUser = null;
    mockIsAdmin = false;
    mockPlaceIds = [];
  });

  describe('brand', () => {
    it('renders the Walasmulla Planner brand text', () => {
      renderNavbar();
      expect(screen.getByText(/Walasmulla/)).toBeInTheDocument();
      expect(screen.getAllByText(/Planner/).length).toBeGreaterThanOrEqual(1);
    });

    it('renders the Southern Sri Lanka subtitle', () => {
      renderNavbar();
      expect(screen.getByText(/Southern Sri Lanka/)).toBeInTheDocument();
    });
  });

  describe('unauthenticated user', () => {
    it('shows Sign in and Get Started links when logged out', () => {
      renderNavbar();
      expect(screen.getByText('Sign in')).toBeInTheDocument();
      expect(screen.getByText(/Get Started/)).toBeInTheDocument();
    });

    it('does not show My Plans link when logged out', () => {
      renderNavbar();
      expect(screen.queryByText('My Plans')).not.toBeInTheDocument();
    });

    it('does not show Admin link when logged out', () => {
      renderNavbar();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('does not show Logout button when logged out', () => {
      renderNavbar();
      expect(screen.queryByText('Logout')).not.toBeInTheDocument();
    });
  });

  describe('authenticated tourist', () => {
    beforeEach(() => {
      mockUser = { username: 'tourist1', role: 'tourist' };
      mockIsAdmin = false;
    });

    it('displays the username', () => {
      renderNavbar();
      // Username appears in the user chip (desktop)
      const usernameElements = screen.getAllByText('tourist1');
      expect(usernameElements.length).toBeGreaterThan(0);
    });

    it('displays the user role badge', () => {
      renderNavbar();
      const roleElements = screen.getAllByText('tourist');
      expect(roleElements.length).toBeGreaterThan(0);
    });

    it('shows My Plans link for logged-in tourist', () => {
      renderNavbar();
      expect(screen.getByText('My Plans')).toBeInTheDocument();
    });

    it('does not show Admin link for tourist role', () => {
      renderNavbar();
      expect(screen.queryByText('Admin')).not.toBeInTheDocument();
    });

    it('shows Logout button and calls logout + navigate on click', () => {
      renderNavbar();
      const logoutBtn = screen.getByTitle('Sign out');
      fireEvent.click(logoutBtn);
      expect(mockLogout).toHaveBeenCalledOnce();
      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('authenticated admin', () => {
    beforeEach(() => {
      mockUser = { username: 'admin', role: 'admin' };
      mockIsAdmin = true;
    });

    it('shows Admin link with PRO badge for admin user', () => {
      renderNavbar();
      expect(screen.getByText('Admin')).toBeInTheDocument();
      expect(screen.getByText('PRO')).toBeInTheDocument();
    });
  });

  describe('plan badge counter', () => {
    it('does not show counter badge when plan is empty', () => {
      renderNavbar();
      // No badge with a number should appear
      expect(screen.queryByText('0')).not.toBeInTheDocument();
    });

    it('shows the place count badge when places are in the plan', () => {
      mockPlaceIds = ['p1', 'p2', 'p3'];
      renderNavbar();
      // The badge should show the count "3"
      const badges = screen.getAllByText('3');
      expect(badges.length).toBeGreaterThan(0);
    });
  });

  describe('core navigation links', () => {
    it('renders Explore link', () => {
      renderNavbar();
      expect(screen.getByText('Explore')).toBeInTheDocument();
    });

    it('renders Day Planner link', () => {
      renderNavbar();
      expect(screen.getByText('Day Planner')).toBeInTheDocument();
    });
  });

  describe('mobile menu toggle', () => {
    it('renders the hamburger menu button', () => {
      renderNavbar();
      const menuBtn = screen.getByLabelText('Toggle menu');
      expect(menuBtn).toBeInTheDocument();
    });

    it('opens mobile drawer on hamburger click', () => {
      renderNavbar();
      const menuBtn = screen.getByLabelText('Toggle menu');
      fireEvent.click(menuBtn);
      // Mobile drawer renders "Explore Places" text
      expect(screen.getByText('Explore Places')).toBeInTheDocument();
    });
  });
});
