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
- The trailer now points at `public/media/incubator-trailer-v2.mp4`; `src/components/TrailerPlayer.jsx` is the swap point if a newer cut arrives.
- `src/components/DitherLogo.jsx` now normalizes the SVG from its `viewBox` before drawing, which fixes the previous Chrome-only overscale and crop bug.
- Desktop hero spacing is intentionally tight, while tablet and phone top padding is larger to keep the stacked layout clear of the logo.
- There is an additional wide-desktop tuning path in `src/styles.css` for larger monitors so the logo can scale up without the hero heading colliding with the current-volume panel.
- The footer is centered and rendered as: `made in hackney wick, london, ooze from theglitch.co, {currentYear}`.
- The logo has a click-triggered comet system with a maximum live pool of 10, replacement explosions, a capped click-driven logo shrink, and a calmer orbital depth model intended to feel 3D without comets rushing the camera.
- The logo layer is visually behind the content, but the page uses pointer-event passthrough in non-interactive space so the logo can still be clicked around the hero content.
- The visible logo stage is intentionally modest in size, while the hidden internal canvas is much larger to give the comet system room before it hits drawable edges.
- The hero panel heading `VOLUME X SOON` has a subtle pulse on the `X`.
- The final `Have fun.` ethos line is intentionally animated with a toned-down fast jitter.
- The `Previous Incubators` accordion is now a richer archive with per-volume colour accents, real volume metadata, film lists, and compact poster previews.
- Film titles marked as uncertain use a small animated `?`.
- Director names in archive film lists brighten, scale, and wiggle on hover based on how many films that person directed across the archive.
- The main logo stage has been scaled up by roughly 10% across breakpoints, with matching mobile/tablet top-padding adjustments so the layout still clears cleanly.

## Files to edit most often

- `src/App.jsx`
  Hero text, overview, ethos, section ordering, archive rendering, and page copy. The live Overview copy currently mirrors `public/media/overview.rtf`.
- `src/data/incubators.js`
  Current incubator details, previous incubator entries, archive metadata, poster mappings, and per-volume accent colours. Archive descriptions were last refreshed from the Google Sheet metadata tab, not the film-list tab.
- `src/components/TrailerPlayer.jsx`
  Trailer behavior and poster handling.
- `src/components/DitherLogo.jsx`
  Logo animation, SVG normalization, dither rendering, comet interaction/orbit system, and click-driven shrink behavior.
- `src/styles.css`
  Layout, responsive spacing, background/logo layering, archive styling, hover interactions, pointer-event passthrough, footer styling, and visual tweaks.

## Public assets

- trailer videos:
  `public/media/incubator-trailer-v1.mp4`
  `public/media/incubator-trailer-v2.mp4`
- overview source copy:
  `public/media/overview.rtf`
- archive posters:
  `public/poster-vol1-workshop.jpeg`
  `public/poster-vol4-screening.png`
  `public/poster-vol6-workshop.jpg`
  `public/poster-vol6-screening.jpg`
  `public/poster-vol7-screening.jpg`
  `public/poster-vol8-workshop.png`
  `public/poster-vol8-screening.jpeg`
  `public/poster-vol9-workshop.png`
  `public/poster-vol9-screening.jpg`
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
- The Google Sheet URL should not be embedded in client code; the current archive data has been copied into local source files and poster assets downloaded into `public/`.
- Latest local state at handoff includes the archive redesign, imported volume metadata, local poster assets, director hover tuning, hero/ethos text animations, the v2 trailer swap, the refreshed overview copy from `public/media/overview.rtf`, archive description updates copied from the sheet metadata tab, and a synced archive poster/title refresh from the Google Sheet.
