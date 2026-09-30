import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

export default function Discover() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Discover</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Dogs to swipe will show up here.</p>
      </IonContent>
    </IonPage>
  );
}
