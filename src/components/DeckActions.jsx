import { IonIcon } from '@ionic/react';
import { arrowUndo, close, heart } from 'ionicons/icons';

export default function DeckActions({ canUndo, onUndo, onSwipe }) {
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
    </div>
  );
}
