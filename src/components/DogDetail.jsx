import { useEffect, useRef, useState } from 'react';
import { IonContent, IonIcon, useIonRouter } from '@ionic/react';
import { arrowBack, chevronDown, homeOutline } from 'ionicons/icons';

import AdoptionForm from './AdoptionForm';
import DogDetailActions from './DogDetailActions';
import PhotoCarousel from './PhotoCarousel';
import { useSwipe } from '../store/SwipeContext';
import { GENDER_LABELS, SIZE_LABELS, STATUS_LABELS, ageLabel } from '../utils/labels';
import { dogPhotos, traitLabels } from '../utils/dog';
import { isGreatMatch } from '../utils/matching';
import './DogDetail.css';

// variant: 'sheet' (hoja desde Discover/Matches) o 'page' (/dog/:id).
// Sin onLike / onPass se usan las acciones del contexto.
export default function DogDetail({ dog, variant = 'sheet', autoAdopt = false, onClose, onLike, onPass }) {
  const router = useIonRouter();
  const { ready, liked, passed, preferences, like, pass } = useSwipe();
  const [formOpen, setFormOpen] = useState(false);
  const adoptPending = useRef(autoAdopt);

  const entry = liked[dog.id];
  const requested = Boolean(entry?.requested);
  const available = dog.status === 'AVAILABLE';
  const traits = traitLabels(dog);
  const facts = [
    ['age', ageLabel(dog.age)],
    ['size', SIZE_LABELS[dog.size]],
    ['gender', GENDER_LABELS[dog.gender]],
  ];

  // Desde el match (o ?adopt=1): abrir el formulario en cuanto sepamos si ya se pidió
  useEffect(() => {
    if (adoptPending.current && ready && available && !requested) {
      adoptPending.current = false;
      setFormOpen(true);
    }
  }, [ready, available, requested]);

  function handlePass() {
    if (onPass) return onPass(dog);
    pass(dog);
    onClose?.();
  }

  function goBack() {
    if (router.canGoBack()) router.goBack();
    else router.push('/discover', 'back');
  }

  return (
    <>
      <IonContent className="dog-detail">
        <PhotoCarousel photos={dogPhotos(dog)} alt={dog.name}>
          {variant === 'sheet' ? (
            <button type="button" className="dog-detail__round dog-detail__round--end" aria-label="close" onClick={onClose}>
              <IonIcon icon={chevronDown} aria-hidden="true" />
            </button>
          ) : (
            <button type="button" className="dog-detail__round dog-detail__round--start" aria-label="back" onClick={goBack}>
              <IonIcon icon={arrowBack} aria-hidden="true" />
            </button>
          )}
        </PhotoCarousel>

        <div className="dog-detail__body">
          <div className="dog-detail__heading">
            {isGreatMatch(dog, preferences) && <span className="great-badge">★ great match for you</span>}
            <h1 className="dog-detail__name">{dog.name}</h1>
            {!available && <p className="dog-detail__status">{STATUS_LABELS[dog.status]}</p>}
          </div>

          <dl className="dog-detail__facts">
            {facts.map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
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

      {ready && (
        <DogDetailActions
          dog={dog}
          requested={requested}
          isLiked={Boolean(entry)}
          canPass={!passed.includes(dog.id)}
          onPass={handlePass}
          onLike={() => (onLike ? onLike(dog) : like(dog))}
          onRequest={() => setFormOpen(true)}
        />
      )}

      <AdoptionForm dog={dog} isOpen={formOpen} onClose={() => setFormOpen(false)} />
    </>
  );
}
