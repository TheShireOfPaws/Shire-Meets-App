import { useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/react';

import DeckActions from '../components/DeckActions';
import DogSheet from '../components/DogSheet';
import FiltersButton from '../components/FiltersButton';
import MatchModal from '../components/MatchModal';
import PageHeader from '../components/PageHeader';
import PreferencesModal from '../components/PreferencesModal';
import SwipeCard from '../components/SwipeCard';
import useDogDeck, { VISIBLE_CARDS } from '../hooks/useDogDeck';
import { useSwipe } from '../store/SwipeContext';
import { countPreferences, isGreatMatch } from '../utils/matching';
import './Discover.css';

export default function Discover() {
  const history = useHistory();
  const { ready, seenIds, lastAction, preferences, like, pass, undo, resetPassed, savePreferences } =
    useSwipe();
  const { deck, loading, hasMore, error, loadMore, remove, putBack, rerank, reset } = useDogDeck({
    ready,
    seenIds,
    preferences,
  });

  const [matchDog, setMatchDog] = useState(null);
  const [matchOpen, setMatchOpen] = useState(false);
  const [editingPrefs, setEditingPrefs] = useState(false);
  const [detail, setDetail] = useState(null); // { dog, adopt }
  const topCardRef = useRef(null);

  function decide(dog, dir) {
    if (dir === 'right') {
      like(dog);
      setMatchDog(dog);
      setMatchOpen(true);
    } else {
      pass(dog);
    }
    remove(dog.id);
  }

  // Desde la hoja: si es la tarjeta de arriba, sale volando como con el gesto
  function decideFromSheet(dog, dir) {
    setDetail(null);
    if (deck[0]?.id === dog.id && topCardRef.current) topCardRef.current.swipe(dir);
    else decide(dog, dir);
  }

  const openDetail = (dog) => setDetail({ dog, adopt: false });

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
    if (dog) putBack(dog);
  }

  function handleSeeAgain() {
    resetPassed();
    reset();
  }

  function handleSavePreferences(next) {
    savePreferences(next);
    setEditingPrefs(false);
    rerank(next);
  }

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
          {deck.slice(0, VISIBLE_CARDS).map((dog, i) => (
            <SwipeCard
              key={dog.id}
              ref={i === 0 ? topCardRef : undefined}
              dog={dog}
              depth={i}
              isTop={i === 0}
              greatMatch={isGreatMatch(dog, preferences)}
              onSwiped={decide}
              onOpen={openDetail}
            />
          ))}
        </div>
        <DeckActions
          canUndo={Boolean(lastAction)}
          onUndo={handleUndo}
          onSwipe={(dir) => topCardRef.current?.swipe(dir)}
        />
      </>
    );
  }

  return (
    <IonPage>
      <PageHeader title="Discover">
        <FiltersButton count={countPreferences(preferences)} onClick={() => setEditingPrefs(true)} />
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
