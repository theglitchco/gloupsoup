# Gloup Soup

Gloup Soup is an incubator for small films, loose ideas, experiments, and things that should probably not stay in drawers.

This repository contains the source for the current site at `https://gloupsoup.com/`.

Built with React and Vite. Published to GitHub Pages.

## What The Site Contains

- a hero section with the custom dithered Gloup logo canvas treatment
- current incubator information for the upcoming volume
- trailer / teaser support through `public/media/incubator-trailer-v1.mp4`
- overview and ethos copy
- a previous incubators archive with per-volume metadata, film listings, hover interactions, and poster previews

## Archive Data

The archive is maintained in `src/data/incubators.js`.

Each previous volume can now contain:

- theme title and period
- descriptive volume copy
- workshop date, screening date, runtime, and film count
- full film list with director credits
- muted per-volume accent colours for the accordion styling
- local poster references for volumes with poster artwork

Poster assets used by the archive live in `public/` as `poster-vol*.{png,jpg,jpeg}` so the production site does not rely on external Dropbox or Google Sheet URLs at runtime.

## Development

Install dependencies and run the dev server:

```sh
npm install
npm run dev
```

Run checks:

```sh
npm run lint
npm run build
```

Deploy to GitHub Pages:

```sh
npm run deploy
```

## Notes

- The Google Sheet used to assemble the archive should not be embedded in client code.
- Archive poster assets are intentionally stored locally in `public/`.
- The main site styles and most interaction tuning live in `src/styles.css`.
