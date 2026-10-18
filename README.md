# Farmily — Live demos

Quick access to the hosted previews:

- **Production** — [Open Farmily app](https://farmily-sg.vercel.app)
- **Development** — [Open Farmily dev](https://farmily-git-dev-reldhas.vercel.app)

[![Production](https://img.shields.io/badge/Production-Open%20Farmily%20App-brightgreen)](https://farmily-sg.vercel.app) [![Development](https://img.shields.io/badge/Development-Open%20Farmily%20Dev-yellow)](https://farmily-git-dev-reldhas.vercel.app)

# Farmily local prototype

React + TypeScript + Vite reconstruction of the mobile screens visible in [Farmily — UI](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=189-476).

## Run

Use Node.js 22.12+ (or 24 LTS). From this folder:

```sh
npm install
npm run dev
```

Open the localhost address printed by Vite. `npm run build` checks TypeScript and creates `dist/`; `npm run preview` serves the production build.

Build `dist/` with `npm run build` before previewing. On this computer, `Preview.ps1` uses the bundled Node runtime when available, so you can run the prototype without changing your installed Node version.

## Flow and behaviour

Use **Try with sample photo** to explore the complete flow without uploading an image. Add product → product details → story → review → packaging → packaging preview → save → listing.

Fields, uploads (JPG/PNG/WebP up to 2 MB), ingredient confirmation, original/enhanced story selection, favourites, packaging styles, label download, draft saving and local publishing work. Drafts are stored locally for the prototype.

## Design interpretation

The supplied node opens a group of mobile flow screens, including alternate states. The prototype follows the 402 px mobile composition with an ivory background, green text/buttons, gold AI controls, and other visual choices that mirror the Figma mockups.

The review/packaging screens literally show **Step title**, and the source skips step 4; these are preserved. The details mockup contains Dairy/Goat Milk next to tomato imagery. The prototype uses the provided assets with a few pragmatic substitutions where the original file set omitted variants.

No desktop frame or responsive constraints were exposed. On wide screens the mobile composition stays centred; small screens use the available width. There is no horizontal scrolling at 320 px.

## Verification

TypeScript passed. The production assets were built with Vite using a temporary Babel transform because this environment blocks Vite's esbuild subprocess. The shipped Vite configuration remains standard for local development.

The prototype source is maintained in the Farmily repository. Publishing inside the app remains a local demonstration.
