import { useEffect, useRef, useState } from 'react';
import { IonContent, IonFooter, IonIcon, IonToolbar, useIonRouter } from '@ionic/react';
import { arrowBack, chevronDown, homeOutline } from 'ionicons/icons';

import AdoptionForm from './AdoptionForm';
import { useSwipe } from '../store/SwipeContext';
import {
  GENDER_LABELS,
  SIZE_LABELS,
  STATUS_LABELS,
  TRAIT_LABELS,
  ageLabel,
  dogPhotos,
  showPlaceholder,
} from '../utils/labels';
import { isGreatMatch } from '../utils/matching';
import './DogDetail.css';

// Perfil del perro. variant: 'sheet' (hoja desde Discover/Matches) o 'page' (/dog/:id)
// onLike / onPass: opcionales; si faltan se usan las acciones del contexto
export default function DogDetail({ dog, variant = 'sheet', autoAdopt = false, onClose, onLike, onPass }) {
  const router = useIonRouter();
  const { ready, liked, passed, preferences, like, pass } = useSwipe();
  const [photo, setPhoto] = useState(0);
  const [formOpen, setFormOpen] = useState(false);
  const adoptPending = useRef(autoAdopt);

  const photos = dogPhotos(dog);
  const entry = liked[dog.id];
  const isLiked = Boolean(entry);
  const requested = Boolean(entry?.requested);
  const available = dog.status === 'AVAILABLE';
  const traits = (dog.traits ?? []).map((t) => TRAIT_LABELS[t]).filter(Boolean);

  // Desde el match (o ?adopt=1): abrir el formulario en cuanto sepamos si ya se pidió
  useEffect(() => {
    if (adoptPending.current && ready && available && !requested) {
      adoptPending.current = false;
      setFormOpen(true);
    }
  }, [ready, available, requested]);

  function handleLike() {
    if (onLike) onLike(dog);
    else like(dog);
  }

  function handlePass() {
    if (onPass) onPass(dog);
    else {
      pass(dog);
      onClose?.();
    }
  }

  function goBack() {
    if (router.canGoBack()) router.goBack();
    else router.push('/discover', 'back');
  }

  let footer = null;
  if (ready) {
    if (!available) {
      footer = <p className="dog-detail__notice">{dog.name} isn't available anymore</p>;
    } else if (requested) {
      footer = <p className="dog-detail__notice">Request sent · the shelter will write to you</p>;
    } else if (isLiked) {
      footer = (
        <button type="button" className="btn btn--primary" onClick={() => setFormOpen(true)}>
          request adoption
        </button>
      );
    } else {
      footer = (
        <>
          {!passed.includes(dog.id) && (
            <button type="button" className="btn btn--outline-red" onClick={handlePass}>
              not now
            </button>
          )}
          <button type="button" className="btn btn--primary btn--wide" onClick={handleLike}>
            I'd love to meet
          </button>
        </>
      );
    }
  }

  return (
    <>
      <IonContent className="dog-detail">
        <div className="dog-detail__photo">
          <img src={photos[photo]} alt={dog.name} onError={showPlaceholder} />

          {photos.length > 1 && (
            <>
              <button
                type="button"
                className="dog-detail__zone dog-detail__zone--prev"
                aria-label="previous photo"
                disabled={photo === 0}
                onClick={() => setPhoto((p) => p - 1)}
              />
              <button
                type="button"
                className="dog-detail__zone dog-detail__zone--next"
                aria-label="next photo"
                disabled={photo === photos.length - 1}
                onClick={() => setPhoto((p) => p + 1)}
              />
              <div className="dog-detail__bars">
                {photos.map((url, i) => (
                  <button
                    key={url}
                    type="button"
                    className={i === photo ? 'is-active' : undefined}
                    aria-label={`photo ${i + 1} of ${photos.length}`}
                    aria-pressed={i === photo}
                    onClick={() => setPhoto(i)}
                  />
                ))}
              </div>
            </>
          )}

          {variant === 'sheet' ? (
            <button type="button" className="dog-detail__round dog-detail__round--end" aria-label="close" onClick={onClose}>
              <IonIcon icon={chevronDown} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="dog-detail__round dog-detail__round--start" aria-label="back" onClick={goBack}>
              <IonIcon icon={arrowBack} aria-hidden="true" />
            </button>
          )}
        </div>

        <div className="dog-detail__body">
          <div className="dog-detail__heading">
            {isGreatMatch(dog, preferences) && <span className="great-badge">★ great match for you</span>}
            <h1 className="dog-detail__name">{dog.name}</h1>
            {!available && <p className="dog-detail__status">{STATUS_LABELS[dog.status]}</p>}
          </div>

          <dl className="dog-detail__facts">
            <div>
              <dt>age</dt>
              <dd>{ageLabel(dog.age)}</dd>
            </div>
            <div>
              <dt>size</dt>
              <dd>{SIZE_LABELS[dog.size]}</dd>
            </div>
            <div>
              <dt>gender</dt>
              <dd>{GENDER_LABELS[dog.gender]}</dd>
            </div>
          </dl>

          {traits.length > 0 && (
            <section className="dog-detail__section">
              <h2>personality</h2>
              <ul className="dog-detail__traits">
                {traits.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </section>
          )}

          <section className="dog-detail__section">
            <h2>about {dog.name}</h2>
            <p className="dog-detail__story">{dog.story || 'No story yet.'}</p>
          </section>

          <div className="dog-detail__shelter">
            <span className="dog-detail__shelter-icon">
              <IonIcon icon={homeOutline} aria-hidden="true" />
            </span>
            <div>
              <strong>The Shire of Paws</strong>
              <span>shelter</span>
            </div>
          </div>
        </div>
      </IonContent>

      {footer && (
        <IonFooter className="ion-no-border dog-detail__footer">
          <IonToolbar>
            <div className="dog-detail__actions">{footer}</div>
          </IonToolbar>
        </IonFooter>
      )}

      <AdoptionForm dog={dog} isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
