# Shire Match

A Tinder-style mobile app for adopting dogs from **The Shire of Paws**.
Swipe right on the dogs you like, get a match, and send the shelter an adoption request straight from your phone.

Built with **Ionic React 8 + Capacitor 8** (React 18, Vite, JavaScript). It talks to the existing Spring Boot backend
([`TheShireOfPaws-Backend`](../TheShireOfPaws-Backend)). The admin panel stays on the web
([`TheShireOfPaws-Frontend`](../TheShireOfPaws-Frontend)).

## What it does

- **Discover:** a stack of available dogs. Swipe or use the buttons to like or pass, undo the last one, and filter by size and gender.
- **Match:** every like opens an "It's a match!" screen with a shortcut to request the adoption.
- **Dog profile:** photo, details and story. Add or remove the dog from your matches and send an adoption request.
- **Adoption form:** same validations as the backend. It remembers your details for the next request.
- **Matches:** your liked dogs, newest first. Each one shows "request sent" or its current status (adopted, in process). Pull to refresh; swipe left to remove.

There are no user accounts: likes, passes and your adopter details are stored on the device (`@capacitor/preferences`).

## Requirements

- Node.js 20+ and npm
- The backend running (locally or on Render)
- For Android: Android Studio (or the Android SDK) and **JDK 21**
- For iOS: a Mac with Xcode

## Run it in the browser

```bash
npm install
cp .env.example .env      # set VITE_API_URL (see below)
npm run dev               # http://localhost:8100
```

Use the mobile view of the DevTools (`Ctrl+Shift+M`) to see it at phone size and drag cards with the mouse.

## Backend URL (`VITE_API_URL`)

Vite bakes the value into the build (`npm run build`), so **the `.env` you build with decides which backend the app calls**:

| Where the app runs | `VITE_API_URL` |
|---|---|
| Browser (`npm run dev`) | `http://localhost:8080` |
| Phone over USB, local backend | `http://localhost:8080` + `adb reverse tcp:8080 tcp:8080` |
| Android emulator, local backend | `http://10.0.2.2:8080` (the emulator's name for your PC's localhost) |
| Any device, production | `https://theshireofpaws-backend.onrender.com` |

Android blocks plain `http` by default. The debug build allows it **only** for `localhost`, `127.0.0.1` and `10.0.2.2`
(see [Debug-only cleartext](#debug-only-cleartext)). Release builds only talk to `https`.

## Backend change: CORS

The app sends requests from these origins, so the backend has to allow them in `app.cors.allowed-origins`
(`src/main/resources/application.properties`):

```properties
app.cors.allowed-origins=...,http://localhost:8100,capacitor://localhost,https://localhost
```

- `http://localhost:8100`: the dev server
- `https://localhost`: the Android app
- `capacitor://localhost`: the iOS app

That change lives on the backend branch `feat/cors-mobile-app`. The Render deployment needs it merged and redeployed
before the installed app can use production.

## Android

### First time

```bash
npm run build
npx cap add android            # creates android/ (ignored by git)
npx capacitor-assets generate --android \
  --iconBackgroundColor '#114C2A' --iconBackgroundColorDark '#114C2A' \
  --splashBackgroundColor '#FAF6F2' --splashBackgroundColorDark '#114C2A'
```

Then add the [debug-only cleartext](#debug-only-cleartext) files. They live inside `android/`, which is not committed.

### Every change

```bash
npm run build && npx cap sync
```

Then run it from Android Studio (`npx cap open android`) or from the terminal:

```bash
cd android
./gradlew assembleDebug                                   # app/build/outputs/apk/debug/app-debug.apk
adb install -r app/build/outputs/apk/debug/app-debug.apk
```

### On a phone over USB

1. On the phone: enable **Developer options → USB debugging** and accept the prompt when you plug it in.
2. `adb devices` should list it as `device`.
3. With the backend running on your PC: `adb reverse tcp:8080 tcp:8080` (repeat it after reconnecting the cable).
4. Install the APK as above and open **Shire Match**.

### Debug-only cleartext

`android/app/src/debug/res/xml/network_security_config.xml`:

```xml
<?xml version="1.0" encoding="utf-8"?>
<network-security-config>
    <domain-config cleartextTrafficPermitted="true">
        <domain includeSubdomains="false">localhost</domain>
        <domain includeSubdomains="false">127.0.0.1</domain>
        <domain includeSubdomains="false">10.0.2.2</domain>
    </domain-config>
</network-security-config>
```

`android/app/src/debug/AndroidManifest.xml` (merged only into debug builds):

```xml
<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android">
    <application android:networkSecurityConfig="@xml/network_security_config" />
</manifest>
```

### Status bar

The status bar is green (`#114C2A`) with light icons.

- **Android 15 and later:** apps are drawn edge-to-edge, and the bar's own background colour is ignored. A green strip is painted behind it from `src/theme.css` (`ion-app::after`), using the safe-area insets that Capacitor injects.
- **Older versions:** `@capacitor/status-bar` sets the colour (`capacitor.config.json`).

## iOS

You need a Mac with Xcode, and CocoaPods or Swift Package Manager.

```bash
npm install @capacitor/ios@8
npm run build
npx cap add ios
npx capacitor-assets generate --ios
npx cap open ios            # run it from Xcode
```

After each change: `npm run build && npx cap sync`. In the simulator the Mac's `localhost` works as is.
On a real iPhone, use the Render URL or your Mac's LAN IP.

## Project structure

```
src/
  App.jsx  main.jsx  theme.css
  services/    api.js  dogService.js  adoptionService.js
  store/       SwipeContext.jsx      # likes, passes and adopter profile (Preferences)
  utils/       labels.js             # labels, card colours, image placeholder
  components/  SwipeCard  MatchModal  AdoptionForm  FilterSheet
  pages/       Discover  Matches  DogProfile
assets/        # icon and splash sources (SVG + PNG) for @capacitor/assets
```
