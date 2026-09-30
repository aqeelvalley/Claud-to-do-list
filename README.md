# LifeList (Valley Isle)

Your life and work shown as a living island. Tasks, crew, goals, budget, health and habits each become buildings that grow as you use them.

One codebase produces two things:

| | What | Built by |
|---|---|---|
| **Web artifact** | `dist/valley-isle.html`, the claude.ai artifact (shared db, runs in the browser) | `./build.sh` |
| **iPhone app** | `www/` + `ios/`, the LifeList iOS app (all data on the phone, works offline) | `npm run build:app` |

## Layout
- `src/app.js`: the React app (UI, data, tools)
- `src/world/*.js`: the island engine (plan, town generator, sprites, sim)
  - `gl.js`: the WebGL renderer
  - `view.js`: the map (Canvas 2D fallback)
- `src/interior.js`, `src/styles.css`, `src/head.html`
- `app/platform.js`: the phone side. It provides the same `window.claude.use("db" | "user" | "downloads")` the artifact gets from claude.ai, backed by an on-device JSON store and the share sheet. It also provides `window.LLPlatform`, which covers Apple Health (read-only), notifications and haptics.
- `ios/`: the Capacitor Xcode project
  - `ios/App/App/LLHealthPlugin.swift`: HealthKit reads; it never writes
- `scripts/build-app.mjs`: builds `www/` with React and fonts bundled locally (no network needed)

## Build
```bash
npm install
./build.sh            # web artifact -> dist/valley-isle.html
npm run build:app     # iPhone web bundle -> www/
npx cap sync ios      # copy www/ into the Xcode project
```

## iPhone app: no Mac needed
GitHub Actions (`.github/workflows/ios.yml`) builds the app on GitHub's Macs.

- **Every push:** builds for the iOS Simulator and uploads `LifeList-simulator.zip` under the run's *Artifacts*. This proves the app compiles. It needs no Apple account.
- **Every push, for your own iPhone:** also builds `LifeList.ipa` (the *LifeList-ipa* artifact). Install it with Sideloadly using a free Apple ID. See "Install with Sideloadly" below.
- **TestFlight:** needs an Apple Developer account ($99/year). Once you have one:
  1. In App Store Connect, create the app with the bundle id `app.lifelist.island` (or change `appId` in `capacitor.config.json` and `PRODUCT_BUNDLE_IDENTIFIER` in the Xcode project first).
  2. In App Store Connect › Users and Access › Integrations, create an API key with the *App Manager* role. Download the `.p8` file.
  3. In GitHub › Settings › Secrets and variables › Actions, add these secrets:
     - `ASC_KEY_ID`: the key's ID
     - `ASC_ISSUER_ID`: the issuer ID shown above the keys
     - `ASC_KEY_P8`: the full text of the `.p8` file
     - `APPLE_TEAM_ID`: your 10-character team ID (Membership page)
  4. Run the workflow from the Actions tab with **Upload to TestFlight** ticked (or push to `main`). Signing is automatic. The build appears in TestFlight about 10–20 minutes later, and you can install it with the TestFlight app on your iPhone.

### Install with Sideloadly (free Apple ID, no Mac)
1. Download the file.
   - On GitHub, open **Actions → LifeList iOS** and pick the latest green run.
   - Under *Artifacts*, download **LifeList-ipa**.
   - Unzip it to get `LifeList.ipa`.
2. Set up your computer.
   - Install **Sideloadly** from sideloadly.io.
   - On Windows, also install iTunes and iCloud, using the versions from apple.com rather than the Microsoft Store.
3. Connect your iPhone with a cable, tap **Trust**, and open Sideloadly.
4. Drag `LifeList.ipa` into Sideloadly, enter your Apple ID and press **Start**.
5. On the iPhone:
   - Go to Settings → General → VPN & Device Management → your Apple ID → **Trust**.
   - On iOS 16 or later, also turn on Settings → Privacy & Security → **Developer Mode** (the phone restarts).
6. A free Apple ID install lasts **7 days**. Re-install from Sideloadly to renew; your island data is kept.

Apple Health needs the paid account's HealthKit permission, so it may not connect in a Sideloadly install. Everything else works: the island, tasks, reminders, vibration and backups.

### Moving your island from the artifact to the app
1. In the artifact, open Settings (tap the island crest) and choose **Download backup**.
2. In the app, open Settings and choose **Restore from a file…**.

Everything comes across: tasks, crew, goals, budget, health and the layout.

### App Store checklist
- App icon: `assets/icon.svg`, rendered into `ios/App/App/Assets.xcassets`
- Privacy manifest: `ios/App/App/PrivacyInfo.xcprivacy` (no tracking, nothing collected)
- Health usage string: in `Info.plist`, read-only
- Privacy policy: `PRIVACY.md`. App Store Connect needs it at a public URL, for example through GitHub Pages.
- App Privacy answers: *Data Not Collected* (everything stays on the device)
