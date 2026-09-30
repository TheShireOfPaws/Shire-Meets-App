import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Preferences } from '@capacitor/preferences';

const STORAGE_KEY = 'shire-match-state';

const initialState = {
  liked: {}, // { [id]: { dog, likedAt, requested, seen } }
  passed: [], // [id]
  lastAction: null, // { type: 'like' | 'pass', dog }
  profile: null,
  preferences: null, // null = aún no ha pasado por la pantalla de preferencias
};

const SwipeContext = createContext(null);

export function SwipeProvider({ children }) {
  const [state, setState] = useState(initialState);
  const [ready, setReady] = useState(false);
  // Copia síncrona del estado: permite que undo() devuelva el perro al momento
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

  // Aplica un cambio, lo publica y lo guarda en el dispositivo
  const update = useCallback((fn) => {
    const next = fn(stateRef.current);
    if (next === stateRef.current) return;
    stateRef.current = next;
    setState(next);
    Preferences.set({ key: STORAGE_KEY, value: JSON.stringify(next) }).catch((err) =>
      console.warn('No se pudo guardar el estado', err)
    );
  }, []);

  const like = useCallback(
    (dog) =>
      update((s) => ({
        ...s,
        liked: {
          ...s.liked,
          [dog.id]: {
            dog,
            likedAt: new Date().toISOString(),
            requested: s.liked[dog.id]?.requested ?? false,
            seen: false, // se marca al salir de Matches
          },
        },
        passed: s.passed.filter((id) => id !== dog.id),
        lastAction: { type: 'like', dog },
      })),
    [update]
  );

  const pass = useCallback(
    (dog) =>
      update((s) => ({
        ...s,
        passed: s.passed.includes(dog.id) ? s.passed : [...s.passed, dog.id],
        lastAction: { type: 'pass', dog },
      })),
    [update]
  );

  const undo = useCallback(() => {
    const action = stateRef.current.lastAction;
    if (!action) return null;

    update((s) => {
      const { [action.dog.id]: _removed, ...liked } = s.liked;
      return action.type === 'like'
        ? { ...s, liked, lastAction: null }
        : { ...s, passed: s.passed.filter((id) => id !== action.dog.id), lastAction: null };
    });
    return action.dog;
  }, [update]);

  const unlike = useCallback(
    (id) =>
      update((s) => {
        if (!s.liked[id]) return s;
        const { [id]: _removed, ...liked } = s.liked;
        const lastAction = s.lastAction?.dog.id === id ? null : s.lastAction;
        return { ...s, liked, lastAction };
      }),
    [update]
  );

  // Actualiza los datos de un perro ya guardado (p. ej. si lo han adoptado)
  const refreshDog = useCallback(
    (dog) =>
      update((s) => {
        const entry = s.liked[dog.id];
        if (!entry) return s;
        return { ...s, liked: { ...s.liked, [dog.id]: { ...entry, dog } } };
      }),
    [update]
  );

  const markRequested = useCallback(
    (dog) =>
      update((s) => ({
        ...s,
        liked: {
          ...s.liked,
          [dog.id]: {
            dog,
            likedAt: s.liked[dog.id]?.likedAt ?? new Date().toISOString(),
            requested: true,
            seen: true,
          },
        },
      })),
    [update]
  );

  const resetPassed = useCallback(
    () =>
      update((s) => ({
        ...s,
        passed: [],
        lastAction: s.lastAction?.type === 'pass' ? null : s.lastAction,
      })),
    [update]
  );

  const markAllSeen = useCallback(
    () =>
      update((s) => {
        if (!Object.values(s.liked).some((e) => e.seen === false)) return s;
        const liked = Object.fromEntries(
          Object.entries(s.liked).map(([id, e]) => [id, { ...e, seen: true }])
        );
        return { ...s, liked };
      }),
    [update]
  );

  const saveProfile = useCallback((profile) => update((s) => ({ ...s, profile })), [update]);

  const savePreferences = useCallback(
    (preferences) => update((s) => ({ ...s, preferences })),
    [update]
  );

  const seenIds = useMemo(
    () => new Set([...Object.keys(state.liked), ...state.passed]),
    [state.liked, state.passed]
  );

  const value = useMemo(
    () => ({
      ...state,
      seenIds,
      ready,
      like,
      pass,
      undo,
      unlike,
      refreshDog,
      markRequested,
      resetPassed,
      markAllSeen,
      saveProfile,
      savePreferences,
    }),
    [state, seenIds, ready, like, pass, undo, unlike, refreshDog, markRequested, resetPassed, markAllSeen, saveProfile, savePreferences]
  );

  return <SwipeContext.Provider value={value}>{children}</SwipeContext.Provider>;
}

export function useSwipe() {
  const ctx = useContext(SwipeContext);
  if (!ctx) throw new Error('useSwipe debe usarse dentro de SwipeProvider');
  return ctx;
}
