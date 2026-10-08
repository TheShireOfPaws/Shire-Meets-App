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

// Same order as the backend DogTrait enum
export const TRAIT_LABELS = {
  ACTIVE: 'active',
  CALM: 'calm',
  AFFECTIONATE: 'affectionate',
  GOOD_WITH_KIDS: 'good with kids',
  GOOD_WITH_DOGS: 'good with dogs',
  HOUSE_TRAINED: 'house-trained',
};

export const AGE_GROUP_LABELS = {
  PUPPY: 'puppy (0–1)',
  ADULT: 'adult (2–7)',
  SENIOR: 'senior (8+)',
};

export function ageGroup(age) {
  if (age == null) return null;
  if (age <= 1) return 'PUPPY';
  return age >= 8 ? 'SENIOR' : 'ADULT';
}

export function ageLabel(age) {
  if (age == null) return '';
  return age === 1 ? '1 year' : `${age} years`;
}
