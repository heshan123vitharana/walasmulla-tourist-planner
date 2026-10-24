/**
 * PlaceCard.test.jsx — Unit tests for the PlaceCard directory card component.
 */
import React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PlaceCard from '../PlaceCard';

/* ─── Mock PlanContext ─────────────────────────────────────────── */
const mockAddPlace = vi.fn();
const mockRemovePlace = vi.fn();
let mockPlaceIds = [];

vi.mock('../../context/PlanContext', () => ({
  usePlan: () => ({
    placeIds: mockPlaceIds,
    addPlace: mockAddPlace,
    removePlace: mockRemovePlace,
  }),
}));

/* ─── Fixtures ─────────────────────────────────────────────────── */
const samplePlace = {
  _id: 'place-001',
  name: 'Mulkirigala Raja Maha Vihara',
  slug: 'mulkirigala-raja-maha-vihara',
  description: 'Ancient rock temple with beautiful murals and panoramic views.',
  imageUrl: 'https://example.com/mulkirigala.jpg',
  visitDurationMinutes: 90,
  distanceKm: 11.0,
  categories: [
    { _id: 'cat-1', name: 'Heritage', slug: 'heritage' },
    { _id: 'cat-2', name: 'Religious', slug: 'religious' },
  ],
};

function renderCard(placeOverrides = {}) {
  const place = { ...samplePlace, ...placeOverrides };
  return render(
    <MemoryRouter>
      <PlaceCard place={place} />
    </MemoryRouter>,
  );
}

/* ─── Tests ────────────────────────────────────────────────────── */
describe('PlaceCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockPlaceIds = [];
  });

  it('renders the place name', () => {
    renderCard();
    expect(screen.getByText('Mulkirigala Raja Maha Vihara')).toBeInTheDocument();
  });

  it('renders the place description', () => {
    renderCard();
    expect(
      screen.getByText('Ancient rock temple with beautiful murals and panoramic views.'),
    ).toBeInTheDocument();
  });

  it('renders category badges', () => {
    renderCard();
    expect(screen.getByText('Heritage')).toBeInTheDocument();
    expect(screen.getByText('Religious')).toBeInTheDocument();
  });

  it('renders visit duration in minutes', () => {
    renderCard();
    expect(screen.getByText('90 min')).toBeInTheDocument();
  });

  it('renders distance from Walasmulla', () => {
    renderCard();
    expect(screen.getByText('11.0 km')).toBeInTheDocument();
  });

  it('does not render distance when distanceKm is null', () => {
    renderCard({ distanceKm: null });
    expect(screen.queryByText(/km/)).not.toBeInTheDocument();
  });

  it('renders the place image with correct alt text', () => {
    renderCard();
    const img = screen.getByRole('img', { name: 'Mulkirigala Raja Maha Vihara' });
    expect(img).toHaveAttribute('src', 'https://example.com/mulkirigala.jpg');
  });

  it('renders a MapPin placeholder when imageUrl is absent', () => {
    renderCard({ imageUrl: '' });
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });

  it('links to the place detail page using slug', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/places/mulkirigala-raja-maha-vihara');
  });

  it('shows "Add to plan" button when place is NOT in plan', () => {
    renderCard();
    const btn = screen.getByTitle('Add to plan');
    expect(btn).toBeInTheDocument();
  });

  it('calls addPlace when the add button is clicked', () => {
    renderCard();
    const btn = screen.getByTitle('Add to plan');
    fireEvent.click(btn);
    expect(mockAddPlace).toHaveBeenCalledWith(expect.objectContaining({ _id: 'place-001' }));
  });

  it('shows "Remove from plan" and calls removePlace when place IS in plan', () => {
    mockPlaceIds = ['place-001'];
    renderCard();
    const btn = screen.getByTitle('Remove from plan');
    expect(btn).toBeInTheDocument();
    fireEvent.click(btn);
    expect(mockRemovePlace).toHaveBeenCalledWith('place-001');
  });

  it('limits displayed categories to 2', () => {
    renderCard({
      categories: [
        { _id: 'c1', name: 'Heritage', slug: 'heritage' },
        { _id: 'c2', name: 'Religious', slug: 'religious' },
        { _id: 'c3', name: 'Cultural', slug: 'cultural' },
      ],
    });
    expect(screen.getByText('Heritage')).toBeInTheDocument();
    expect(screen.getByText('Religious')).toBeInTheDocument();
    expect(screen.queryByText('Cultural')).not.toBeInTheDocument();
  });
});
