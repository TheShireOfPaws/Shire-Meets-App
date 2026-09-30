import { IonHeader, IonToolbar } from '@ionic/react';

// Cabecera del rediseño: "THE SHIRE OF PAWS" pequeño encima del título
export default function PageHeader({ title, children }) {
  return (
    <IonHeader className="page-header ion-no-border">
      <IonToolbar>
        <div className="page-header__inner">
          <div className="page-header__titles">
            <span className="page-header__eyebrow">The Shire of Paws</span>
            <h1 className="page-header__title">{title}</h1>
          </div>
          {children}
        </div>
      </IonToolbar>
    </IonHeader>
  );
}
