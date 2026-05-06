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

## Files to edit most often

- `src/App.jsx`
  Hero text, overview, ethos, section ordering, and page copy.
- `src/data/incubators.js`
  Current incubator details and previous incubator entries.
- `src/components/TrailerPlayer.jsx`
  Trailer behavior and poster handling.
- `src/components/DitherLogo.jsx`
  Logo animation and dither rendering.
- `src/styles.css`
  Layout, responsive spacing, and visual tweaks.

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
