import { useEffect, useRef } from 'react';
import { Redirect, Route, useLocation } from 'react-router-dom';
import {
  IonApp,
  IonIcon,
  IonLabel,
  IonRouterOutlet,
  IonTabBar,
  IonTabButton,
  IonTabs,
  setupIonicReact,
} from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { heart, paw } from 'ionicons/icons';

import Discover from './pages/Discover';
import Matches from './pages/Matches';
import DogProfile from './pages/DogProfile';
import { useSwipe } from './store/SwipeContext';

setupIonicReact({
  mode: 'ios',
  animated: !window.matchMedia?.('(prefers-reduced-motion: reduce)').matches,
});

// Al salir de /matches, los matches nuevos pasan a vistos
function SeenTracker() {
  const { pathname } = useLocation();
  const { markAllSeen } = useSwipe();
  const prev = useRef(pathname);
  useEffect(() => {
    if (prev.current === '/matches' && pathname !== '/matches') markAllSeen();
    prev.current = pathname;
  }, [pathname, markAllSeen]);
  return null;
}

function MatchesTab() {
  const { pathname } = useLocation();
  const { liked } = useSwipe();
  // Sin seen (guardados antes del rediseño) cuentan como vistos
  const showDot =
    pathname !== '/matches' && Object.values(liked).some((entry) => entry.seen === false);
  return (
    <>
      <IonIcon aria-hidden="true" icon={heart} />
      <IonLabel>
        Matches
        {showDot && <span className="sr-only"> (new)</span>}
      </IonLabel>
      {showDot && <span className="tab-dot" aria-hidden="true" />}
    </>
  );
}

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <SeenTracker />
        <IonTabs>
          <IonRouterOutlet>
            <Route exact path="/discover" component={Discover} />
            <Route exact path="/matches" component={Matches} />
            <Route exact path="/dog/:id" component={DogProfile} />
            <Route exact path="/">
              <Redirect to="/discover" />
            </Route>
          </IonRouterOutlet>

          <IonTabBar slot="bottom">
            <IonTabButton tab="discover" href="/discover" layout="icon-start">
              <IonIcon aria-hidden="true" icon={paw} />
              <IonLabel>Discover</IonLabel>
            </IonTabButton>
            <IonTabButton tab="matches" href="/matches" layout="icon-start">
              <MatchesTab />
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
