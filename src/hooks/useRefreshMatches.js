import { useCallback, useEffect, useRef } from 'react';
import { useIonViewWillEnter } from '@ionic/react';
import { getById } from '../services/dogService';

// Fetches the current state of every liked dog; failed ones keep their saved data
export default function useRefreshMatches({ ready, liked, refreshDog }) {
  const likedRef = useRef(liked);
  likedRef.current = liked;

  const refresh = useCallback(async () => {
    const results = await Promise.allSettled(Object.keys(likedRef.current).map(getById));
    results.forEach((r) => {
      if (r.status === 'fulfilled') refreshDog(r.value);
    });
  }, [refreshDog]);

  useIonViewWillEnter(() => {
    if (ready) refresh();
  }, [ready, refresh]);

  // Opening /matches directly: refresh once Preferences has loaded
  const wasReady = useRef(ready);
  useEffect(() => {
    if (ready && !wasReady.current) refresh();
    wasReady.current = ready;
  }, [ready, refresh]);

  return refresh;
}
