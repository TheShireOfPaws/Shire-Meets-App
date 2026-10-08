import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createGesture } from '@ionic/react';
import { ageLabel } from '../utils/labels';
import { dogPhotos, genderSize, showPlaceholder, traitLabels } from '../utils/dog';
import './SwipeCard.css';

const SWIPE_RATIO = 0.28; // of the card width
const SWIPE_VELOCITY = 0.45;
const TAP_MAX = 6; // px
const MAX_ROTATION = 15;
const FLY_MS = 300;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const SwipeCard = forwardRef(function SwipeCard(
  { dog, depth, isTop, greatMatch, onSwiped, onOpen },
  ref
) {
  const [photo, setPhoto] = useState(0);
  const photos = dogPhotos(dog);

  const cardRef = useRef(null);
  const likeRef = useRef(null);
  const nopeRef = useRef(null);
  const leavingRef = useRef(false);
  const lastDyRef = useRef(0);

  // Callbacks change every render; the gesture is created once and reads them from here
  const callbacks = useRef({ onSwiped, onOpen });
  callbacks.current = { onSwiped, onOpen };

  function setStamps(like, nope) {
    likeRef.current.style.opacity = like;
    nopeRef.current.style.opacity = nope;
  }

  function drag(dx, dy) {
    const el = cardRef.current;
    const width = el.offsetWidth;
    const rotation = Math.max(-1, Math.min(1, dx / width)) * MAX_ROTATION;
    const progress = Math.min(Math.abs(dx) / (width * SWIPE_RATIO), 1);

    lastDyRef.current = dy * 0.3;
    el.style.transition = 'none';
    el.style.transform = `translate(${dx}px, ${lastDyRef.current}px) rotate(${rotation}deg)`;
    setStamps(dx > 0 ? progress : 0, dx < 0 ? progress : 0);
  }

  function flyOut(dir) {
    if (leavingRef.current) return;
    leavingRef.current = true;

    const el = cardRef.current;
    const ms = prefersReducedMotion() ? 0 : FLY_MS;
    const x = (dir === 'right' ? 1 : -1) * window.innerWidth * 1.5;

    el.style.transition = `transform ${ms}ms ease-in`;
    el.style.transform = `translate(${x}px, ${lastDyRef.current}px) rotate(${dir === 'right' ? 30 : -30}deg)`;
    setStamps(dir === 'right' ? 1 : 0, dir === 'left' ? 1 : 0);
    setTimeout(() => callbacks.current.onSwiped(dog, dir), ms);
  }

  function snapBack() {
    const el = cardRef.current;
    el.style.transition = prefersReducedMotion()
      ? 'none'
      : 'transform 400ms cubic-bezier(0.34, 1.56, 0.64, 1)';
    el.style.transform = '';
    setStamps(0, 0);
  }

  useImperativeHandle(ref, () => ({ swipe: flyOut }));

  useEffect(() => {
    if (!isTop) return undefined;
    const el = cardRef.current;

    const gesture = createGesture({
      el,
      gestureName: 'swipe-card',
      threshold: 0,
      canStart: (d) => !d.event.target.closest?.('[data-no-swipe]'),
      onMove: (d) => {
        if (!leavingRef.current) drag(d.deltaX, d.deltaY);
      },
      onEnd: (d) => {
        if (leavingRef.current) return;
        const { deltaX: dx, deltaY: dy, velocityX: vx } = d;

        if (Math.abs(dx) < TAP_MAX && Math.abs(dy) < TAP_MAX) {
          snapBack();
          // Tap: left/right half changes photo; with a single photo it opens the profile
          if (photos.length > 1) {
            const rect = el.getBoundingClientRect();
            const step = (d.startX - rect.left) / rect.width > 0.5 ? 1 : -1;
            setPhoto((p) => Math.max(0, Math.min(photos.length - 1, p + step)));
          } else {
            callbacks.current.onOpen(dog);
          }
        } else if (Math.abs(dx) > el.offsetWidth * SWIPE_RATIO || Math.abs(vx) > SWIPE_VELOCITY) {
          flyOut((dx !== 0 ? dx : vx) > 0 ? 'right' : 'left');
        } else {
          snapBack();
        }
      },
    });
    gesture.enable(true);
    return () => gesture.destroy();
  }, [isTop, dog]);

  function handleKeyDown(e) {
    if (e.target !== e.currentTarget) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(dog);
    } else if (e.key === 'ArrowRight') {
      flyOut('right');
    } else if (e.key === 'ArrowLeft') {
      flyOut('left');
    }
  }

  const meta = genderSize(dog);
  const traits = traitLabels(dog);
  const label = [
    `${dog.name}, ${ageLabel(dog.age)}`,
    greatMatch && 'great match',
    meta,
    traits.join(', '),
  ]
    .filter(Boolean)
    .join(', ');

  return (
    <div
      ref={cardRef}
      className="swipe-card"
      data-depth={depth}
      style={{ zIndex: 10 - depth }}
      aria-hidden={!isTop}
      {...(isTop && {
        tabIndex: 0,
        role: 'group',
        'aria-roledescription': 'dog card',
        'aria-label': label,
        'aria-keyshortcuts': 'Enter ArrowLeft ArrowRight',
        onKeyDown: handleKeyDown,
      })}
    >
      <img
        className="swipe-card__img"
        src={photos[photo]}
        alt=""
        draggable={false}
        onError={showPlaceholder}
      />

      {photos.length > 1 && (
        <div className="swipe-card__bars" aria-hidden="true">
          {photos.map((url, i) => (
            <span key={url} className={i === photo ? 'is-active' : undefined} />
          ))}
        </div>
      )}

      <span ref={likeRef} className="swipe-card__stamp swipe-card__stamp--like" aria-hidden="true">
        ADOPT ME
      </span>
      <span ref={nopeRef} className="swipe-card__stamp swipe-card__stamp--nope" aria-hidden="true">
        NOT NOW
      </span>

      <div className="swipe-card__overlay">
        {greatMatch && <span className="great-badge">★ great match</span>}
        <div className="swipe-card__row">
          <div className="swipe-card__titles">
            <h2 className="swipe-card__name">
              {dog.name} <span className="swipe-card__age">{dog.age}</span>
            </h2>
            <p className="swipe-card__meta">{meta}</p>
          </div>
          <button
            type="button"
            className="swipe-card__info"
            data-no-swipe
            tabIndex={isTop ? 0 : -1}
            aria-label={`more about ${dog.name}`}
            onClick={() => onOpen(dog)}
          >
            i
          </button>
        </div>
        {traits.length > 0 && (
          <ul className="swipe-card__traits" aria-hidden="true">
            {traits.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
});

export default SwipeCard;
