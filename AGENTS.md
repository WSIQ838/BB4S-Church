# Base44 Dev Environment

## Project
React 19 + Vite 7 church website (Beverly Boulevard Foursquare Church). Data (sermons, events, team, prayer requests, messages) lives in Base44 entities defined in `base44/entities`. No secrets required.

## Setup
- `docker compose -f docker-compose.base44.yml up -d` starts the Vite dev server on host port 3000.
- Dependencies install on container startup via `npm install` (node_modules stored in a named volume).
- Source is bind-mounted at `/app`; edits hot-reload via Vite HMR.

## Verification
- Healthcheck: `GET /` on port 5173 inside the container.
- Confirm the served HTML includes `@vite/client` and `@react-refresh` scripts (dev server, not prebuilt).
- Hash-based routing (`#/about`, `#/ministries`, etc.) — no server-side routes needed.

## Notes
- `vite.config.js` uses `base: "./"` for GitHub Pages compatibility; works fine in dev.
- No `.env` files or external credentials needed.
