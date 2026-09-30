export const SIZE_LABELS = {
  SMALL: 'small',
  MEDIUM: 'medium',
  LARGE: 'large',
  EXTRA_LARGE: 'extra large',
};

export const GENDER_LABELS = {
  MALE: 'male',
  FEMALE: 'female',
  UNKNOWN: 'unknown',
};

export const STATUS_LABELS = {
  AVAILABLE: 'available',
  IN_PROCESS: 'in process',
  ADOPTED: 'adopted',
};

export const HOUSING_LABELS = {
  HOUSE: 'house',
  APARTMENT: 'apartment',
  OTHER: 'other',
};

export function ageLabel(age) {
  if (age == null) return '';
  return age === 1 ? '1 year' : `${age} years`;
}

// Mismo orden que las DogCard de la web: dorado, verde, marrón
export const CARD_COLORS = ['#B8860B', '#114C2A', '#382903'];

export function cardColor(index) {
  return CARD_COLORS[index % CARD_COLORS.length];
}

export const PLACEHOLDER_IMG = '/placeholder-dog.svg';

// onError de <img>: cambia a la huella (una sola vez, por si también fallara)
export function showPlaceholder(e) {
  if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMG)) e.currentTarget.src = PLACEHOLDER_IMG;
}
