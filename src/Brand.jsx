import { ICON_PATHS, ICON_BOX, WORDMARK_PATHS } from "./brandArt.js";

/* Official The Foursquare Church artwork (from the 2024 brand guide). Colours come from CSS variables
   so the logo uses the official colours in light mode and the official one-colour version in dark mode. */
const ORDER = ["cross", "dove", "cup", "crown"];

/** One symbol (cross, dove, cup or crown), single colour, sized so its longest side is `size`. */
export function Symbol({ name, size = 28 }) {
  const [x0, y0, x1, y1] = ICON_BOX[name];
  const w = x1 - x0, h = y1 - y0, pad = 0.5, k = size / Math.max(w, h);
  return (
    <svg viewBox={`${x0 - pad} ${y0 - pad} ${w + 2 * pad} ${h + 2 * pad}`} width={(w + 2 * pad) * k} height={(h + 2 * pad) * k} fill="currentColor" aria-hidden="true">
      <path d={ICON_PATHS[name]} />
    </svg>
  );
}

/** The four symbols in a row, in official colours. */
export function IconRow({ height = 20 }) {
  return (
    <svg className="icon-row" viewBox="1 2 134 28" height={height} width={(height * 134) / 28} aria-hidden="true">
      {ORDER.map((n) => <path key={n} className={`ic-${n}`} d={ICON_PATHS[n]} />)}
    </svg>
  );
}

/** Full logo: four symbols above "THE FOURSQUARE CHURCH". */
export function Logo({ width = 240, mono = false }) {
  return (
    <svg className={`logo${mono ? " mono" : ""}`} viewBox="-101 1 338 67" width={width} height={(width * 67) / 338} role="img" aria-label="The Foursquare Church">
      {ORDER.map((n) => <path key={n} className={mono ? undefined : `ic-${n}`} fill={mono ? "currentColor" : undefined} d={ICON_PATHS[n]} />)}
      <g fill="currentColor">{WORDMARK_PATHS.map((d, i) => <path key={i} d={d} />)}</g>
    </svg>
  );
}
