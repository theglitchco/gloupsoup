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
- The trailer now points at `public/media/incubator-trailer-v2.mp4`; `src/components/TrailerPlayer.jsx` is the swap point if a newer cut arrives. The current v2 trailer has been transcoded to 720p H.264 with `+faststart` for broader browser support and more reliable scrubbing.
- `src/components/DitherLogo.jsx` now normalizes the SVG from its `viewBox` before drawing, which fixes the previous Chrome-only overscale and crop bug.
- Desktop hero spacing is intentionally tight, while tablet and phone top padding is larger to keep the stacked layout clear of the logo.
- There is an additional wide-desktop tuning path in `src/styles.css` for larger monitors so the logo can scale up without the hero heading colliding with the current-volume panel.
- The footer is centered and rendered with a credits link and fixed year range: `credits / made in hackney wick, london, ooze from theglitch.co, 2025-2026`.
- The logo has a click-triggered comet system with a maximum live pool of 10, replacement explosions, a capped click-driven logo shrink, and a calmer orbital depth model intended to feel 3D without comets rushing the camera.
- The logo layer is visually behind the content, but the page uses pointer-event passthrough in non-interactive space so the logo can still be clicked around the hero content.
- The visible logo stage is intentionally modest in size, while the hidden internal canvas is much larger to give the comet system room before it hits drawable edges.
- The hero panel now lists `OTHER PROJECTS`, currently `RETROWARZYWNIAK / BALL`, with Instagram and `contact@theglitch.co`.
- The final `Have fun.` ethos line is intentionally animated with a toned-down fast jitter.
- A compact unboxed animated stats strip sits after Overview/Ethos and before Previous Incubators. It derives volume, film, and runtime totals from `previousIncubators`; the effect is route-aware so it animates correctly after entering from `#/credits`.
- The `Previous Incubators` accordion is now a richer archive with per-volume colour accents, real volume metadata, film lists, and compact poster previews.
- Archive film titles with `watchLink` now open in the same lightbox overlay as posters when the link is a YouTube URL, rather than sending the user off-page.
- Film titles marked as uncertain use a small animated `?`.
- Director names in archive film lists brighten, scale, and wiggle on hover based on how many films that person directed across the archive. They are clickable and open the same film-credit modal used on the credits page.
- The `#/credits` route shows a randomized-on-load field of participant names. Hovering a name makes it pop with the same count-driven colour logic used in the archive, while nearby names softly repel and return.
- The main logo stage has been scaled up by roughly 10% across breakpoints, with matching mobile/tablet top-padding adjustments so the layout still clears cleanly.

## Files to edit most often

- `src/App.jsx`
  Hero text, overview, ethos, section ordering, archive rendering, credits route, shared credit modal, route-aware stats animation, and page copy.
- `src/data/incubators.js`
  Contact details, ongoing project names, previous incubator entries, archive metadata, normalized poster mappings, and per-volume accent colours.
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
  poster assets live in `public/posters/` as normalized WebP pairs.
  Use `*-thumb.webp` for accordion thumbnails and hover previews, and `*-large.webp` for lightbox images.
  Add new posters through the `poster(name, label)` helper in `src/data/incubators.js`.
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
- Latest local state at handoff includes the archive redesign, Volume X STOREHOUSE archive import, normalized WebP poster pairs, shared credits modal, randomized credits page, director hover/click interactions, hero/ethos text animations, the v2 trailer swap with H.264 faststart transcode and less aggressive error fallback, refreshed overview copy, and route-aware stats animation.
