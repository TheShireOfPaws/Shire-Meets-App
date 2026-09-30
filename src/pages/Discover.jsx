import { useCallback, useEffect, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonButton, IonContent, IonIcon, IonPage, IonSpinner } from '@ionic/react';
import { arrowUndo, close, heart } from 'ionicons/icons';

import DogSheet from '../components/DogSheet';
import MatchModal from '../components/MatchModal';
import PageHeader from '../components/PageHeader';
import PreferencesModal from '../components/PreferencesModal';
import SwipeCard from '../components/SwipeCard';
import { getAvailable } from '../services/dogService';
import { getErrorMessage } from '../services/api';
import { useSwipe } from '../store/SwipeContext';
import { isGreatMatch, rankDogs } from '../utils/matching';
import './Discover.css';

const VISIBLE = 3;
const PAGE_SIZE = 50; // máximo del backend
// Se cargan todos los disponibles (hasta 500 por tanda) para poder ordenarlos por afinidad
const MAX_PAGES = 10;

function countPreferences(p) {
  if (!p) return 0;
  return p.sizes.length + p.ages.length + p.traits.length + (p.gender ? 1 : 0) + (p.housing ? 1 : 0);
}

export default function Discover() {
  const history = useHistory();
  const { ready, seenIds, lastAction, preferences, like, pass, undo, resetPassed, savePreferences } =
    useSwipe();

  const [deck, setDeck] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(null);
  const [matchDog, setMatchDog] = useState(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [detail, setDetail] = useState(null); // { dog, adopt }

  const pageRef = useRef(0);
  const loadingRef = useRef(false);
  const topCardRef = useRef(null);
  // Refs para leer el valor actual dentro de la carga asíncrona
  const seenRef = useRef(seenIds);
  seenRef.current = seenIds;
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const prefsRef = useRef(preferences);
  prefsRef.current = preferences;
  // Sube al reiniciar la pila: descarta respuestas de cargas anteriores
  const generationRef = useRef(0);

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
      const inDeck = new Set(deckRef.current.map((d) => d.id));
      const fresh = all.filter((d) => !seenRef.current.has(d.id) && !inDeck.has(d.id));
      const ranked = rankDogs(fresh, prefsRef.current);
      setDeck((prev) => [...prev, ...ranked.filter((d) => !prev.some((p) => p.id === d.id))]);
      setHasMore(!last);
    } catch (err) {
      if (generation === generationRef.current) setError(getErrorMessage(err));
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, []);

  // Carga inicial y precarga si quedan pocas tarjetas (también durante la bienvenida,
  // para que la hoja de preferencias pueda contar los "great match")
  useEffect(() => {
    if (ready && deck.length < VISIBLE && hasMore && !loading && !error) loadMore();
  }, [ready, deck.length, hasMore, loading, error, loadMore]);

  function showMatch(dog) {
    setMatchDog(dog);
    setMatchOpen(true);
  }

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

  const openDetail = useCallback((dog) => setDetail({ dog, adopt: false }), []);

  // "I'd love to meet" / "not now" desde la hoja: si es la tarjeta de arriba, sale volando
  function decideFromSheet(dog, dir) {
    setDetail(null);
    if (deckRef.current[0]?.id === dog.id && topCardRef.current) {
      topCardRef.current.swipe(dir);
      return;
    }
    if (dir === 'right') {
      like(dog);
      showMatch(dog);
    } else {
      pass(dog);
    }
    setDeck((prev) => prev.filter((d) => d.id !== dog.id));
  }

  function handleRequest() {
    setMatchOpen(false);
    setDetail({ dog: matchDog, adopt: true });
  }

  function handleSeeMatches() {
    setMatchOpen(false);
    history.push('/matches');
  }

  function handleUndo() {
    const dog = undo();
    if (dog) setDeck((prev) => [dog, ...prev.filter((d) => d.id !== dog.id)]);
  }

  function handleSeeAgain() {
    resetPassed();
    generationRef.current += 1;
    pageRef.current = 0;
    setDeck([]);
    setHasMore(true);
    setError(null);
  }

  function handleSavePreferences(next) {
    savePreferences(next);
    setEditingPrefs(false);
    // Reordenar la pila con las preferencias nuevas
    setDeck((prev) => rankDogs(prev, next));
  }

  const prefCount = countPreferences(preferences);
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
      <div className="discover__deck">
        <div className="discover__empty">
          <h2>You've met everyone</h2>
          <p>New dogs arrive at the shelter every week. Change your preferences or start over.</p>
          <button type="button" className="btn btn--primary btn--compact" onClick={handleSeeAgain}>
            see them again
          </button>
        </div>
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
              depth={i}
              isTop={i === 0}
              greatMatch={isGreatMatch(dog, preferences)}
              onSwiped={handleSwiped}
              onOpen={openDetail}
            />
          ))}
        </div>
        <div className="discover__actions">
          <button
            type="button"
            className="action-btn action-btn--small action-btn--undo"
            aria-label="undo"
            disabled={!lastAction}
            onClick={handleUndo}
          >
            <IonIcon icon={arrowUndo} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="action-btn action-btn--pass"
            aria-label="not now"
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
          <button
            type="button"
            className="action-btn action-btn--small action-btn--info"
            aria-label={`more about ${deck[0]?.name ?? 'this dog'}`}
            onClick={() => deck[0] && openDetail(deck[0])}
          >
            i
          </button>
        </div>
      </>
    );
  }

  return (
    <IonPage>
      <PageHeader title="Discover">
        <button
          type="button"
          className="filters-btn"
          onClick={() => setEditingPrefs(true)}
          aria-label={prefCount > 0 ? `filters, ${prefCount} active` : 'filters'}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true">
            <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
            <circle cx="16" cy="7" r="2" />
            <circle cx="10" cy="17" r="2" />
          </svg>
          filters
          {prefCount > 0 && <span className="filters-btn__count">{prefCount}</span>}
        </button>
      </PageHeader>

      <IonContent scrollY={false}>
        <div className="discover">{body}</div>

        <MatchModal
          dog={matchDog}
          isOpen={matchOpen}
          onRequest={handleRequest}
          onSeeMatches={handleSeeMatches}
          onClose={() => setMatchOpen(false)}
        />
        <DogSheet
          dog={detail?.dog ?? null}
          autoAdopt={detail?.adopt ?? false}
          onClose={() => setDetail(null)}
          onLike={(dog) => decideFromSheet(dog, 'right')}
          onPass={(dog) => decideFromSheet(dog, 'left')}
        />
        <PreferencesModal
          isOpen={ready && (preferences === null || editingPrefs)}
          firstTime={preferences === null}
          preferences={preferences}
          candidates={deck}
          onSave={handleSavePreferences}
          onClose={() => setEditingPrefs(false)}
        />
      </IonContent>
    </IonPage>
  );
}
