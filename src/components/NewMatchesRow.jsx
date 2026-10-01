import { dogPhotos, showPlaceholder } from '../utils/dog';

export default function NewMatchesRow({ matches, onOpen }) {
  return (
    <section className="matches__section">
      <h2 className="matches__heading">new</h2>
      <ul className="matches__rings">
        {matches.map(({ dog, seen }) => (
          <li key={dog.id}>
            <button
              type="button"
              className="matches__ring-btn"
              aria-label={`${dog.name}${seen === false ? ', new' : ''}`}
              onClick={() => onOpen(dog)}
            >
              <span className="matches__ring">
                <img src={dogPhotos(dog)[0]} alt="" onError={showPlaceholder} />
                {seen === false && <span className="matches__new-dot" aria-hidden="true" />}
              </span>
              <span className="matches__ring-name" aria-hidden="true">
                {dog.name}
              </span>
            </button>
          </li>
        ))}
      </ul>
    </section>
  );
}
