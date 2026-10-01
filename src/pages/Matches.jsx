import { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { IonContent, IonList, IonPage, IonRefresher, IonRefresherContent } from '@ionic/react';

import DogSheet from '../components/DogSheet';
import MatchRow from '../components/MatchRow';
import NewMatchesRow from '../components/NewMatchesRow';
import PageHeader from '../components/PageHeader';
import useRefreshMatches from '../hooks/useRefreshMatches';
import { useSwipe } from '../store/SwipeContext';
import './Matches.css';

const NEW_ROW_SIZE = 6;

export default function Matches() {
  const history = useHistory();
  const { ready, liked, unlike, refreshDog } = useSwipe();
  const [detail, setDetail] = useState(null);
  const refresh = useRefreshMatches({ ready, liked, refreshDog });

  const matches = useMemo(
    () => Object.values(liked).sort((a, b) => b.likedAt.localeCompare(a.likedAt)),
    [liked]
  );
  const count = matches.length;

  async function handleRefresh(e) {
    await refresh();
    e.detail.complete();
  }

  return (
    <IonPage>
      <PageHeader title="Matches">
        {count > 0 && (
          <span className="matches__count">
            {count} {count === 1 ? 'dog' : 'dogs'}
          </span>
        )}
      </PageHeader>

      <IonContent className="matches">
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {ready && count === 0 && (
          <div className="matches__empty">
            <h2>No matches yet</h2>
            <p>Like a dog on Discover and they'll wait for you here.</p>
            <button
              type="button"
              className="btn btn--primary btn--compact"
              onClick={() => history.push('/discover')}
            >
              start discovering
            </button>
          </div>
        )}

        {count > 0 && (
          <>
            <NewMatchesRow matches={matches.slice(0, NEW_ROW_SIZE)} onOpen={setDetail} />
            <section className="matches__section matches__section--list">
              <h2 className="matches__heading">all matches</h2>
              <IonList lines="none" className="matches__list">
                {matches.map((entry) => (
                  <MatchRow key={entry.dog.id} entry={entry} onOpen={setDetail} onRemove={unlike} />
                ))}
              </IonList>
            </section>
          </>
        )}

        <DogSheet dog={detail} onClose={() => setDetail(null)} />
      </IonContent>
    </IonPage>
  );
}
