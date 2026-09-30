import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar } from '@ionic/react';

export default function Discover() {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Descubrir</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Aquí saldrán los perros para hacer swipe.</p>
      </IonContent>
    </IonPage>
  );
}
