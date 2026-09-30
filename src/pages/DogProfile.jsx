import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { IonButton, IonContent, IonPage, IonSpinner } from '@ionic/react';

import DogDetail from '../components/DogDetail';
import { getById } from '../services/dogService';
import { getErrorMessage } from '../services/api';
import { useSwipe } from '../store/SwipeContext';
import './DogProfile.css';

// /dog/:id — el mismo perfil que la hoja, como página (enlaces directos y ?adopt=1)
export default function DogProfile() {
  const { id } = useParams();
  const location = useLocation();
  const { liked, refreshDog } = useSwipe();

  // Mientras carga getById, se muestra lo que ya tenemos
  const [dog, setDog] = useState(() =>
    location.state?.dog?.id === id ? location.state.dog : liked[id]?.dog ?? null
  );
  const [error, setError] = useState(null);
  const wantsAdopt = useRef(new URLSearchParams(location.search).get('adopt') === '1');

  const load = useCallback(async () => {
    setError(null);
    try {
      const fresh = await getById(id);
      setDog(fresh);
      refreshDog(fresh);
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, [id, refreshDog]);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <IonPage className="dog-profile">
      {dog ? (
        <DogDetail dog={dog} variant="page" autoAdopt={wantsAdopt.current} />
      ) : (
        <IonContent>
          <div className="dog-profile__state" role={error ? 'alert' : undefined}>
            {error ? (
              <>
                <p>{error}</p>
                <IonButton onClick={load}>try again</IonButton>
              </>
            ) : (
              <IonSpinner name="crescent" color="primary" />
            )}
          </div>
        </IonContent>
      )}
    </IonPage>
  );
}
