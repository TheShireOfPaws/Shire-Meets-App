import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { createGesture } from '@ionic/react';
import { GENDER_LABELS, PLACEHOLDER_IMG, SIZE_LABELS, ageLabel, cardColor } from '../utils/labels';
import './SwipeCard.css';

const SWIPE_RATIO = 0.28; // % del ancho para que cuente como swipe
const SWIPE_VELOCITY = 0.45;
const TAP_MAX = 6; // px: por debajo es un tap
const MAX_ROTATION = 15;
const FLY_MS = 300;

const prefersReducedMotion = () =>
  window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;

const SwipeCard = forwardRef(function SwipeCard(
  { dog, colorIndex, depth, isTop, onSwiped, onOpen },
  ref
) {
  const cardRef = useRef(null);
  const likeRef = useRef(null);
  const nopeRef = useRef(null);
  const leavingRef = useRef(false);
  const lastDyRef = useRef(0);

  // Los callbacks cambian en cada render; el gesto se crea una vez y los lee de aquí
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

    lastDyRef.current = dy * 0.2;
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
    // Pequeño rebote al volver al centro
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
      onMove: (d) => {
        if (!leavingRef.current) drag(d.deltaX, d.deltaY);
      },
      onEnd: (d) => {
        if (leavingRef.current) return;
        const { deltaX: dx, deltaY: dy, velocityX: vx } = d;

        if (Math.abs(dx) < TAP_MAX && Math.abs(dy) < TAP_MAX) {
          snapBack();
          callbacks.current.onOpen(dog);
        } else if (Math.abs(dx) > el.offsetWidth * SWIPE_RATIO || Math.abs(vx) > SWIPE_VELOCITY) {
          flyOut((dx !== 0 ? dx : vx) > 0 ? 'right' : 'left');
        } else {
          snapBack();
        }
      },
    });
    gesture.enable(true);
    return () => gesture.destroy();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTop, dog]);

  function handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onOpen(dog);
    } else if (e.key === 'ArrowRight') {
      flyOut('right');
    } else if (e.key === 'ArrowLeft') {
      flyOut('left');
    }
  }

  const meta = [ageLabel(dog.age), GENDER_LABELS[dog.gender], SIZE_LABELS[dog.size]]
    .filter(Boolean)
    .join(' · ');

  return (
    <div
      ref={cardRef}
      className="swipe-card"
      data-depth={depth}
      style={{ '--card-color': cardColor(colorIndex), zIndex: 10 - depth }}
      aria-hidden={!isTop}
      {...(isTop && {
        tabIndex: 0,
        role: 'button',
        'aria-label': `see ${dog.name}'s profile`,
        onKeyDown: handleKeyDown,
        // Clic sin ratón (lector de pantalla): detail === 0
        onClick: (e) => e.detail === 0 && onOpen(dog),
      })}
    >
      <div className="swipe-card__photo">
        <img
          src={dog.photoUrl || PLACEHOLDER_IMG}
          alt=""
          draggable={false}
          onError={(e) => {
            if (!e.currentTarget.src.endsWith(PLACEHOLDER_IMG)) e.currentTarget.src = PLACEHOLDER_IMG;
          }}
        />
        <span ref={likeRef} className="swipe-card__stamp swipe-card__stamp--like" aria-hidden="true">
          like!
        </span>
        <span ref={nopeRef} className="swipe-card__stamp swipe-card__stamp--nope" aria-hidden="true">
          nope
        </span>
      </div>
      <div className="swipe-card__info">
        <h2 className="swipe-card__name">{dog.name}</h2>
        <p className="swipe-card__meta">{meta}</p>
      </div>
    </div>
  );
});

export default SwipeCard;
