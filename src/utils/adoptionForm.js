export const EMPTY_FORM = {
  requesterFirstName: '',
  requesterLastName: '',
  requesterEmail: '',
  housingType: '',
  householdSize: '',
  daytimeLocation: '',
  motivation: '',
};

export const FORM_FIELDS = Object.keys(EMPTY_FORM);

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_MOTIVATION = 50;

function nameError(value, label) {
  const t = value.trim();
  if (!t) return `Tell us your ${label}.`;
  if (t.length < 2 || t.length > 50) return 'Between 2 and 50 characters.';
  return null;
}

function emailError(value) {
  const email = value.trim();
  if (!email) return 'Tell us your email.';
  return EMAIL_RE.test(email) ? null : "That email doesn't look right.";
}

function householdError(value) {
  if (value === '' || value == null) return 'How many people live with you?';
  const size = Number(value);
  return Number.isInteger(size) && size >= 1 && size <= 20 ? null : 'A whole number from 1 to 20.';
}

function motivationError(value) {
  const length = value.trim().length;
  if (length === 0) return 'Tell the shelter why.';
  if (length < MIN_MOTIVATION) return `At least ${MIN_MOTIVATION} characters (${MIN_MOTIVATION - length} to go).`;
  return length > 2000 ? 'Up to 2000 characters.' : null;
}

// Same rules as AdoptionRequestRequest in the backend
export function validate(v) {
  const errors = {
    requesterFirstName: nameError(v.requesterFirstName, 'first name'),
    requesterLastName: nameError(v.requesterLastName, 'last name'),
    requesterEmail: emailError(v.requesterEmail),
    housingType: v.housingType ? null : 'Choose your type of home.',
    householdSize: householdError(v.householdSize),
    daytimeLocation: v.daytimeLocation.trim().length > 1000 ? 'Up to 1000 characters.' : null,
    motivation: motivationError(v.motivation),
  };
  return Object.fromEntries(Object.entries(errors).filter(([, message]) => message));
}

// Saved adopter data; without a profile, the housing type comes from the preferences
export function initialValues(profile, preferences) {
  const saved = Object.entries(profile ?? {})
    .filter(([key, value]) => key in EMPTY_FORM && value != null)
    .map(([key, value]) => [key, String(value)]);
  return { ...EMPTY_FORM, housingType: preferences?.housing ?? '', ...Object.fromEntries(saved), motivation: '' };
}

export function toRequest(values, dogId) {
  return {
    requesterFirstName: values.requesterFirstName.trim(),
    requesterLastName: values.requesterLastName.trim(),
    requesterEmail: values.requesterEmail.trim(),
    housingType: values.housingType,
    householdSize: Number(values.householdSize),
    daytimeLocation: values.daytimeLocation.trim() || null,
    motivation: values.motivation.trim(),
    dogId,
  };
}
