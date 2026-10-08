import { useEffect, useState } from 'react';
import { IonModal } from '@ionic/react';
import DogDetail from './DogDetail';

export default function DogSheet({ dog, autoAdopt = false, onClose, onLike, onPass }) {
  // Keeps the last dog so the sheet doesn't go blank while it slides down
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
