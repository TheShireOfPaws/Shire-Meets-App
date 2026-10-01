import { useCallback, useEffect, useRef, useState } from 'react';
import { getAvailable } from '../services/dogService';
import { getErrorMessage } from '../services/api';
import { rankDogs } from '../utils/matching';

export const VISIBLE_CARDS = 3;
const PAGE_SIZE = 50;
// Se cargan todos (hasta 500 por tanda) para poder ordenarlos por afinidad
const MAX_PAGES = 10;

export default function useDogDeck({ ready, seenIds, preferences }) {
  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  // Sube al reiniciar la pila: descarta respuestas de cargas anteriores
  const generationRef = useRef(0);
  const latest = useRef({});
  latest.current = { deck, seenIds, preferences };

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const generation = generationRef.current;
    setLoading(true);
    setError(null);

    try {
      const all = [];
      let last = false;
      for (let pages = 0; !last && pages < MAX_PAGES; pages++) {
        const page = await getAvailable({ page: pageRef.current, pageSize: PAGE_SIZE });
        if (generation !== generationRef.current) return;
        pageRef.current += 1;
        last = page.last;
        all.push(...page.content);
      }
      const { deck: current, seenIds: seen, preferences: prefs } = latest.current;
      const inDeck = new Set(current.map((d) => d.id));
      const fresh = rankDogs(all.filter((d) => !seen.has(d.id) && !inDeck.has(d.id)), prefs);
      setDeck((prev) => [...prev, ...fresh.filter((d) => !prev.some((p) => p.id === d.id))]);
      setHasMore(!last);
    } catch (err) {
      if (generation === generationRef.current) setError(getErrorMessage(err));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // También durante la bienvenida, para que las preferencias puedan contar los "great match"
  useEffect(() => {
    if (ready && deck.length < VISIBLE_CARDS && hasMore && !loading && !error) loadMore();
  }, [ready, deck.length, hasMore, loading, error, loadMore]);

  const remove = useCallback((id) => setDeck((prev) => prev.filter((d) => d.id !== id)), []);

  const putBack = useCallback(
    (dog) => setDeck((prev) => [dog, ...prev.filter((d) => d.id !== dog.id)]),
    []
  );

  const rerank = useCallback((prefs) => setDeck((prev) => rankDogs(prev, prefs)), []);

  const reset = useCallback(() => {
    generationRef.current += 1;
    pageRef.current = 0;
    setDeck([]);
    setHasMore(true);
    setError(null);
  }, []);

  return { deck, loading, hasMore, error, loadMore, remove, putBack, rerank, reset };
}
