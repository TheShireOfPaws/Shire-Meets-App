import { IonModal } from '@ionic/react';
import { dogPhotos, showPlaceholder } from '../utils/dog';
import './MatchModal.css';

export default function MatchModal({ dog, isOpen, onRequest, onClose, onSeeMatches }) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="match-modal">
      {dog && (
        <div className="match">
          <p className="match__eyebrow">It's a match</p>
          <div className="match__ring">
            <img src={dogPhotos(dog)[0]} alt={dog.name} onError={showPlaceholder} />
          </div>
          <h2 className="match__title">{dog.name} wants to meet you too</h2>
          <p className="match__text">
            Send The Shire of Paws a request and they'll reply within a couple of days.
          </p>
          <div className="match__actions">
            <button type="button" className="btn btn--gold" onClick={onRequest}>
              request adoption
            </button>
            <button type="button" className="btn btn--outline-light" onClick={onClose}>
              keep discovering
            </button>
            <button type="button" className="match__link" onClick={onSeeMatches}>
              see my matches
            </button>
          </div>
        </div>
      )}
    </IonModal>
  );
}
