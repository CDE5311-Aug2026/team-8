# Farmily local prototype

React + TypeScript + Vite reconstruction of the mobile screens visible in [Farmily — UI](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=189-476).

## Run

Use Node.js 22.12+ (or 24 LTS). From this folder:

```sh
npm install
npm run dev
```

Open the localhost address printed by Vite. `npm run build` checks TypeScript and creates `dist/`; `npm run preview` serves the production build.

The included `dist/` is ready to preview. On this computer, `Preview.ps1` uses the bundled Node runtime when available, so you can run the prototype without changing your installed Node version.

## Flow and behaviour

Use **Try with sample photo** to explore the complete flow without uploading an image. Add product → product details → story → review → packaging → packaging preview → save → listing → catalogue.

Fields, uploads (JPG/PNG/WebP up to 2 MB), ingredient confirmation, original/enhanced story selection, favourites, packaging styles, label download, draft saving and local publishing work. Drafts are stored under `farmily-draft` in this browser's local storage when saved. No backend or external publishing is connected. AI scanning, text suggestions, photo enhancement and packaging generation are local demonstrations, not real AI services. Uploading an image does not detect its content automatically.

## Design interpretation

The supplied node opens a group of mobile flow screens, including alternate states. The prototype follows the 402 px mobile composition with an ivory background, green text/buttons, gold AI controls, rounded white cards, and the text visible in the design. Bree Serif and Lato are bundled approximations of the visible typography; exact layer styles were unavailable in the guest Figma viewer. Photos are cropped from the visible Figma canvas, not original-resolution exports.

The review/packaging screens literally show **Step title**, and the source skips step 4; these are preserved. The details mockup contains Dairy/Goat Milk next to tomato imagery. The prototype uses the Heirloom Tomatoes content from the review and listing screens for consistency.

No desktop frame or responsive constraints were exposed. On wide screens the mobile composition stays centred; small screens use the available width. There is no horizontal scrolling at 320 px.

## Verification

TypeScript passed. The production assets were built with Vite using a temporary Babel transform because this environment blocks Vite's esbuild subprocess. The shipped Vite configuration remains standard. The browser walkthrough covers the sample flow, details confirmation, story editing, review, packaging, saving and local publishing. Assets and fonts are bundled for offline use after installation/build.

The prototype source is maintained in the Farmily repository. Publishing inside the app remains a local demonstration.
