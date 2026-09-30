import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { arrowUndo, close, heart, optionsOutline } from 'ionicons/icons';

import FilterSheet, { NO_FILTERS } from '../components/FilterSheet';
import MatchModal from '../components/MatchModal';
import SwipeCard from '../components/SwipeCard';
import { getAvailable } from '../services/dogService';
import { getErrorMessage } from '../services/api';
import { useSwipe } from '../store/SwipeContext';
import { GENDER_LABELS, SIZE_LABELS } from '../utils/labels';
import './Discover.css';

const VISIBLE = 3;
const PAGE_SIZE = 20;

export default function Discover() {
  const history = useHistory();
  const { ready, seenIds, lastAction, like, pass, undo, resetPassed } = useSwipe();

  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [matchDog, setMatchDog] = useState(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [filters, setFilters] = useState(NO_FILTERS);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const topCardRef = useRef(null);
  // Refs para leer el valor actual dentro de la carga asíncrona
  const seenRef = useRef(seenIds);
  seenRef.current = seenIds;
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  // Sube al reiniciar la pila: descarta respuestas de cargas anteriores
  const generationRef = useRef(0);
  // Color fijo por perro para que no cambie al avanzar la pila
  const colors = useRef({ map: new Map(), next: 0 });

  const colorOf = (id) => {
    const c = colors.current;
    if (!c.map.has(id)) c.map.set(id, c.next++);
    return c.map.get(id);
  };

  const loadMore = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;
    const generation = generationRef.current;
    setLoading(true);
    setError(null);

    try {
      let added = [];
      let last = false;
      // Si una página queda vacía tras filtrar, se pide la siguiente
      while (added.length === 0 && !last) {
        const page = await getAvailable({
          page: pageRef.current,
          pageSize: PAGE_SIZE,
          ...filtersRef.current,
        });
        if (generation !== generationRef.current) return;
        pageRef.current += 1;
        last = page.last;
        const inDeck = new Set(deckRef.current.map((d) => d.id));
        added = page.content.filter((d) => !seenRef.current.has(d.id) && !inDeck.has(d.id));
      }
      setDeck((prev) => [...prev, ...added.filter((d) => !prev.some((p) => p.id === d.id))]);
      setHasMore(!last);
    } catch (err) {
      if (generation === generationRef.current) setError(getErrorMessage(err));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Carga inicial y precarga cuando quedan menos de 3 tarjetas
  useEffect(() => {
    if (ready && deck.length < VISIBLE && hasMore && !loading && !error) loadMore();
  }, [ready, deck.length, hasMore, loading, error, loadMore]);

  const handleSwiped = useCallback(
    (dog, dir) => {
      if (dir === 'right') {
        like(dog);
        setMatchDog(dog);
        setMatchOpen(true);
      } else {
        pass(dog);
      }
      setDeck((prev) => prev.filter((d) => d.id !== dog.id));
    },
    [like, pass]
  );

  const handleOpen = useCallback(
    (dog) => history.push(`/dog/${dog.id}`, { dog }),
    [history]
  );

  function handleRequest() {
    setMatchOpen(false);
    history.push(`/dog/${matchDog.id}?adopt=1`, { dog: matchDog });
  }

  function handleUndo() {
    const dog = undo();
    if (dog) setDeck((prev) => [dog, ...prev.filter((d) => d.id !== dog.id)]);
  }

  function resetDeck() {
    generationRef.current += 1;
    pageRef.current = 0;
    setDeck([]);
    setHasMore(true);
    setError(null);
  }

  function handleSeeAgain() {
    resetPassed();
    resetDeck();
  }

  function applyFilters(next) {
    setFiltersOpen(false);
    if (next.size === filters.size && next.gender === filters.gender) return;
    setFilters(next);
    resetDeck();
  }

  const activeFilters = [SIZE_LABELS[filters.size], GENDER_LABELS[filters.gender]].filter(Boolean);
  const hasFilters = activeFilters.length > 0;
  const filtersLabel = hasFilters ? `filters (${activeFilters.length} on)` : 'filters';

  const visible = deck.slice(0, VISIBLE);
  const isEmpty = deck.length === 0;

  let body;
  if (!ready || (isEmpty && loading)) {
    body = (
      <div className="discover__state">
        <IonSpinner name="crescent" color="primary" />
        <p>looking for dogs…</p>
      </div>
    );
  } else if (isEmpty && error) {
    body = (
      <div className="discover__state" role="alert">
        <p>{error}</p>
        <IonButton onClick={loadMore}>try again</IonButton>
      </div>
    );
  } else if (isEmpty && !hasMore) {
    body = (
      <div className="discover__state">
        {hasFilters ? (
          <>
            <h2>No more dogs with these filters</h2>
            <p>Try other filters or give the others another look.</p>
            <IonButton onClick={() => applyFilters(NO_FILTERS)}>clear filters</IonButton>
          </>
        ) : (
          <>
            <h2>You've seen them all</h2>
            <p>Check your matches or give the others another look.</p>
            <IonButton onClick={() => history.push('/matches')}>see my matches</IonButton>
          </>
        )}
        <IonButton fill="outline" onClick={handleSeeAgain}>
          see them again
        </IonButton>
      </div>
    );
  } else {
    body = (
      <>
        <div className="discover__deck">
          {visible.map((dog, i) => (
            <SwipeCard
              key={dog.id}
              ref={i === 0 ? topCardRef : undefined}
              dog={dog}
              colorIndex={colorOf(dog.id)}
              depth={i}
              isTop={i === 0}
              onSwiped={handleSwiped}
              onOpen={handleOpen}
            />
          ))}
        </div>
        <div className="discover__actions">
          <button
            type="button"
            className="action-btn action-btn--undo"
            aria-label="undo"
            disabled={!lastAction}
            onClick={handleUndo}
          >
            <IonIcon icon={arrowUndo} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="action-btn action-btn--pass"
            aria-label="pass"
            onClick={() => topCardRef.current?.swipe('left')}
          >
            <IonIcon icon={close} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="action-btn action-btn--like"
            aria-label="like"
            onClick={() => topCardRef.current?.swipe('right')}
          >
            <IonIcon icon={heart} aria-hidden="true" />
          </button>
        </div>
      </>
    );
  }

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Discover</IonTitle>
          <IonButtons slot="end">
            {/* key: Ionic solo copia aria-label al botón interno al montarse */}
            <IonButton
              key={filtersLabel}
              onClick={() => setFiltersOpen(true)}
              aria-label={filtersLabel}
            >
              <IonIcon slot="icon-only" icon={optionsOutline} aria-hidden="true" />
              {hasFilters && <span className="filters-dot" aria-hidden="true" />}
            </IonButton>
          </IonButtons>
        </IonToolbar>
        {hasFilters && (
          <IonToolbar className="discover__filters">
            <p>
              showing: {activeFilters.join(' · ')}
              <button type="button" onClick={() => applyFilters(NO_FILTERS)}>
                clear filters
              </button>
            </p>
          </IonToolbar>
        )}
      </IonHeader>
      <IonContent scrollY={false}>
        <div className="discover">{body}</div>
        <MatchModal
          dog={matchDog}
          isOpen={matchOpen}
          onRequest={handleRequest}
          onClose={() => setMatchOpen(false)}
        />
        <FilterSheet
          isOpen={filtersOpen}
          filters={filters}
          onApply={applyFilters}
          onClose={() => setFiltersOpen(false)}
        />
      </IonContent>
    </IonPage>
  );
}
