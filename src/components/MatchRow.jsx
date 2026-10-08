import { IonItem, IonItemOption, IonItemOptions, IonItemSliding } from '@ionic/react';
import { STATUS_LABELS, ageLabel } from '../utils/labels';
import { dogPhotos, genderSize, showPlaceholder } from '../utils/dog';

function statusLine({ dog, requested }) {
  if (dog.status !== 'AVAILABLE') return STATUS_LABELS[dog.status];
  if (requested) return 'request sent';
  return 'The Shire of Paws';
}

export default function MatchRow({ entry, onOpen, onRemove }) {
  const { dog, requested, seen } = entry;
  const isNew = seen === false && !requested;
  const cta = requested ? 'view' : isNew ? 'say hi' : 'contact';
  const open = () => onOpen(dog);
  const remove = () => onRemove(dog.id);

  return (
    <IonItemSliding>
      <IonItem className="match-row">
        <div className="match-card">
          <button type="button" className="match-card__photo" tabIndex={-1} aria-hidden="true" onClick={open}>
            <img src={dogPhotos(dog)[0]} alt="" onError={showPlaceholder} />
          </button>
          <button type="button" className="match-card__info" onClick={open}>
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
            onClick={open}
          >
            {cta}
          </button>
        </div>
      </IonItem>
      <IonItemOptions side="end">
        <IonItemOption color="danger" onClick={remove}>
          remove
        </IonItemOption>
      </IonItemOptions>
      {/* Swiping isn't available to keyboard or screen reader users */}
      <button type="button" className="matches__remove-a11y" onClick={remove}>
        remove {dog.name}
      </button>
    </IonItemSliding>
  );
}
