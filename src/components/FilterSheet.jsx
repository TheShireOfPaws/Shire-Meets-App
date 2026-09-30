import { useEffect, useState } from 'react';
import { IonButton, IonContent, IonModal } from '@ionic/react';
import { GENDER_LABELS, SIZE_LABELS } from '../utils/labels';
import './FilterSheet.css';

export const NO_FILTERS = { size: '', gender: '' };

const SIZE_OPTIONS = [['', 'any'], ...Object.entries(SIZE_LABELS)];
// UNKNOWN no se ofrece como filtro: no ayuda a elegir
const GENDER_OPTIONS = [
  ['', 'any'],
  ['MALE', GENDER_LABELS.MALE],
  ['FEMALE', GENDER_LABELS.FEMALE],
];

function PillGroup({ id, label, options, value, onChange }) {
  return (
    <fieldset className="pill-group">
      <legend id={id}>{label}</legend>
      <div className="pill-group__options">
        {options.map(([optionValue, optionLabel]) => (
          <label key={optionValue || 'any'} className="pill">
            <input
              type="radio"
              name={id}
              value={optionValue}
              checked={value === optionValue}
              onChange={() => onChange(optionValue)}
            />
            <span>{optionLabel}</span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export default function FilterSheet({ isOpen, filters, onApply, onClose }) {
  const [draft, setDraft] = useState(filters);

  // Cada vez que se abre, parte de los filtros aplicados
  useEffect(() => {
    if (isOpen) setDraft(filters);
  }, [isOpen, filters]);

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      breakpoints={[0, 0.45, 0.75]}
      initialBreakpoint={0.45}
      className="filter-sheet"
    >
      <IonContent className="ion-padding">
        <h2 className="filter-sheet__title">filters</h2>
        <PillGroup
          id="filter-size"
          label="size"
          options={SIZE_OPTIONS}
          value={draft.size}
          onChange={(size) => setDraft((d) => ({ ...d, size }))}
        />
        <PillGroup
          id="filter-gender"
          label="gender"
          options={GENDER_OPTIONS}
          value={draft.gender}
          onChange={(gender) => setDraft((d) => ({ ...d, gender }))}
        />
        <IonButton expand="block" className="filter-sheet__apply" onClick={() => onApply(draft)}>
          see dogs
        </IonButton>
      </IonContent>
    </IonModal>
  );
}
