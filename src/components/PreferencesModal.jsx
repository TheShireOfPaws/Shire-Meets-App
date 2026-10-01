import { useEffect, useState } from 'react';
import { IonContent, IonFooter, IonHeader, IonModal, IonToolbar } from '@ionic/react';

import PillGroup from './PillGroup';
import {
  AGE_GROUP_LABELS,
  GENDER_LABELS,
  HOUSING_LABELS,
  SIZE_LABELS,
  TRAIT_LABELS,
} from '../utils/labels';
import { EMPTY_PREFERENCES, isGreatMatch } from '../utils/matching';
import './PreferencesModal.css';

const GENDER_OPTIONS = [
  ['', 'any'],
  ['MALE', GENDER_LABELS.MALE],
  ['FEMALE', GENDER_LABELS.FEMALE],
];
const HOUSING_OPTIONS = [['', 'rather not say'], ...Object.entries(HOUSING_LABELS)];

// candidates: perros por ver, para contar los "great match" del borrador
export default function PreferencesModal({
  isOpen,
  firstTime,
  preferences,
  candidates = [],
  onSave,
  onClose,
}) {
  const [draft, setDraft] = useState(EMPTY_PREFERENCES);

  useEffect(() => {
    if (isOpen) setDraft({ ...EMPTY_PREFERENCES, ...preferences });
  }, [isOpen, preferences]);

  const set = (key) => (value) => setDraft((d) => ({ ...d, [key]: value }));
  const greatCount = candidates.filter((dog) => isGreatMatch(dog, draft)).length;

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.92]}
      initialBreakpoint={0.92}
      handle={!firstTime}
      // La primera vez solo se cierra eligiendo o saltando
      canDismiss={firstTime ? (data, role) => role !== 'gesture' && role !== 'backdrop' : true}
      className="sheet-modal preferences-modal"
    >
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <div className="preferences__bar">
            <button
              type="button"
              className="preferences__text-btn"
              onClick={() => setDraft(EMPTY_PREFERENCES)}
            >
              reset
            </button>
            <h2 className="preferences__title">{firstTime ? 'Welcome!' : 'My preferences'}</h2>
            <button
              type="button"
              className="preferences__text-btn"
              onClick={firstTime ? () => onSave(EMPTY_PREFERENCES) : onClose}
            >
              {firstTime ? 'skip' : 'cancel'}
            </button>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="preferences__content">
        <p className="preferences__intro">
          {firstTime
            ? "Tell us what you're looking for and the dogs that fit you best show up first. You'll still see everyone after them."
            : "Dogs that fit best show up first — you'll still see everyone after them."}
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
          <button type="button" className="btn btn--dark" onClick={() => onSave(draft)}>
            {greatCount > 0
              ? `show me dogs · ${greatCount} great ${greatCount === 1 ? 'match' : 'matches'}`
              : 'show me dogs'}
          </button>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
