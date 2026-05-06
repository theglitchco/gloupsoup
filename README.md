# Gloup Soup

The current Gloup Soup website source for the GitHub Pages site at `https://gloupsoup.com/`.

## Stack

- Vite
- React
- static GitHub Pages deploy to `gh-pages`

## Local development

```sh
npm install
npm run dev
```

## Build

```sh
npm run build
```

## Deploy

GitHub Pages is configured to serve from the `gh-pages` branch with the custom domain `gloupsoup.com`.

To publish the current build:

```sh
npm run deploy
```

The deploy flow builds `dist/` and publishes it to `gh-pages`. The custom domain is preserved via `public/CNAME`.

## Content locations

- Main page structure and copy: `src/App.jsx`
- Current incubator and previous volumes data: `src/data/incubators.js`
- Trailer player: `src/components/TrailerPlayer.jsx`
- Animated logo treatment: `src/components/DitherLogo.jsx`
- Layout and spacing: `src/styles.css`

## Visual implementation notes

- The hero logo is rendered through a canvas dither pass in `src/components/DitherLogo.jsx`.
- The SVG source is normalized from its `viewBox` before animation so Chrome matches Firefox and Safari sizing.
- Hero spacing, logo staging, and large-screen logo scaling are primarily controlled in `src/styles.css` via `.page`, `.logo-background`, `.logo-stage`, and the responsive media queries.
- The site background is intentionally flat `#050505` to match the dither field behind the logo.
- The footer copy and current year are rendered in `src/App.jsx` and styled in `src/styles.css`.
- The logo click interaction, comet motion, capped comet pool, and click-driven logo shrink all live in `src/components/DitherLogo.jsx`.
- The page wrapper intentionally uses pointer-event layering so the logo stays visually behind the hero while remaining clickable in open space.

## Search indexing

The site includes:

- canonical URL metadata
- `robots` index/follow metadata
- Open Graph metadata
- JSON-LD website metadata
- `public/robots.txt`
- `public/sitemap.xml`

## Notes

- `gloup-soup-v1/` is local handover/reference material only and is ignored from git.
- Avoid committing secrets, tokens, `.env` files, or private media not meant for publication.
- Current deployment should match the latest pushed `main` commit after the final comet/background pass.
