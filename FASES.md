# Fases — Shire Match

Cada fase se pide por separado. Lee `CLAUDE.md` antes de empezar.

## Fase 0 — base del proyecto

1. Crea el proyecto Ionic React con Vite y JavaScript en esta carpeta
   (si `ionic start` pide TypeScript, monta el proyecto a mano con Vite).
   Dependencias: las de la sección Stack de CLAUDE.md. Puerto de dev: 8100.
2. Crea capacitor.config.json (appId com.theshireofpaws.match, appName "Shire Match", webDir dist),
   .env.example con VITE_API_URL y .gitignore (node_modules, dist, .env, android, ios).
3. theme.css con los colores y la fuente de CLAUDE.md como variables de Ionic
   (primary, secondary, tertiary con sus -rgb, -shade, -tint y -contrast).
4. App.jsx con IonTabs: pestañas "Descubrir" (/discover) y "Matches" (/matches),
   y la ruta /dog/:id dentro del mismo IonRouterOutlet. Páginas vacías de momento.
5. En el repo del backend (ruta: ../TheShireOfPaws-Backend), añade a app.cors.allowed-origins:
   http://localhost:8100, capacitor://localhost, https://localhost. Solo ese cambio.

**Criterio de hecho:** `npm run dev` abre la app con las dos pestañas navegables y los colores de la marca.
