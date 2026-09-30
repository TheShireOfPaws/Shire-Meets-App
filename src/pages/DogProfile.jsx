import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import {
  IonBackButton,
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonIcon,
  IonPage,
  IonSpinner,
  IonToolbar,
} from '@ionic/react';
import { heart, heartOutline } from 'ionicons/icons';

import AdoptionForm from '../components/AdoptionForm';
import { getById } from '../services/dogService';
import { getErrorMessage } from '../services/api';
import { useSwipe } from '../store/SwipeContext';
import {
  GENDER_LABELS,
  PLACEHOLDER_IMG,
  SIZE_LABELS,
  STATUS_LABELS,
  ageLabel,
  showPlaceholder,
} from '../utils/labels';
import './DogProfile.css';

export default function DogProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { ready, liked, like, unlike, refreshDog } = useSwipe();

  // Mientras carga getById, se muestra lo que ya tenemos
  const [dog, setDog] = useState(() =>
    location.state?.dog?.id === id ? location.state.dog : liked[id]?.dog ?? null
  );
  const [error, setError] = useState(null);
  const [formOpen, setFormOpen] = useState(false);
  // ?adopt=1 (desde el match): abrir el formulario una sola vez
  const wantsAdopt = useRef(new URLSearchParams(location.search).get('adopt') === '1');

  const load = useCallback(async () => {
    setError(null);
    try {
      const fresh = await getById(id);
      setDog(fresh);
      refreshDog(fresh);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [id, refreshDog]);

  useEffect(() => {
    load();
  }, [load]);

  const isLiked = Boolean(liked[id]);
  const requested = Boolean(liked[id]?.requested);
  const available = dog?.status === 'AVAILABLE';
  const canAdopt = available && !requested;

  useEffect(() => {
    // Esperar a Preferences para saber si ya se envió solicitud
    if (wantsAdopt.current && ready && dog && canAdopt) {
      wantsAdopt.current = false;
      setFormOpen(true);
    }
  }, [ready, dog, canAdopt]);

  function toggleLike() {
    if (isLiked) unlike(id);
    else like(dog);
  }

  let content;
  if (!dog && error) {
    content = (
      <div className="dog-profile__state" role="alert">
        <p>{error}</p>
        <IonButton onClick={load}>try again</IonButton>
      </div>
    );
  } else if (!dog) {
    content = (
      <div className="dog-profile__state">
        <IonSpinner name="crescent" color="primary" />
      </div>
    );
  } else {
    const chips = [ageLabel(dog.age), GENDER_LABELS[dog.gender], SIZE_LABELS[dog.size]].filter(Boolean);

    content = (
      <>
        <div className="dog-profile__photo">
          <img
            src={dog.photoUrl || PLACEHOLDER_IMG}
            alt={dog.name}
            onError={showPlaceholder}
          />
        </div>
        <div className="dog-profile__body">
          <h1 className="dog-profile__name">{dog.name}</h1>
          <ul className="dog-profile__chips">
            {chips.map((chip) => (
              <li key={chip} className="chip">
                {chip}
              </li>
            ))}
            {!available && <li className="chip chip--status">{STATUS_LABELS[dog.status]}</li>}
          </ul>
          <h2 className="dog-profile__subtitle">{dog.name}'s story</h2>
          <p className="dog-profile__story">{dog.story || 'No story yet.'}</p>
        </div>
      </>
    );
  }

  let footer = null;
  if (dog && ready) {
    if (requested) {
      footer = <p className="dog-profile__notice">You've already sent a request</p>;
    } else if (!available) {
      footer = <p className="dog-profile__notice">{dog.name} isn't available anymore</p>;
    } else {
      footer = (
        <IonButton expand="block" onClick={() => setFormOpen(true)}>
          I want to adopt {dog.name}
        </IonButton>
      );
    }
  }

  return (
    <IonPage className="dog-profile">
      <IonHeader className="ion-no-border dog-profile__header">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/discover" text="" aria-label="back" className="round-btn" />
          </IonButtons>
          <IonButtons slot="end">
            {/* key: Ionic solo copia los aria-* al botón interno al montarse */}
            <IonButton
              key={isLiked ? 'liked' : 'not-liked'}
              className="round-btn"
              disabled={!dog}
              onClick={toggleLike}
              aria-label={isLiked ? 'remove from matches' : 'add to matches'}
              aria-pressed={isLiked}
            >
              <IonIcon
                slot="icon-only"
                icon={isLiked ? heart : heartOutline}
                color={isLiked ? 'primary' : undefined}
              />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>{content}</IonContent>

      {footer && (
        <IonFooter className="ion-no-border dog-profile__footer">
          <IonToolbar>{footer}</IonToolbar>
        </IonFooter>
      )}

      {dog && <AdoptionForm dog={dog} isOpen={formOpen} onClose={() => setFormOpen(false)} />}
    </IonPage>
  );
}
