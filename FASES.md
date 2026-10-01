# Fases — Shire Meets

Cada fase se pide por separado. Lee `CLAUDE.md` antes de empezar.

> **Idioma:** los textos de UI que aparecen en español en las fases son orientativos; en la app van siempre en **inglés** (ver `CLAUDE.md`).

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

## Fase 1 — servicios y estado (sin UI)

1. services/api.js: instancia de axios con VITE_API_URL y timeout de 15 s.
   Exporta getErrorMessage(err) que use el formato de errores de CLAUDE.md,
   con mensajes en español para timeout y sin conexión.
2. services/dogService.js: getAvailable({ page, pageSize, size, gender }) que siempre pide status=AVAILABLE,
   y getById(id).
3. services/adoptionService.js: create(request).
4. utils/labels.js: traducciones al español de size, gender, status y housingType,
   ageLabel(age) ("1 año" / "N años"), los colores de tarjeta y la ruta de un placeholder SVG
   (créalo en public/placeholder-dog.svg, una huella sencilla en tonos crema).
5. store/SwipeContext.jsx: contexto con estado { liked: {id: {dog, likedAt, requested}}, passed: [ids],
   lastAction, profile }, cargado y guardado con @capacitor/preferences.
   Acciones: like(dog), pass(dog), undo() → devuelve el perro deshecho, unlike(id), refreshDog(dog),
   markRequested(dog), resetPassed(), saveProfile(profile). Expón también seenIds (Set) y ready.
   undo() debe leer el estado actual con un ref para poder devolver el perro de forma síncrona.

**Criterio de hecho:** build limpio. Escribe una prueba rápida en consola o una página temporal
que llame a getAvailable() contra mi backend local y la borras después.

## Fase 2 — pantalla Descubrir

1. components/SwipeCard.jsx (forwardRef):
   - Foto enmarcada en el color de la tarjeta, y abajo nombre grande + "edad · sexo · tamaño".
   - Solo la tarjeta de arriba (isTop) tiene gesto (createGesture, threshold 0).
     Al arrastrar: translateX, algo de translateY y rotación proporcional.
   - Sellos "¡Me gusta!" (verde, izquierda) y "Paso" (rojo, derecha) cuya opacidad sube con el arrastre.
   - Al soltar: si pasa del 28 % del ancho o la velocidad > 0.45, sale volando y llama a onSwiped(dir);
     si no, vuelve al centro con un pequeño rebote.
   - Manipula el DOM con refs durante el gesto (no setState en onMove).
   - useImperativeHandle con swipe(dir) para los botones.
   - Un tap sin arrastre llama a onOpen(dog).
   - Las tarjetas de detrás se ven un poco más pequeñas y desplazadas (depth 1 y 2).
2. pages/Discover.jsx:
   - Carga perros disponibles excluyendo seenIds; si una página queda vacía tras filtrar, pide la siguiente.
   - Muestra 3 tarjetas; precarga cuando quedan menos de 3.
   - Botones abajo: deshacer (pequeño), pasar (X) y me gusta (corazón, relleno verde).
   - Estados: cargando (spinner), error (mensaje + Reintentar), vacío ("Ya los has visto a todos"
     con botones "Ver mis matches" y "Volver a verlos", que llama a resetPassed y recarga).

**Criterio de hecho:** puedo deslizar con ratón y con los botones, deshacer, y al recargar la página
no vuelven a salir los perros ya vistos.

## Fase 3 — match y perfil

1. components/MatchModal.jsx: modal a pantalla completa, fondo verde, título "¡Es un match!" en dorado
   algo inclinado con una animación de entrada (solo esta, respetando reduced-motion),
   foto circular con borde dorado y botones "Solicitar adopción" y "Seguir mirando".
   Se abre al dar like en Descubrir.
2. pages/DogProfile.jsx en /dog/:id:
   - Usa el perro que llega por location.state o el guardado en liked mientras carga getById.
   - Foto grande arriba, cuerpo con esquinas redondeadas superpuesto, nombre, chips (edad, sexo,
     tamaño y estado si no está disponible) y "Su historia".
   - Header transparente con botón atrás y corazón para añadir o quitar de matches.
   - Footer fijo: "Quiero adoptar a {nombre}"; si ya envié solicitud o no está disponible, un texto en su lugar.
   - Si la URL trae ?adopt=1 (desde el match), abre el formulario directamente (el formulario llega en la fase 4,
     deja el hueco preparado).

**Criterio de hecho:** like → match → "Solicitar adopción" me lleva al perfil; tap en una tarjeta abre el perfil.

## Fase 4 — formulario de adopción

components/AdoptionForm.jsx dentro de un IonModal.

- Campos y validaciones exactamente como AdoptionRequestRequest en CLAUDE.md.
  Vivienda con IonSelect (action-sheet), personas en casa numérico, motivación con contador "N/2000 · mínimo 50".
- Errores bajo cada campo (clases ion-invalid ion-touched + errorText).
- Al abrir, rellena con el profile guardado; la motivación siempre empieza vacía.
- Al enviar: POST, guarda el profile (sin motivation ni dogId), markRequested(dog),
  toast verde "Solicitud enviada. El refugio te escribirá sobre {nombre}." y cierra.
- Si falla, toast rojo con getErrorMessage.
- Botón deshabilitado mientras envía ("Enviando…").

**Criterio de hecho:** la solicitud aparece en el panel de admin de la web y el perfil muestra
"Ya has enviado una solicitud".

## Fase 5 — Matches

pages/Matches.jsx.

- Tira horizontal arriba con los últimos 10 matches en círculo (borde dorado) y la lista completa debajo
  (avatar, nombre, edad), ordenada del más reciente al más antiguo.
- Badge "Solicitud enviada" (dorado) o el estado si ya no está disponible.
- Deslizar un elemento a la izquierda → "Quitar".
- Al entrar en la vista (useIonViewWillEnter) y con pull-to-refresh, refresca cada perro con getById
  (Promise.allSettled) y actualiza con refreshDog.
- El contador de matches aparece en la pestaña: "Matches (3)".
- Estado vacío: "Aún no tienes matches" + botón "Empezar a descubrir".

**Criterio de hecho:** si en la web marco un perro como adoptado, al volver a Matches aparece como adoptado.

## Fase 6 — filtros y repaso

1. Botón de filtros en la cabecera de Descubrir → sheet modal (breakpoint 0.45) con Tamaño y Sexo
   ("Cualquiera" por defecto) y botón "Ver perros". Cambiar filtros reinicia la pila.
   Si hay filtros activos, muéstralos en una línea pequeña bajo la cabecera.
2. Revisa accesibilidad: aria-labels, foco visible en los botones de acción, contraste, reduced-motion.
3. Imágenes: onError → placeholder en todas.
4. Prueba en viewport de 360 px y de tablet; nada debe desbordar.
5. Repasa los textos para que sean coherentes (la acción se llama igual en botón y toast).
6. Si el bundle avisa de >500 kB, no hace falta arreglarlo ahora; solo dímelo.

**Criterio de hecho:** lista de lo que has revisado y capturas o descripción de cada pantalla.

## Fase 7 — Android y README

1. Explícame qué URL de backend poner en .env para el build (Render en https;
   10.0.2.2:8080 si uso el emulador contra mi backend local, con cleartext permitido solo en debug).
2. npm run build, npx cap add android, npx cap sync.
3. Icono y splash con la huella y los colores de la marca (@capacitor/assets si hace falta; pregúntame antes).
4. Color de la status bar verde #114C2A.
5. Escribe README.md: qué hace la app, cómo arrancarla, el cambio de CORS, cómo generar Android/iOS
   y el ciclo `npm run build && npx cap sync`.

**Criterio de hecho:** la app se instala en el emulador y hace el flujo completo contra el backend.

## Fase 8 — preferencias, rasgos e historia en la tarjeta

Pedida después de la fase 7. Toca también backend y web (ramas `feat/dog-traits`).

1. Backend: enum `DogTrait` (active, calm, affectionate, good with kids, good with dogs, house-trained),
   `traits` en `Dog`, `DogRequest` y `DogResponse`; rasgos rellenados en los perros existentes.
2. Web: casillas "Personality" en el formulario de admin y etiquetas en la ficha del perro.
3. App: pantalla de preferencias la primera vez (tamaño, edad, sexo, casa, personalidad), editable desde Discover.
   Las preferencias **ordenan** la pila (no filtran) y marcan "great match".
4. App: rasgos en la tarjeta y botón "i" que despliega la historia sobre la foto sin salir de Discover.

**Criterio de hecho:** al entrar por primera vez sale la pantalla de preferencias; los perros que mejor encajan salen
primero; la historia se lee desde la tarjeta y el swipe sigue funcionando.

## Fase 9 — rediseño (Claude Design)

Diseño "Shire of Paws mobile redesign" de Claude Design. Toca también backend y web (ramas `feat/dog-photos`).

1. Backend y web: `extraPhotoUrls` (hasta 2 fotos más por perro), subida y borrado en el admin, galería en la ficha.
2. App: cabeceras con "THE SHIRE OF PAWS", pestañas en píldora con punto rojo si hay matches nuevos.
3. Discover: tarjeta a sangre con galería (barritas, tap izquierda/derecha), sellos "ADOPT ME" / "NOT NOW",
   botones deshacer / pasar / like / info, botón "filters" con el número de preferencias (sin filtros duros).
4. Preferencias en hoja con "reset" y "show me dogs · N great matches".
5. Perfil en hoja (desde Discover y Matches) con datos, personalidad, historia y refugio; "not now" / "I'd love to meet",
   "request adoption" si ya hay match. La ruta /dog/:id muestra lo mismo como página.
6. Match: "IT'S A MATCH", "{name} wants to meet you too", "request adoption" / "keep discovering" / "see my matches".
7. Matches: fila "new" con anillos, tarjetas con "say hi" / "contact" / "view", "{n} dogs" en la cabecera.

**Criterio de hecho:** la app se ve como el diseño y el flujo like → match → solicitud sigue funcionando.
