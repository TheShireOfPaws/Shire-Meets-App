import { useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonContent,
  IonFooter,
  IonHeader,
  IonInput,
  IonItem,
  IonList,
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
import { EMPTY_FORM, FORM_FIELDS, initialValues, toRequest, validate } from '../utils/adoptionForm';
import { HOUSING_LABELS } from '../utils/labels';
import './AdoptionForm.css';

export default function AdoptionForm({ dog, isOpen, onClose }) {
  const { profile, preferences, saveProfile, markRequested } = useSwipe();
  const [presentToast] = useIonToast();

  const [values, setValues] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const errors = validate(values);

  useEffect(() => {
    if (!isOpen) return;
    setValues(initialValues(profile, preferences));
    setTouched({});
    setSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const setValue = (field, value) => setValues((v) => ({ ...v, [field]: value ?? '' }));
  const touch = (field) => setTouched((t) => ({ ...t, [field]: true }));

  // Ionic muestra errorText solo con ion-invalid + ion-touched
  const field = (name) => ({
    value: values[name],
    onIonInput: (e) => setValue(name, e.detail.value),
    onIonBlur: () => touch(name),
    className: touched[name] ? `ion-touched ${errors[name] ? 'ion-invalid' : 'ion-valid'}` : '',
    errorText: errors[name],
    labelPlacement: 'stacked',
  });

  async function handleSubmit(e) {
    e?.preventDefault();
    if (submitting) return;

    if (Object.keys(errors).length > 0) {
      setTouched(Object.fromEntries(FORM_FIELDS.map((f) => [f, true])));
      return;
    }

    const request = toRequest(values, dog.id);
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
      presentToast({ message: getErrorMessage(err), color: 'danger', duration: 5000, position: 'top' });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} className="adoption-form">
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
                {...field('requesterFirstName')}
                label="first name"
                autocomplete="given-name"
                maxlength={50}
                required
              />
            </IonItem>
            <IonItem>
              <IonInput
                {...field('requesterLastName')}
                label="last name"
                autocomplete="family-name"
                maxlength={50}
                required
              />
            </IonItem>
            <IonItem>
              <IonInput
                {...field('requesterEmail')}
                label="email"
                type="email"
                inputmode="email"
                autocomplete="email"
                required
              />
            </IonItem>
          </IonList>

          <IonList inset>
            <IonItem>
              <IonSelect
                {...field('housingType')}
                label="type of home"
                interface="action-sheet"
                placeholder="choose one"
                cancelText="cancel"
                value={values.housingType || undefined}
                onIonChange={(e) => {
                  setValue('housingType', e.detail.value);
                  touch('housingType');
                }}
                onIonDismiss={() => touch('housingType')}
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
                {...field('householdSize')}
                label="people at home (you included)"
                type="number"
                inputmode="numeric"
                min={1}
                max={20}
                required
              />
            </IonItem>
            <IonItem>
              <IonTextarea
                {...field('daytimeLocation')}
                label={`where will ${dog?.name ?? 'they'} spend the day? (optional)`}
                autoGrow
                rows={2}
                maxlength={1000}
              />
            </IonItem>
          </IonList>

          <IonList inset>
            <IonItem>
              <IonTextarea
                {...field('motivation')}
                label={`why do you want to adopt ${dog?.name ?? 'this dog'}?`}
                autoGrow
                rows={5}
                maxlength={2000}
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
          <button
            type="button"
            className="btn btn--primary adoption-form__submit"
            onClick={handleSubmit}
            disabled={submitting}
          >
            {submitting ? 'sending…' : 'send request'}
          </button>
        </IonToolbar>
      </IonFooter>
    </IonModal>
  );
}
