export const initialState = {
  liked: {}, // { [id]: { dog, likedAt, requested, seen } }
  passed: [],
  lastAction: null,
  profile: null,
  preferences: null, // null = the preferences sheet hasn't been completed yet
};

const now = () => new Date().toISOString();

function withoutLiked(liked, id) {
  const { [id]: _removed, ...rest } = liked;
  return rest;
}

export const transitions = {
  like: (s, dog) => ({
    ...s,
    liked: {
      ...s.liked,
      [dog.id]: { dog, likedAt: now(), requested: s.liked[dog.id]?.requested ?? false, seen: false },
    },
    passed: s.passed.filter((id) => id !== dog.id),
    lastAction: { type: 'like', dog },
  }),

  pass: (s, dog) => ({
    ...s,
    passed: s.passed.includes(dog.id) ? s.passed : [...s.passed, dog.id],
    lastAction: { type: 'pass', dog },
  }),

  undo: (s) => {
    const action = s.lastAction;
    if (!action) return s;
    return action.type === 'like'
      ? { ...s, liked: withoutLiked(s.liked, action.dog.id), lastAction: null }
      : { ...s, passed: s.passed.filter((id) => id !== action.dog.id), lastAction: null };
  },

  unlike: (s, id) => {
    if (!s.liked[id]) return s;
    const lastAction = s.lastAction?.dog.id === id ? null : s.lastAction;
    return { ...s, liked: withoutLiked(s.liked, id), lastAction };
  },

  refreshDog: (s, dog) => {
    const entry = s.liked[dog.id];
    if (!entry) return s;
    return { ...s, liked: { ...s.liked, [dog.id]: { ...entry, dog } } };
  },

  markRequested: (s, dog) => ({
    ...s,
    liked: {
      ...s.liked,
      [dog.id]: { dog, likedAt: s.liked[dog.id]?.likedAt ?? now(), requested: true, seen: true },
    },
  }),

  resetPassed: (s) => ({
    ...s,
    passed: [],
    lastAction: s.lastAction?.type === 'pass' ? null : s.lastAction,
  }),

  markAllSeen: (s) => {
    if (!Object.values(s.liked).some((e) => e.seen === false)) return s;
    const liked = Object.fromEntries(Object.entries(s.liked).map(([id, e]) => [id, { ...e, seen: true }]));
    return { ...s, liked };
  },

  saveProfile: (s, profile) => ({ ...s, profile }),

  savePreferences: (s, preferences) => ({ ...s, preferences }),
};
