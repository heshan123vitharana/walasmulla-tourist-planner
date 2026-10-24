/**
 * PlanContext.test.jsx — Unit tests for the PlanContext reducer and PlanProvider.
 *
 * Tests the core plan-builder state management: adding/removing places,
 * reordering stops, setting start time / order mode, and clearing the plan.
 */
import React from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { PlanProvider, usePlan } from '../PlanContext';

/* ─── Helper: wrap hooks in PlanProvider ──────────────────────── */
function renderPlanHook() {
  return renderHook(() => usePlan(), {
    wrapper: ({ children }) => <PlanProvider>{children}</PlanProvider>,
  });
}

/* ─── Fixtures ─────────────────────────────────────────────────── */
const placeA = { _id: 'a', name: 'Mulkirigala Raja Maha Vihara' };
const placeB = { _id: 'b', name: 'Tangalle Beach' };
const placeC = { _id: 'c', name: 'Hummanaya Blowhole' };

/* ─── Tests ────────────────────────────────────────────────────── */
describe('PlanContext', () => {
  describe('initial state', () => {
    it('starts with an empty plan', () => {
      const { result } = renderPlanHook();
      expect(result.current.placeIds).toEqual([]);
      expect(result.current.places).toEqual([]);
    });

    it('defaults startTime to 08:00', () => {
      const { result } = renderPlanHook();
      expect(result.current.startTime).toBe('08:00');
    });

    it('defaults orderMode to auto', () => {
      const { result } = renderPlanHook();
      expect(result.current.orderMode).toBe('auto');
    });
  });

  describe('addPlace', () => {
    it('adds a place to the plan', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      expect(result.current.placeIds).toEqual(['a']);
      expect(result.current.places).toEqual([placeA]);
    });

    it('adds multiple places in order', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeB));
      expect(result.current.placeIds).toEqual(['a', 'b']);
      expect(result.current.places[0].name).toBe('Mulkirigala Raja Maha Vihara');
      expect(result.current.places[1].name).toBe('Tangalle Beach');
    });

    it('ignores duplicate places (same _id)', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeA));
      expect(result.current.placeIds).toEqual(['a']);
      expect(result.current.places.length).toBe(1);
    });

    it('enforces MAX_STOPS limit of 20', () => {
      const { result } = renderPlanHook();
      // Add 20 unique places
      for (let i = 0; i < 20; i++) {
        act(() => result.current.addPlace({ _id: `p${i}`, name: `Place ${i}` }));
      }
      expect(result.current.placeIds.length).toBe(20);
      // 21st should be ignored
      act(() => result.current.addPlace({ _id: 'p20', name: 'Place 20' }));
      expect(result.current.placeIds.length).toBe(20);
    });
  });

  describe('removePlace', () => {
    it('removes a place by its _id', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeB));
      act(() => result.current.removePlace('a'));
      expect(result.current.placeIds).toEqual(['b']);
      expect(result.current.places).toEqual([placeB]);
    });

    it('does nothing when removing a non-existent id', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.removePlace('nonexistent'));
      expect(result.current.placeIds).toEqual(['a']);
    });
  });

  describe('movePlace', () => {
    it('reorders places (move from index 0 to index 2)', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeB));
      act(() => result.current.addPlace(placeC));
      act(() => result.current.movePlace(0, 2));
      expect(result.current.placeIds).toEqual(['b', 'c', 'a']);
      expect(result.current.places.map(p => p.name)).toEqual([
        'Tangalle Beach',
        'Hummanaya Blowhole',
        'Mulkirigala Raja Maha Vihara',
      ]);
    });

    it('reorders places (move from index 2 to index 0)', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeB));
      act(() => result.current.addPlace(placeC));
      act(() => result.current.movePlace(2, 0));
      expect(result.current.placeIds).toEqual(['c', 'a', 'b']);
    });

    it('keeps placeIds and places arrays in sync after move', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeB));
      act(() => result.current.movePlace(0, 1));
      // placeIds order should match places order
      result.current.placeIds.forEach((id, i) => {
        expect(result.current.places[i]._id).toBe(id);
      });
    });
  });

  describe('setStart', () => {
    it('updates the start time', () => {
      const { result } = renderPlanHook();
      act(() => result.current.setStart('09:30'));
      expect(result.current.startTime).toBe('09:30');
    });
  });

  describe('setMode', () => {
    it('switches order mode to manual', () => {
      const { result } = renderPlanHook();
      act(() => result.current.setMode('manual'));
      expect(result.current.orderMode).toBe('manual');
    });

    it('switches back to auto', () => {
      const { result } = renderPlanHook();
      act(() => result.current.setMode('manual'));
      act(() => result.current.setMode('auto'));
      expect(result.current.orderMode).toBe('auto');
    });
  });

  describe('clearPlan', () => {
    it('resets the entire plan to initial state', () => {
      const { result } = renderPlanHook();
      act(() => result.current.addPlace(placeA));
      act(() => result.current.addPlace(placeB));
      act(() => result.current.setStart('10:00'));
      act(() => result.current.setMode('manual'));
      act(() => result.current.clearPlan());
      expect(result.current.placeIds).toEqual([]);
      expect(result.current.places).toEqual([]);
      expect(result.current.startTime).toBe('08:00');
      expect(result.current.orderMode).toBe('auto');
    });
  });
});
