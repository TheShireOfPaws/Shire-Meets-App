import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonList,
  IonItem,
  IonModal,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonTitle,
  IonToolbar,
  useIonToast,
} from '@ionic/react';

import { create } from '../services/adoptionService';
import { getErrorMessage } from '../services/api';
import { useSwipe } from '../store/SwipeContext';
import { HOUSING_LABELS } from '../utils/labels';
import './AdoptionForm.css';

const FIELDS = [
  'requesterFirstName',
  'requesterLastName',
  'requesterEmail',
  'housingType',
  'householdSize',
  'daytimeLocation',
  'motivation',
];

const EMPTY = {
  requesterFirstName: '',
  requesterLastName: '',
  requesterEmail: '',
  housingType: '',
  householdSize: '',
  daytimeLocation: '',
  motivation: '',
};

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Mismas reglas que AdoptionRequestRequest en el backend
function validate(v) {
  const errors = {};
  const name = (value, label) => {
    const t = value.trim();
    if (!t) return `Tell us your ${label}.`;
    if (t.length < 2 || t.length > 50) return 'Between 2 and 50 characters.';
    return null;
  };

  const first = name(v.requesterFirstName, 'first name');
  if (first) errors.requesterFirstName = first;
  const last = name(v.requesterLastName, 'last name');
  if (last) errors.requesterLastName = last;

  const email = v.requesterEmail.trim();
  if (!email) errors.requesterEmail = 'Tell us your email.';
  else if (!EMAIL_RE.test(email)) errors.requesterEmail = "That email doesn't look right.";

  if (!v.housingType) errors.housingType = 'Choose your type of home.';

  const size = Number(v.householdSize);
  if (v.householdSize === '' || v.householdSize == null) {
    errors.householdSize = 'How many people live with you?';
  } else if (!Number.isInteger(size) || size < 1 || size > 20) {
    errors.householdSize = 'A whole number from 1 to 20.';
  }

  if (v.daytimeLocation.trim().length > 1000) errors.daytimeLocation = 'Up to 1000 characters.';

  const motivation = v.motivation.trim().length;
  if (motivation === 0) errors.motivation = 'Tell the shelter why.';
  else if (motivation < 50) errors.motivation = `At least 50 characters (${50 - motivation} to go).`;
  else if (motivation > 2000) errors.motivation = 'Up to 2000 characters.';

  return errors;
}

export default function AdoptionForm({ dog, isOpen, onClose }) {
  const { profile, preferences, saveProfile, markRequested } = useSwipe();
  const [presentToast] = useIonToast();

  const [values, setValues] = useState(EMPTY);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(values);

  // Al abrir: datos guardados del adoptante, motivación siempre vacía
  useEffect(() => {
    if (!isOpen) return;
    setValues({
      ...EMPTY,
      // Si aún no hay perfil, el tipo de casa sale de las preferencias
      housingType: preferences?.housing ?? '',
      ...Object.fromEntries(
        Object.entries(profile ?? {})
          .filter(([key, value]) => key in EMPTY && value != null)
          .map(([key, value]) => [key, String(value)])
      ),
      motivation: '',
    });
    setTouched({});
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const set = (field) => (e) => setValues((v) => ({ ...v, [field]: e.detail.value ?? '' }));
  const touch = (field) => () => setTouched((t) => ({ ...t, [field]: true }));

  // Ionic muestra errorText solo con ion-invalid + ion-touched
  const stateClass = (field) =>
    touched[field] ? `ion-touched ${errors[field] ? 'ion-invalid' : 'ion-valid'}` : '';

  async function handleSubmit(e) {
    e?.preventDefault();
    if (submitting) return;

    if (Object.keys(errors).length > 0) {
      setTouched(Object.fromEntries(FIELDS.map((f) => [f, true])));
      return;
    }

    const request = {
      requesterFirstName: values.requesterFirstName.trim(),
      requesterLastName: values.requesterLastName.trim(),
      requesterEmail: values.requesterEmail.trim(),
      housingType: values.housingType,
      householdSize: Number(values.householdSize),
      daytimeLocation: values.daytimeLocation.trim() || null,
      motivation: values.motivation.trim(),
      dogId: dog.id,
    };

    setSubmitting(true);
    try {
      await create(request);
      const { motivation: _m, dogId: _d, ...adopter } = request;
      saveProfile(adopter);
      markRequested(dog);
      presentToast({
        message: `Request sent. The shelter will write to you about ${dog.name}.`,
        color: 'primary',
        duration: 4000,
        position: 'top',
      });
      onClose();
    } catch (err) {
      presentToast({
        message: getErrorMessage(err),
        color: 'danger',
        duration: 5000,
        position: 'top',
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IonModal
      isOpen={isOpen}
      onDidDismiss={onClose}
      className="adoption-form"
    >
      <IonHeader>
        <IonToolbar>
          <IonTitle>Adopt {dog?.name}</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={onClose} disabled={submitting}>
              cancel
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <form onSubmit={handleSubmit} noValidate className="adoption-form__form">
          <p className="adoption-form__intro">
            Tell the shelter a bit about you. They'll get back to you by email.
          </p>

          <IonList inset>
            <IonItem>
              <IonInput
                label="first name"
                labelPlacement="stacked"
                autocomplete="given-name"
                value={values.requesterFirstName}
                onIonInput={set('requesterFirstName')}
                onIonBlur={touch('requesterFirstName')}
                className={stateClass('requesterFirstName')}
                errorText={errors.requesterFirstName}
                maxlength={50}
                required
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="last name"
                labelPlacement="stacked"
                autocomplete="family-name"
                value={values.requesterLastName}
                onIonInput={set('requesterLastName')}
                onIonBlur={touch('requesterLastName')}
                className={stateClass('requesterLastName')}
                errorText={errors.requesterLastName}
                maxlength={50}
                required
              />
            </IonItem>
            <IonItem>
              <IonInput
                label="email"
                labelPlacement="stacked"
                type="email"
                inputmode="email"
                autocomplete="email"
                value={values.requesterEmail}
                onIonInput={set('requesterEmail')}
                onIonBlur={touch('requesterEmail')}
                className={stateClass('requesterEmail')}
                errorText={errors.requesterEmail}
                required
              />
            </IonItem>
          </IonList>

          <IonList inset>
            <IonItem>
              <IonSelect
                label="type of home"
                labelPlacement="stacked"
                interface="action-sheet"
                placeholder="choose one"
                cancelText="cancel"
                value={values.housingType || undefined}
                onIonChange={(e) => {
                  setValues((v) => ({ ...v, housingType: e.detail.value ?? '' }));
                  touch('housingType')();
                }}
                onIonDismiss={touch('housingType')}
                className={stateClass('housingType')}
                errorText={errors.housingType}
              >
                {Object.entries(HOUSING_LABELS).map(([value, label]) => (
                  <IonSelectOption key={value} value={value}>
                    {label}
                  </IonSelectOption>
                ))}
              </IonSelect>
            </IonItem>
            <IonItem>
              <IonInput
                label="people at home (you included)"
                labelPlacement="stacked"
                type="number"
                inputmode="numeric"
                min={1}
                max={20}
                value={values.householdSize}
                onIonInput={set('householdSize')}
                onIonBlur={touch('householdSize')}
                className={stateClass('householdSize')}
                errorText={errors.householdSize}
                required
              />
            </IonItem>
            <IonItem>
              <IonTextarea
                label={`where will ${dog?.name ?? 'they'} spend the day? (optional)`}
                labelPlacement="stacked"
                autoGrow
                rows={2}
                maxlength={1000}
                value={values.daytimeLocation}
                onIonInput={set('daytimeLocation')}
                onIonBlur={touch('daytimeLocation')}
                className={stateClass('daytimeLocation')}
                errorText={errors.daytimeLocation}
              />
            </IonItem>
          </IonList>

          <IonList inset>
            <IonItem>
              <IonTextarea
                label={`why do you want to adopt ${dog?.name ?? 'this dog'}?`}
                labelPlacement="stacked"
                autoGrow
                rows={5}
                maxlength={2000}
                value={values.motivation}
                onIonInput={set('motivation')}
                onIonBlur={touch('motivation')}
                className={stateClass('motivation')}
                errorText={errors.motivation}
                counter
                counterFormatter={(length, max) => `${length}/${max} · minimum 50`}
                required
              />
            </IonItem>
          </IonList>

          {/* Permite enviar con Enter desde los campos */}
          <button type="submit" hidden aria-hidden="true" tabIndex={-1} />
        </form>
      </IonContent>

      <IonFooter className="ion-no-border adoption-form__footer">
        <IonToolbar>
          <IonButton expand="block" onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'sending…' : 'send request'}
          </IonButton>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
