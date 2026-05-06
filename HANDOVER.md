# Handover

## What this repo is

This repo contains the Gloup Soup v2 website published to GitHub Pages at `https://gloupsoup.com/`.

## Important branches

- `main`: source code
- `gh-pages`: built static site served by GitHub Pages

## Deploy process

1. Make changes on `main`
2. Run checks:

```sh
npm run lint
npm run build
```

3. Publish:

```sh
npm run deploy
```

That command pushes the built `dist/` folder to `gh-pages`.

## Current visual state

- The page background is intentionally flat black: `#050505`.
- The hero logo is canvas-rendered and dithered from `src/assets/gloup_blank_solo.svg`.
- `src/components/DitherLogo.jsx` now normalizes the SVG from its `viewBox` before drawing, which fixes the previous Chrome-only overscale and crop bug.
- Desktop hero spacing is intentionally tight, while tablet and phone top padding is larger to keep the stacked layout clear of the logo.
- There is an additional wide-desktop tuning path in `src/styles.css` for larger monitors so the logo can scale up without the hero heading colliding with the current-volume panel.
- The footer is centered and rendered as: `made in hackney wick, london, ooze from theglitch.co, {currentYear}`.
- The logo has a click-triggered comet system with a maximum live pool of 10, replacement explosions, depth-based scaling, and a capped click-driven logo shrink.
- The logo layer is visually behind the content, but the page uses pointer-event passthrough in non-interactive space so the logo can still be clicked around the hero content.

## Files to edit most often

- `src/App.jsx`
  Hero text, overview, ethos, section ordering, and page copy.
- `src/data/incubators.js`
  Current incubator details and previous incubator entries.
- `src/components/TrailerPlayer.jsx`
  Trailer behavior and poster handling.
- `src/components/DitherLogo.jsx`
  Logo animation, SVG normalization, dither rendering, comet interaction system, and click-driven shrink behavior.
- `src/styles.css`
  Layout, responsive spacing, background/logo layering, footer styling, and visual tweaks.

## Public assets

- trailer video: `public/media/incubator-trailer-v1.mp4`
- Pages domain file: `public/CNAME`
- indexing files: `public/robots.txt`, `public/sitemap.xml`

## SEO / indexability

The site is explicitly indexable via:

- canonical metadata in `index.html`
- robots metadata in `index.html`
- Open Graph metadata in `index.html`
- JSON-LD metadata in `index.html`
- `public/robots.txt`
- `public/sitemap.xml`

## Repo hygiene

- `gloup-soup-v1/` is handover/reference material only and should stay out of git.
- Do not commit credentials, auth tokens, `.env` files, or private operational notes.
- Keep the custom domain as `gloupsoup.com` unless explicitly instructed otherwise.
- Latest pushed and deployed `main` commit at handoff should include the final comet/background layering adjustments from this session.
