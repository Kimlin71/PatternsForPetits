# Petite Pattern Engine

A React and TypeScript technical proof of concept for explicitly supplied measurements and inspection-only reference geometry. The geometry domain is implemented independently from React.

## Run locally

- `npm install` installs dependencies.
- `npm run dev` starts the Vite development server.
- `npm test` runs the behavior and UI tests.
- `npm run typecheck` checks TypeScript types.
- `npm run build` creates the production bundle.

## Scope and safety

This app is not a validated physical measurement method, anthropometric standard, fit-verified system, production pattern, or print-scale artifact. Its example data is synthetic and marked `SYNTHETIC TEST DATA - NOT AN ANTHROPOMETRIC STANDARD`. Do not treat it as customer measurement guidance.

The prototype accepts explicit torso length in millimetres or centimetres and converts to canonical millimetres. Measurement state exists only in the browser session; the app has no backend or persistence. Reference geometry is labelled `REFERENCE GEOMETRY - NOT A PRODUCTION PATTERN`.
