# Beverly Boulevard Foursquare Church website

React + Vite site for Beverly Boulevard Foursquare Church (Montebello, CA), hosted on Base44.

- **Brand:** official colors, fonts (Spectral, Manrope) and logo artwork from The Foursquare Church 2024 brand guide (`src/Brand.jsx`, `src/brandArt.js`).
- **Light and dark mode:** follows the visitor's device, with a toggle in the header.
- **Content:** sermons, events and team come from Base44 (`base44/entities`), with built-in fallback content in `src/data.js` so the site never looks empty.
- **Forms:** contact and prayer requests save to Base44 (readable by admins only).
- **Staff page:** `#/admin`, for signed-in admins to manage content.

```
npm install
npm run dev     # local preview
npm run build   # production build in dist/
```

Base44 app ID: `6acc071ecc184f151157af6d`
