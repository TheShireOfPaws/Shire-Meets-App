import { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import DogDetail from './DogDetail';

// dog = null cierra la hoja
export default function DogSheet({ dog, autoAdopt = false, onClose, onLike, onPass }) {
  // Último perro mostrado: evita que la hoja se vacíe mientras baja
  const [shown, setShown] = useState(dog);
  useEffect(() => {
    if (dog) setShown(dog);
  }, [dog]);

  return (
    <IonModal
      isOpen={Boolean(dog)}
      onDidDismiss={onClose}
      breakpoints={[0, 0.94]}
      initialBreakpoint={0.94}
      className="sheet-modal"
    >
      {shown && (
        <DogDetail
          key={shown.id}
          dog={shown}
          variant="sheet"
          autoAdopt={autoAdopt}
          onClose={onClose}
          onLike={onLike}
          onPass={onPass}
        />
      )}
    </IonModal>
  );
}
