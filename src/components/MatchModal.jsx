import { IonButton, IonModal } from '@ionic/react';
import { PLACEHOLDER_IMG } from '../utils/labels';
import './MatchModal.css';

export default function MatchModal({ dog, isOpen, onRequest, onClose }) {
  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="match-modal">
      {dog && (
        <div className="match">
          <h2 className="match__title">It's a match!</h2>
          <p className="match__text">You and {dog.name} like each other.</p>
          <img
            className="match__photo"
            src={dog.photoUrl || PLACEHOLDER_IMG}
            alt={dog.name}
            onError={(e) => {
              if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMG)) e.currentTarget.src = PLACEHOLDER_IMG;
            }}
          />
          <div className="match__actions">
            <IonButton expand="block" color="secondary" onClick={onRequest}>
              request adoption
            </IonButton>
            <IonButton expand="block" fill="outline" color="light" onClick={onClose}>
              keep looking
            </IonButton>
          </div>
        </div>
      )}
    </IonModal>
  );
}
