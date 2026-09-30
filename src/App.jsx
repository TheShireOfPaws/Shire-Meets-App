import { Redirect, Route } from 'react-router-dom';
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

// Mismo aspecto en Android e iOS
setupIonicReact({ mode: 'ios' });

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
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
            <IonTabButton tab="discover" href="/discover">
              <IonIcon aria-hidden="true" icon={paw} />
              <IonLabel>Discover</IonLabel>
            </IonTabButton>
            <IonTabButton tab="matches" href="/matches">
              <IonIcon aria-hidden="true" icon={heart} />
              <IonLabel>Matches</IonLabel>
            </IonTabButton>
          </IonTabBar>
        </IonTabs>
      </IonReactRouter>
    </IonApp>
  );
}
