# AGENTS

## What this repo is
- Capacitor plugin exposing `MsAuthPlugin` with a shared TS API and three platform implementations: web (`@azure/msal-browser`), Android (MSAL Android), iOS (MSAL iOS).
- Primary fork behavior: `forceRefresh` is threaded from JS `login()` into native/web silent token acquisition.

## Architecture and data flow
- Public API is defined in `src/definitions.ts` (`login`, `logout`, `logoutAll`) and registered in `src/index.ts`.
- Web path (`src/web.ts`): `handleRedirectPromise()` -> silent token attempt -> interactive redirect fallback (`acquireTokenRedirect`).
- Android path (`android/src/main/java/nl/recognize/msauthplugin/MsAuthPlugin.java`): build runtime MSAL JSON config -> create `ISingleAccountPublicClientApplication` -> silent-first token flow -> interactive fallback.
- iOS path (`ios/Plugin/Plugin.swift`): create `MSALPublicClientApplication` -> resolve current account (multi-account aware) -> silent-first -> interactive fallback.
- `logoutAll` delegates to `logout` on web/Android, but signs out each account on iOS.

## Build, verify, and formatting workflow
- Install deps: `npm install` (root), plus CocoaPods for iOS when needed.
- Main build artifact flow: `npm run build` (`tsc` to `dist/esm`, then Rollup to `dist/plugin.js` + `dist/plugin.cjs.js`).
- iOS verification: `npm run verify:ios` (runs `pod install` and `xcodebuild` in `ios/`).
- Android verification: `npm run verify:android` (Gradle clean/build/test in `android/`).
- Formatting/lint gate used by pre-commit: `npm run precommit` (`fmt` + `lint` + `build`).

## Project-specific conventions to preserve
- Keep TS API and all platform adapters aligned when adding/removing options (update `definitions.ts`, `web.ts`, Android plugin, iOS plugin together).
- Keep Capacitor dependencies current and aligned across `@capacitor/core`, `@capacitor/android`, and `@capacitor/ios` in `package.json`; treat Capacitor major version bumps as coordinated changes requiring plugin verification on all platforms.
- Keep `README.md` in sync with any setup, API surface, platform behavior, or dependency changes so consumer integration guidance remains accurate.
- `prompt` values are string-mapped in both native plugins; keep parity with web behavior where possible.
- Android rejects missing `keyHash` (`MsAuthPlugin.java`); do not remove this requirement without updating README setup guidance.
- Web auth is redirect-based for interactive login; `login()` may not return tokens on first call after triggering redirect.
- iOS currently logs warning that `domainHint` is unsupported; avoid claiming feature parity unless implemented.

## Integration points and dependencies
- NPM runtime dependency: `@azure/msal-browser` (web implementation in `src/web.ts`).
- Android dependency: `com.microsoft.identity.client:msal` in `android/build.gradle`; includes required Microsoft Duo Maven feed.
- iOS dependency: `MSAL` pod in `DvsaCapacitorPluginMsauth.podspec` (deployment target iOS 15).
- Consumer app setup is required for URL schemes and platform manifest/plist entries; use `README.md` as source of truth.

## Contributor gotchas
- Android builds redirect URI using package name + URL-encoded key hash; auth fails if Azure app registration values do not match.
- Android writes temporary `auth_config.json` at runtime and deletes it after creating the MSAL app.
- Web logout clears local/session storage keys prefixed with `msal.` before redirect logout.
- If you change exported plugin surface, rebuild before publishing so `dist/` types and bundles stay in sync.
