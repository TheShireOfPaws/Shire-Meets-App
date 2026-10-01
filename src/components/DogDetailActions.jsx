import { IonFooter, IonToolbar } from '@ionic/react';

function actionsFor({ dog, requested, isLiked, canPass, onPass, onLike, onRequest }) {
  if (dog.status !== 'AVAILABLE') {
    return <p className="dog-detail__notice">{dog.name} isn't available anymore</p>;
  }
  if (requested) {
    return <p className="dog-detail__notice">Request sent · the shelter will write to you</p>;
  }
  if (isLiked) {
    return (
      <button type="button" className="btn btn--primary" onClick={onRequest}>
        request adoption
      </button>
    );
  }
  return (
    <>
      {canPass && (
        <button type="button" className="btn btn--outline-red" onClick={onPass}>
          not now
        </button>
      )}
      <button type="button" className="btn btn--primary btn--wide" onClick={onLike}>
        I'd love to meet
      </button>
    </>
  );
}

export default function DogDetailActions(props) {
  return (
    <IonFooter className="ion-no-border dog-detail__footer">
      <IonToolbar>
        <div className="dog-detail__actions">{actionsFor(props)}</div>
      </IonToolbar>
    </IonFooter>
  );
}
