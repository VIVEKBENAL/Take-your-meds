# Take Your Meds

A phone-first medicine reminder app. Everything — your courses, medicines, dose
history, alarm sound and all settings — is stored on your own device in the
browser. Nothing is uploaded anywhere. There is no server, no account, no
database, and no API key involved. It works offline once loaded.

## Run it locally

You need Node.js 20+ (or Bun). Then, from this folder:

```sh
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:8080`) on your phone or in a
browser.

Prefer Bun? `bun install` then `bun run dev` works too — `bun.lock` is included.

## Use it on your phone

1. Start the dev server on your computer.
2. Open the app's address from your phone's browser (same Wi-Fi), or deploy the
   build anywhere you like.
3. Use the browser's **Add to Home Screen** to install it as an app.

## Things to know

- Alarms and the alert sound only fire while the app is open. Background
  notifications are best-effort: a web app cannot guarantee an alarm when it is
  fully closed.
- Your data lives in that browser's local storage. Clearing site data, using a
  different browser, or using private/incognito mode loses it. Use
  **Settings → Export** before switching devices, and **Import** to restore.
- **Settings → Load demo** fills the app with a sample regimen so you can try it
  immediately. **Settings → Wipe data** clears everything.

## Other commands

```sh
npm run build     # production build
npm run preview   # serve the production build locally
npm test          # unit tests
npm run lint      # eslint
```

## Layout

- `src/lib/meds.ts` — data model, local storage, schedules, import/export
- `src/components/Alarm.tsx` — dose checking, alarm sound, notifications
- `src/components/Shell.tsx` — bottom navigation and page frame
- `src/routes/index.tsx` — Today
- `src/routes/courses.tsx` — courses and medicines
- `src/routes/history.tsx` — dose log and streaks
- `src/routes/settings.tsx` — sound, notifications, backup, demo data

Built with TanStack Start, React, TypeScript and Tailwind CSS.
