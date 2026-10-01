import { IonIcon } from '@ionic/react';
import { arrowUndo, close, heart } from 'ionicons/icons';

export default function DeckActions({ topDog, canUndo, onUndo, onSwipe, onInfo }) {
  return (
    <div className="discover__actions">
      <button
        type="button"
        className="action-btn action-btn--small action-btn--undo"
        aria-label="undo"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <IonIcon icon={arrowUndo} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="action-btn action-btn--pass"
        aria-label="not now"
        onClick={() => onSwipe('left')}
      >
        <IonIcon icon={close} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="action-btn action-btn--like"
        aria-label="like"
        onClick={() => onSwipe('right')}
      >
        <IonIcon icon={heart} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="action-btn action-btn--small action-btn--info"
        aria-label={`more about ${topDog?.name ?? 'this dog'}`}
        onClick={() => topDog && onInfo(topDog)}
      >
        i
      </button>
    </div>
  );
}
