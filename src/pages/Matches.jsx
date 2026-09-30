import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

export default function Matches() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Matches</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>The dogs you like will show up here.</p>
      </IonContent>
    </IonPage>
  );
}
