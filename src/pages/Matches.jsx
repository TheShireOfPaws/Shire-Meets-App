import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import {
  IonAvatar,
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonItemOption,
  IonItemOptions,
  IonItemSliding,
  IonLabel,
  IonList,
  IonPage,
  IonRefresher,
  IonRefresherContent,
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from '@ionic/react';

import { getById } from '../services/dogService';
import { useSwipe } from '../store/SwipeContext';
import { PLACEHOLDER_IMG, STATUS_LABELS, ageLabel } from '../utils/labels';
import './Matches.css';

const STRIP_SIZE = 10;

const fallbackImg = (e) => {
  if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMG)) e.currentTarget.src = PLACEHOLDER_IMG;
};

function StatusBadge({ entry }) {
  const { dog, requested } = entry;
  // Si ya no está disponible, eso es lo más importante
  if (dog.status !== 'AVAILABLE') {
    return <span className="badge badge--status">{STATUS_LABELS[dog.status]}</span>;
  }
  if (requested) return <span className="badge badge--requested">request sent</span>;
  return null;
}

export default function Matches() {
  const history = useHistory();
  const { ready, liked, unlike, refreshDog } = useSwipe();

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

  const open = (dog) => history.push(`/dog/${dog.id}`, { dog });

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Matches</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={handleRefresh}>
          <IonRefresherContent />
        </IonRefresher>

        {ready && matches.length === 0 && (
          <div className="matches__empty">
            <h2>No matches yet</h2>
            <p>Like a dog in Discover and it will show up here.</p>
            <IonButton onClick={() => history.push('/discover')}>start discovering</IonButton>
          </div>
        )}

        {matches.length > 0 && (
          <>
            <h2 className="matches__heading">latest</h2>
            <ul className="matches-strip">
              {matches.slice(0, STRIP_SIZE).map(({ dog }) => (
                <li key={dog.id}>
                  <button
                    type="button"
                    className="matches-strip__item"
                    aria-label={`see ${dog.name}'s profile`}
                    onClick={() => open(dog)}
                  >
                    <img src={dog.photoUrl || PLACEHOLDER_IMG} alt="" onError={fallbackImg} />
                    <span aria-hidden="true">{dog.name}</span>
                  </button>
                </li>
              ))}
            </ul>

            <h2 className="matches__heading">all matches</h2>
            <IonList inset className="matches__list">
              {matches.map((entry) => (
                <IonItemSliding key={entry.dog.id}>
                  <IonItem button detail={false} onClick={() => open(entry.dog)}>
                    <IonAvatar slot="start" className="matches__avatar">
                      <img src={entry.dog.photoUrl || PLACEHOLDER_IMG} alt="" onError={fallbackImg} />
                    </IonAvatar>
                    <IonLabel>
                      <h3>{entry.dog.name}</h3>
                      <p>{ageLabel(entry.dog.age)}</p>
                    </IonLabel>
                    <div slot="end">
                      <StatusBadge entry={entry} />
                    </div>
                  </IonItem>
                  <IonItemOptions side="end">
                    <IonItemOption color="danger" onClick={() => unlike(entry.dog.id)}>
                      remove
                    </IonItemOption>
                  </IonItemOptions>
                </IonItemSliding>
              ))}
            </IonList>
          </>
        )}
      </IonContent>
    </IonPage>
  );
}
