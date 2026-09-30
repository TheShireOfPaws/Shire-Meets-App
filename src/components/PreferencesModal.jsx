import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonModal,
  IonTitle,
  IonToolbar,
} from '@ionic/react';

import PillGroup from './PillGroup';
import {
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  HOUSING_LABELS,
  SIZE_LABELS,
  TRAIT_LABELS,
} from '../utils/labels';
import { EMPTY_PREFERENCES } from '../utils/matching';
import './PreferencesModal.css';

const GENDER_OPTIONS = [
  ['', 'any'],
  ['MALE', GENDER_LABELS.MALE],
  ['FEMALE', GENDER_LABELS.FEMALE],
];
const HOUSING_OPTIONS = [['', 'rather not say'], ...Object.entries(HOUSING_LABELS)];

// firstTime: pantalla de bienvenida (se puede saltar); si no, edición desde Discover
export default function PreferencesModal({ isOpen, firstTime, preferences, onSave, onClose }) {
  const [draft, setDraft] = useState(EMPTY_PREFERENCES);

  useEffect(() => {
    if (isOpen) setDraft({ ...EMPTY_PREFERENCES, ...preferences });
  }, [isOpen, preferences]);

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      // La primera vez hay que elegir o saltar: no se cierra deslizando
      canDismiss={firstTime ? (data, role) => role !== 'gesture' && role !== 'backdrop' : true}
      className="preferences-modal"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>{firstTime ? 'Welcome!' : 'My preferences'}</IonTitle>
          {!firstTime && (
            <IonButtons slot="end">
              <IonButton onClick={onClose}>cancel</IonButton>
            </IonButtons>
          )}
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <p className="preferences__intro">
          {firstTime
            ? "Tell us what you're looking for and we'll show you the dogs that fit you best first. Pick as many as you like."
            : 'Dogs that fit these best show up first. You still see everyone else after them.'}
        </p>

        <PillGroup
          id="pref-size"
          label="size"
          options={Object.entries(SIZE_LABELS)}
          value={draft.sizes}
          onChange={set('sizes')}
          multiple
        />
        <PillGroup
          id="pref-age"
          label="age"
          options={Object.entries(AGE_GROUP_LABELS)}
          value={draft.ages}
          onChange={set('ages')}
          multiple
        />
        <PillGroup
          id="pref-gender"
          label="gender"
          options={GENDER_OPTIONS}
          value={draft.gender}
          onChange={set('gender')}
        />
        <PillGroup
          id="pref-housing"
          label="your home"
          options={HOUSING_OPTIONS}
          value={draft.housing}
          onChange={set('housing')}
        />
        <PillGroup
          id="pref-traits"
          label="personality"
          hint="(what matters most to you)"
          options={Object.entries(TRAIT_LABELS)}
          value={draft.traits}
          onChange={set('traits')}
          multiple
        />
      </IonContent>

      <IonFooter className="ion-no-border preferences__footer">
        <IonToolbar>
          <IonButton expand="block" onClick={() => onSave(draft)}>
            show me dogs
          </IonButton>
          {firstTime && (
            <IonButton expand="block" fill="clear" onClick={() => onSave(EMPTY_PREFERENCES)}>
              skip for now
            </IonButton>
          )}
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
