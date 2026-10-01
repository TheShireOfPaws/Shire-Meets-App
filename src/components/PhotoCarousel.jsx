import { useState } from 'react';
import { showPlaceholder } from '../utils/dog';
import './PhotoCarousel.css';

export default function PhotoCarousel({ photos, alt, children }) {
  const [index, setIndex] = useState(0);
  const last = photos.length - 1;

  return (
    <div className="dog-detail__photo">
      <img src={photos[index]} alt={alt} onError={showPlaceholder} />

      {photos.length > 1 && (
        <>
          <button
            type="button"
            className="dog-detail__zone dog-detail__zone--prev"
            aria-label="previous photo"
            disabled={index === 0}
            onClick={() => setIndex((i) => i - 1)}
          />
          <button
            type="button"
            className="dog-detail__zone dog-detail__zone--next"
            aria-label="next photo"
            disabled={index === last}
            onClick={() => setIndex((i) => i + 1)}
          />
          <div className="dog-detail__bars">
            {photos.map((url, i) => (
              <button
                key={url}
                type="button"
                className={i === index ? 'is-active' : undefined}
                aria-label={`photo ${i + 1} of ${photos.length}`}
                aria-pressed={i === index}
                onClick={() => setIndex(i)}
              />
            ))}
          </div>
        </>
      )}

      {children}
    </div>
  );
}
