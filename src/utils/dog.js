import { GENDER_LABELS, SIZE_LABELS, TRAIT_LABELS } from './labels';

export const PLACEHOLDER_IMG = '/placeholder-dog.svg';

// Una sola vez, por si también fallara la huella
export function showPlaceholder(e) {
  if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMG)) e.currentTarget.src = PLACEHOLDER_IMG;
}

export function dogPhotos(dog) {
  const photos = [dog.photoUrl, ...(dog.extraPhotoUrls ?? [])].filter(Boolean);
  return photos.length ? photos : [PLACEHOLDER_IMG];
}

export function genderSize(dog) {
  return [GENDER_LABELS[dog.gender], SIZE_LABELS[dog.size]].filter(Boolean).join(' · ');
}

export function traitLabels(dog) {
  return (dog.traits ?? []).map((t) => TRAIT_LABELS[t]).filter(Boolean);
}
