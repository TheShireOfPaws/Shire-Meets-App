import {
  IonBackButton,
  IonButtons,
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from '@ionic/react';
import { useParams } from 'react-router-dom';

export default function DogProfile() {
  const { id } = useParams();

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/matches" text="back" />
          </IonButtons>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <p>Dog profile {id}.</p>
      </IonContent>
    </IonPage>
  );
}
