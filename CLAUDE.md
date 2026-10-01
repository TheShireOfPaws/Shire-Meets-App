# Shire Match — contexto del proyecto

App móvil tipo Tinder para adoptar perros de **The Shire of Paws**. Ionic React + Capacitor.
Consume el backend Spring Boot existente (repo `TheShireOfPaws-Backend`). La web (`TheShireOfPaws-Frontend`) es React + Vite y NO se toca.

## Stack (no cambiar sin preguntar)
- Ionic React 8 + `@ionic/react-router` → **React 18** y **react-router v5** (Ionic aún no usa v6/v7)
- Vite, JavaScript (JSX, no TypeScript), igual que la web
- axios para HTTP, `@capacitor/preferences` para guardar datos en el dispositivo
- `setupIonicReact({ mode: 'ios' })` para que se vea igual en Android e iOS
- Gestos de swipe con `createGesture` de `@ionic/react` (sin librerías extra de swipe)

## Backend: lo que usa la app
URL base en `.env` → `VITE_API_URL` (local: `http://localhost:8080`).

| Método | Endpoint | Auth | Uso |
|---|---|---|---|
| GET | `/api/dogs/filter?status=AVAILABLE&page=0&pageSize=20&size=&gender=` | pública | pila de tarjetas |
| GET | `/api/dogs/{id}` | pública | perfil y refrescar matches |
| POST | `/api/adoption-requests` | pública | solicitud de adopción |

Las listas devuelven un `Page` de Spring: `{ content: [...], last: boolean, number, totalElements }`. `pageSize` máximo 50.

**DogResponse**: `id (UUID), name, story, gender, age, size, photoUrl (URL absoluta de Cloudinary o null), extraPhotoUrls (hasta 2 fotos más, en orden), status, adoptedBy, traits (array de DogTrait, ordenado; puede faltar en backends antiguos), adoptionRequestsCount, createdAt, updatedAt`

**AdoptionRequestRequest** (validaciones del backend, replicarlas en el cliente):
- `requesterFirstName`, `requesterLastName`: obligatorios, 2–50 caracteres
- `requesterEmail`: obligatorio, email válido
- `housingType`: obligatorio, `HOUSE | APARTMENT | OTHER`
- `householdSize`: obligatorio, entero 1–20
- `motivation`: obligatorio, 50–2000 caracteres
- `daytimeLocation`: opcional, máx. 1000
- `dogId`: UUID obligatorio

**Enums**: `DogStatus AVAILABLE | IN_PROCESS | ADOPTED` · `DogSize SMALL | MEDIUM | LARGE | EXTRA_LARGE` · `DogGender MALE | FEMALE | UNKNOWN` · `DogTrait ACTIVE | CALM | AFFECTIONATE | GOOD_WITH_KIDS | GOOD_WITH_DOGS | HOUSE_TRAINED`

**Errores** (`GlobalExceptionHandler`): `{ status, error, message, path, details: ["campo: mensaje", ...] }`. Mostrar `details` si existe, si no `message`.

No hay cuentas de usuario público: los likes, passes y datos del adoptante se guardan en local con Preferences.
Las preferencias del adoptante (tamaños, edades, sexo, casa, rasgos) también son locales: ordenan la pila, no la filtran.

## Diseño
Colores y fuente de la web (`src/styles/variables.css` del frontend):
- crema `#FAF6F2` (fondo) · verde `#114C2A` (primario) · dorado `#B8860B` (secundario) · marrón `#382903` (texto)
- Fuente **Fredoka** (Google Fonts)
- Las tarjetas alternan dorado / verde / marrón como las `DogCard` de la web
- Textos de la interfaz siempre en **inglés**, tono cercano, frases cortas, sin mayúsculas en etiquetas (los comentarios del código siguen en español)
- Diseño: rediseño de Claude Design (fase 9). Excepción: los sellos del swipe van en mayúsculas ("ADOPT ME" / "NOT NOW")
- Respetar `prefers-reduced-motion`, foco visible, `aria-label` en botones solo con icono

## Estructura objetivo
```
src/
  App.jsx  main.jsx  theme.css
  services/  api.js  dogService.js  adoptionService.js
  store/     SwipeContext.jsx (provider + persistencia)  swipeState.js (transiciones puras)
  hooks/     useDogDeck.js  useRefreshMatches.js
  utils/     labels.js  dog.js  matching.js  adoptionForm.js
  components/ SwipeCard  DeckActions  FiltersButton  MatchModal  MatchRow  NewMatchesRow
              AdoptionForm  DogDetail  DogDetailActions  PhotoCarousel  DogSheet  PageHeader  PillGroup  PreferencesModal
  pages/     Discover  Matches  DogProfile
```

## Reglas de trabajo
- Trabajamos **por fases** (ver `FASES.md`). Haz solo la fase que te pida.
- Antes de escribir código, dame un plan corto de la fase (archivos que vas a crear o tocar).
- Al terminar: `npm run build` sin errores, dime cómo probarlo y **para** hasta que yo lo revise.
- No instales dependencias que no estén en este documento sin preguntarme.
- No toques el backend ni la web salvo lo pedido: CORS (fase 0) y rasgos de personalidad (fase 8, ramas `feat/dog-traits`) y fotos extra (fase 9, ramas `feat/dog-photos`).
- Comentarios en el código en español, cortos y solo donde aporten.
- Un commit por fase con mensaje `feat(fase-N): ...`.
