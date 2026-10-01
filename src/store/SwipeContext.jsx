import { createContext, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Preferences } from '@capacitor/preferences';
import { initialState, transitions } from './swipeState';

const STORAGE_KEY = 'shire-match-state';

const SwipeContext = createContext(null);

export function SwipeProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  // Copia síncrona: undo() necesita devolver el perro en el mismo tick
  const stateRef = useRef(initialState);

  useEffect(() => {
    Preferences.get({ key: STORAGE_KEY })
      .then(({ value }) => {
        if (!value) return;
        const next = { ...initialState, ...JSON.parse(value) };
        stateRef.current = next;
        setState(next);
      })
      .catch((err) => console.warn('No se pudo leer el estado guardado', err))
      .finally(() => setReady(true));
  }, []);

  const actions = useMemo(() => {
    const apply = (transition, ...args) => {
      const next = transition(stateRef.current, ...args);
      if (next === stateRef.current) return;
      stateRef.current = next;
      setState(next);
      Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) }).catch((err) =>
        console.warn('No se pudo guardar el estado', err)
      );
    };

    const bound = Object.fromEntries(
      Object.entries(transitions).map(([name, transition]) => [name, (...args) => apply(transition, ...args)])
    );

    bound.undo = () => {
      const dog = stateRef.current.lastAction?.dog ?? null;
      apply(transitions.undo);
      return dog;
    };

    return bound;
  }, []);

  const seenIds = useMemo(
    () => new Set([...Object.keys(state.liked), ...state.passed]),
    [state.liked, state.passed]
  );

  const value = useMemo(
    () => ({ ...state, seenIds, ready, ...actions }),
    [state, seenIds, ready, actions]
  );

  return <SwipeContext.Provider value={value}>{children}</SwipeContext.Provider>;
}

export function useSwipe() {
  const ctx = useContext(SwipeContext);
  if (!ctx) throw new Error('useSwipe debe usarse dentro de SwipeProvider');
  return ctx;
}
