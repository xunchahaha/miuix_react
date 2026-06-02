# Miuix React

Electron + React + TypeScript rewrite of the original Compose Multiplatform Miuix project.

The original Kotlin sources remain the design and behavior reference. This project maps the library into a React renderer that can be used directly by Electron applications.

## Run

```bash
npm install
npm run dev
```

Open `http://127.0.0.1:5173` for the browser renderer.

```bash
npm run electron:dev
```

Runs the same React app inside an Electron window.

## Validate

```bash
npm run build
npm run lint
npm run port:check
```

## Port Map

| Compose module | React path | Status |
| --- | --- | --- |
| `miuix-ui/theme` | `src/miuix/theme.tsx` | Light/dark color schemes and text styles ported as tokens and CSS variables |
| `miuix-ui/basic` | `src/miuix/components.tsx` | Core controls, app bars, navigation, sliders, text fields, cards, progress, popup primitives |
| `miuix-ui/overlay` | `src/miuix/components.tsx` | Dialog, bottom sheet, list popup aliases implemented with React portals |
| `miuix-ui/window` | `src/miuix/components.tsx` | Window variants alias to Electron-safe renderer components |
| `miuix-preference/preference` | `src/miuix/components.tsx` | Preference row variants and controlled end actions |
| `miuix-preference/menu` | `src/miuix/components.tsx` | Dropdown and icon dropdown menu aliases |
| `example` | `src/App.tsx` | Interactive demo shell covering the React port surface |
| desktop runtime | `electron/` | Electron main and preload process |

For a detailed API-by-API migration ledger, see `src/miuix/port-status.ts`.
Run `npm run port:check` to scan the upstream Kotlin modules and emit `reports/port-coverage.json`.
The current name-coverage audit reaches all scanned upstream Kotlin API names; remaining quality work is tracked by the `ported` versus `facade` distinction.
Entries are marked as:

- `ported`: implemented as a React/Electron component or utility.
- `facade`: import-compatible React surface exists, while deeper Compose-only behavior can still be refined.
- `planned`: intentionally tracked but not implemented yet.

## Notes

The API keeps recognizable Miuix names where React semantics allow it. Compose-only concepts such as `Modifier`, composition locals, haptics, platform source sets, and Skiko rendering are represented as React props, context, CSS variables, portals, and browser/Electron events.
