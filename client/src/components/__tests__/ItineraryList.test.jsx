/**
 * ItineraryList.test.jsx — Unit tests for the generated itinerary display component.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ItineraryList from '../ItineraryList';

/* ─── Fixtures ─────────────────────────────────────────────────── */
const mockStops = [
  {
    place: {
      _id: 'p1',
      name: 'Mulkirigala Raja Maha Vihara',
      categories: [{ _id: 'c1', name: 'Heritage' }],
    },
    arrivalTime: '08:00',
    departureTime: '09:30',
    visitMinutes: 90,
    travelMinutes: 0,
  },
  {
    place: {
      _id: 'p2',
      name: 'Tangalle Beach',
      categories: [{ _id: 'c2', name: 'Nature' }],
    },
    arrivalTime: '10:05',
    departureTime: '11:05',
    visitMinutes: 60,
    travelMinutes: 35,
  },
  {
    place: {
      _id: 'p3',
      name: 'Hummanaya Blowhole',
      categories: [],
    },
    arrivalTime: '11:30',
    departureTime: '12:15',
    visitMinutes: 45,
    travelMinutes: 25,
  },
];

/* ─── Tests ────────────────────────────────────────────────────── */
describe('ItineraryList', () => {
  describe('empty state', () => {
    it('shows prompt text when no stops are provided', () => {
      render(<ItineraryList stops={[]} warnings={[]} />);
      expect(screen.getByText(/Generate Itinerary/)).toBeInTheDocument();
    });

    it('shows prompt text when stops prop is omitted', () => {
      render(<ItineraryList />);
      expect(screen.getByText(/Generate Itinerary/)).toBeInTheDocument();
    });
  });

  describe('rendering stops', () => {
    it('renders all stop names', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      expect(screen.getByText('Mulkirigala Raja Maha Vihara')).toBeInTheDocument();
      expect(screen.getByText('Tangalle Beach')).toBeInTheDocument();
      expect(screen.getByText('Hummanaya Blowhole')).toBeInTheDocument();
    });

    it('renders sequential stop numbers (1, 2, 3)', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('2')).toBeInTheDocument();
      expect(screen.getByText('3')).toBeInTheDocument();
    });

    it('shows arrival time for each stop', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      expect(screen.getByText('Arrive 08:00')).toBeInTheDocument();
      expect(screen.getByText('Arrive 10:05')).toBeInTheDocument();
      expect(screen.getByText('Arrive 11:30')).toBeInTheDocument();
    });

    it('shows departure time for each stop', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      expect(screen.getByText('Leave 09:30')).toBeInTheDocument();
      expect(screen.getByText('Leave 11:05')).toBeInTheDocument();
      expect(screen.getByText('Leave 12:15')).toBeInTheDocument();
    });

    it('shows visit duration for each stop', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      expect(screen.getByText('90 min visit')).toBeInTheDocument();
      expect(screen.getByText('60 min visit')).toBeInTheDocument();
      expect(screen.getByText('45 min visit')).toBeInTheDocument();
    });

    it('shows travel time for stops after the first', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      // First stop should NOT show travel time (i === 0)
      expect(screen.queryByText('0 min travel')).not.toBeInTheDocument();
      // Subsequent stops show travel minutes
      expect(screen.getByText('35 min travel')).toBeInTheDocument();
      expect(screen.getByText('25 min travel')).toBeInTheDocument();
    });

    it('renders category names joined with a dot separator', () => {
      render(<ItineraryList stops={mockStops} warnings={[]} />);
      expect(screen.getByText('Heritage')).toBeInTheDocument();
      expect(screen.getByText('Nature')).toBeInTheDocument();
    });
  });

  describe('warnings', () => {
    it('renders warning messages', () => {
      const warnings = [
        'Your plan finishes after 18:00 — consider removing a stop.',
        'Rekawa Turtle Conservation is a night-time activity.',
      ];
      render(<ItineraryList stops={mockStops} warnings={warnings} />);
      expect(
        screen.getByText('Your plan finishes after 18:00 — consider removing a stop.'),
      ).toBeInTheDocument();
      expect(
        screen.getByText('Rekawa Turtle Conservation is a night-time activity.'),
      ).toBeInTheDocument();
    });

    it('renders no warning elements when warnings array is empty', () => {
      const { container } = render(<ItineraryList stops={mockStops} warnings={[]} />);
      // Warning boxes have amber styling
      const warningBoxes = container.querySelectorAll('.bg-amber-900\\/30');
      expect(warningBoxes.length).toBe(0);
    });
  });

  describe('single stop', () => {
    it('renders a single stop correctly without travel time', () => {
      render(<ItineraryList stops={[mockStops[0]]} warnings={[]} />);
      expect(screen.getByText('Mulkirigala Raja Maha Vihara')).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument();
      expect(screen.getByText('Arrive 08:00')).toBeInTheDocument();
      expect(screen.queryByText(/min travel/)).not.toBeInTheDocument();
    });
  });
});
