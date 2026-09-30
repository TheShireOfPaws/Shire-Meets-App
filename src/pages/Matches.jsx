import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonContent,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  useIonViewWillEnter,
} from '@ionic/react';

import DogSheet from '../components/DogSheet';
import PageHeader from '../components/PageHeader';
import { getById } from '../services/dogService';
import { useSwipe } from '../store/SwipeContext';
import { STATUS_LABELS, ageLabel, dogPhotos, genderSize, showPlaceholder } from '../utils/labels';
import './Matches.css';

const NEW_ROW_SIZE = 6;

function statusLine({ dog, requested }) {
  if (dog.status !== 'AVAILABLE') return STATUS_LABELS[dog.status];
  if (requested) return 'request sent';
  return 'The Shire of Paws';
}

export default function Matches() {
  const history = useHistory();
  const { ready, liked, unlike, refreshDog } = useSwipe();
  const [detail, setDetail] = useState(null);

  const likedRef = useRef(liked);
  likedRef.current = liked;

  const matches = useMemo(
    () => Object.values(liked).sort((a, b) => b.likedAt.localeCompare(a.likedAt)),
    [liked]
  );

  // Trae el estado actual de cada perro; si alguno falla, se queda con lo guardado
  const refresh = useCallback(async () => {
    const ids = Object.keys(likedRef.current);
    const results = await Promise.allSettled(ids.map((id) => getById(id)));
    results.forEach((r) => {
      if (r.status === 'fulfilled') refreshDog(r.value);
    });
  }, [refreshDog]);

  useIonViewWillEnter(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  // Si se entra directamente en /matches, refrescar cuando Preferences termine de cargar
  const wasReady = useRef(ready);
  useEffect(() => {
    if (ready && !wasReady.current) refresh();
    wasReady.current = ready;
  }, [ready, refresh]);

  async function handleRefresh(e) {
    await refresh();
    e.detail.complete();
  }

  const open = (dog) => setDetail(dog);
  const count = matches.length;

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
            <section className="matches__section">
              <h2 className="matches__heading">new</h2>
              <ul className="matches__rings">
                {matches.slice(0, NEW_ROW_SIZE).map(({ dog, seen }) => (
                  <li key={dog.id}>
                    <button
                      type="button"
                      className="matches__ring-btn"
                      aria-label={`${dog.name}${seen === false ? ', new' : ''}`}
                      onClick={() => open(dog)}
                    >
                      <span className="matches__ring">
                        <img src={dogPhotos(dog)[0]} alt="" onError={showPlaceholder} />
                        {seen === false && <span className="matches__new-dot" aria-hidden="true" />}
                      </span>
                      <span className="matches__ring-name" aria-hidden="true">
                        {dog.name}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>

            <section className="matches__section matches__section--list">
              <h2 className="matches__heading">all matches</h2>
              <IonList lines="none" className="matches__list">
                {matches.map((entry) => {
                  const { dog, requested, seen } = entry;
                  const isNew = seen === false && !requested;
                  const cta = requested ? 'view' : isNew ? 'say hi' : 'contact';
                  return (
                    <IonItemSliding key={dog.id}>
                      <IonItem className="match-row">
                        <div className="match-card">
                          <button
                            type="button"
                            className="match-card__photo"
                            tabIndex={-1}
                            aria-hidden="true"
                            onClick={() => open(dog)}
                          >
                            <img src={dogPhotos(dog)[0]} alt="" onError={showPlaceholder} />
                          </button>
                          <button type="button" className="match-card__info" onClick={() => open(dog)}>
                            <span className="match-card__name">{dog.name}</span>
                            <span className="match-card__meta">
                              {[ageLabel(dog.age), genderSize(dog)].filter(Boolean).join(' · ')}
                            </span>
                            <span className="match-card__status">{statusLine(entry)}</span>
                          </button>
                          <button
                            type="button"
                            className={`match-card__cta${isNew ? ' match-card__cta--new' : ''}`}
                            aria-label={`${cta}, ${dog.name}`}
                            onClick={() => open(dog)}
                          >
                            {cta}
                          </button>
                        </div>
                      </IonItem>
                      <IonItemOptions side="end">
                        <IonItemOption color="danger" onClick={() => unlike(dog.id)}>
                          remove
                        </IonItemOption>
                      </IonItemOptions>
                      {/* Deslizar no funciona con teclado ni lector de pantalla: botón visible al enfocarlo */}
                      <button
                        type="button"
                        className="matches__remove-a11y"
                        onClick={() => unlike(dog.id)}
                      >
                        remove {dog.name}
                      </button>
                    </IonItemSliding>
                  );
                })}
              </IonList>
            </section>
          </>
        )}

        <DogSheet dog={detail} onClose={() => setDetail(null)} />
      </IonContent>
    </IonPage>
  );
}
