import { IonHeader, IonToolbar } from '@ionic/react';

export default function PageHeader({ title, children }) {
  return (
    <IonHeader className="page-header ion-no-border">
      <IonToolbar>
        <div className="page-header__inner">
          <div className="page-header__titles">
            <span className="page-header__eyebrow">Shire Meets</span>
            <h1 className="page-header__title">{title}</h1>
          </div>
          {children}
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
