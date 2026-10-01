import { ageGroup } from './labels';

export const EMPTY_PREFERENCES = {
  sizes: [],
  ages: [],
  gender: '',
  housing: '',
  traits: [],
};

const POINTS = { size: 3, age: 3, gender: 1, apartment: 1, trait: 2 };
const GREAT_MATCH_RATIO = 0.6;
const GREAT_MATCH_MIN = 3;

const SMALL_SIZES = ['SMALL', 'MEDIUM'];

export function scoreDog(dog, prefs) {
  if (!prefs) return 0;
  let score = 0;
  if (prefs.sizes.includes(dog.size)) score += POINTS.size;
  if (prefs.ages.includes(ageGroup(dog.age))) score += POINTS.age;
  if (prefs.gender && dog.gender === prefs.gender) score += POINTS.gender;
  // En un piso encajan mejor los perros pequeños o medianos
  if (prefs.housing === 'APARTMENT' && SMALL_SIZES.includes(dog.size)) score += POINTS.apartment;
  const shared = (dog.traits ?? []).filter((t) => prefs.traits.includes(t));
  score += shared.length * POINTS.trait;
  return score;
}

export function maxScore(prefs) {
  if (!prefs) return 0;
  return (
    (prefs.sizes.length ? POINTS.size : 0) +
    (prefs.ages.length ? POINTS.age : 0) +
    (prefs.gender ? POINTS.gender : 0) +
    (prefs.housing === 'APARTMENT' ? POINTS.apartment : 0) +
    prefs.traits.length * POINTS.trait
  );
}

export function countPreferences(p) {
  if (!p) return 0;
  return p.sizes.length + p.ages.length + p.traits.length + (p.gender ? 1 : 0) + (p.housing ? 1 : 0);
}

export function isGreatMatch(dog, prefs) {
  const max = maxScore(prefs);
  if (max < GREAT_MATCH_MIN) return false;
  return scoreDog(dog, prefs) >= max * GREAT_MATCH_RATIO;
}

// A igualdad de puntos se mantiene el orden del backend
export function rankDogs(dogs, prefs) {
  return dogs
    .map((dog, i) => ({ dog, i, score: scoreDog(dog, prefs) }))
    .sort((a, b) => b.score - a.score || a.i - b.i)
    .map(({ dog }) => dog);
}
