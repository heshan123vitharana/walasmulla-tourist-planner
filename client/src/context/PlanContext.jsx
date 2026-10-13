/**
 * PlanContext.jsx — Manages the current (unsaved) day-plan being built.
 */
import { createContext, useContext, useReducer } from 'react';

const PlanContext = createContext(null);

const MAX_STOPS = 20;

function reducer(state, action) {
  switch (action.type) {
    case 'ADD_PLACE': {
      if (state.placeIds.includes(action.place._id)) return state;
      if (state.placeIds.length >= MAX_STOPS) return state;
      return {
        ...state,
        placeIds: [...state.placeIds, action.place._id],
        places:   [...state.places,   action.place],
      };
    }
    case 'REMOVE_PLACE': {
      const id = action.id;
      return {
        ...state,
        placeIds: state.placeIds.filter((p) => p !== id),
        places:   state.places.filter((p) => p._id !== id),
      };
    }
    case 'MOVE_PLACE': {
      const { from, to } = action;
      const placeIds = [...state.placeIds];
      const places   = [...state.places];
      const [pid]    = placeIds.splice(from, 1);
      const [pl]     = places.splice(from, 1);
      placeIds.splice(to, 0, pid);
      places.splice(to, 0, pl);
      return { ...state, placeIds, places };
    }
    case 'SET_START_TIME':
      return { ...state, startTime: action.value };
    case 'SET_ORDER_MODE':
      return { ...state, orderMode: action.value };
    case 'CLEAR':
      return initialState();
    default:
      return state;
  }
}

function initialState() {
  return { placeIds: [], places: [], startTime: '08:00', orderMode: 'auto' };
}

export function PlanProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialState);

  const addPlace    = (place)        => dispatch({ type: 'ADD_PLACE',    place });
  const removePlace = (id)           => dispatch({ type: 'REMOVE_PLACE', id });
  const movePlace   = (from, to)     => dispatch({ type: 'MOVE_PLACE',   from, to });
  const setStart    = (value)        => dispatch({ type: 'SET_START_TIME', value });
  const setMode     = (value)        => dispatch({ type: 'SET_ORDER_MODE', value });
  const clearPlan   = ()             => dispatch({ type: 'CLEAR' });

  return (
    <PlanContext.Provider value={{ ...state, addPlace, removePlace, movePlace, setStart, setMode, clearPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error('usePlan must be inside <PlanProvider>');
  return ctx;
}
