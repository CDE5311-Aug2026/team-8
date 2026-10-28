# Live Demo
[Open Farmily app](https://farmily-sg.vercel.app)
# Farmily local prototype

React + TypeScript + Vite reconstruction of the mobile screens visible in [Farmily — UI](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=189-476).

## Run

Use Node.js 24 LTS. From this folder:

```sh
npm install
npm run dev
```

Open the localhost address printed by Vite. `npm run build` checks TypeScript and creates `dist/`; `npm run preview` serves the production build.

Build `dist/` with `npm run build` before previewing. On this computer, `Preview.ps1` uses the bundled Node runtime when available, so you can run the prototype without changing your installed Node version.

## Demo workspace (default)

The [finished farmer pages](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=919-1868) run entirely in the browser. No API server, database or secret key is needed. New guests and new accounts start empty; sign in with `farmer@example.com` / `123456` for the separate seeded sample workspace.

Home, Products, Orders and Profile use shared styles and components. The catalogue has three states: **Draft** (packaging incomplete), **Unpublished** (packaging complete) and **Published** (available on the local demo storefront). Product cards open Overview, Analytics and Packaging tabs. Products can be edited, resumed and published; changes persist across reloads.

Only published products populate deterministic simulated sales, customers, reviews and AI briefs. Period filters, CSV reports, promotions and suggested actions work locally. Suggestions distinguish analysis from setup progress. No analytics or customer records are represented as real.

Orders support New Order, Preparing, On the Way, Completed and Cancelled, including accepting/declining and advancing an order. Sample orders belong to the sample account; new workspaces have no orders. Order changes persist locally.

Profile supports editing farm details and optional address/photos, adding or editing saved brand identities, local account email/password changes, disconnecting and confirmed account/workspace deletion. Editing a brand updates the packaging of linked products while preserving their details and publication state.

Packaging has a 2D/3D viewer and three angle controls. Missing views are labelled demo renders. PDF, SVG and PNG downloads, plus a ZIP containing all three, are generated locally from the product's saved design and marked **demo / not print-ready**. No print dimensions or production artwork are implied.

Local signup transfers the guest workspace into a separate demo account. Sign-in and credential edits use salted browser-side password digests rather than clear-text passwords. This is browser-local prototype authentication, not a secure account service or cloud backup. The public sample credentials are for demonstrations only.

## Farmer onboarding and product flow

Farmer setup has three numbered steps with visible progress and previous/continue actions, followed by an optional account invitation. Story input is scaffolded into short sections. Setup can be deferred and resumed from Home. A saved brand identity is required before adding a product.

Branding and product creation are full-page processes with a save/discard exit dialog. Product details include searchable category, ingredient and allergen controls, removable chips, explicit Not applicable / Allergen-free declarations, SGD pricing and optional extra photos. A named unfinished product saved on exit appears as Draft; confirming its packaging makes it Unpublished. Publishing is a local demo action.

Photo scans fall back to editable manual details, and brand generation/refinement falls back to labelled sample designs in the default demo. Optional backend integrations require `VITE_ENABLE_BACKEND=true`; the following sections describe that separate configuration.

## Branding AI and image provenance

The same local API server exposes POST /api/branding. It uses the Responses API for structured brand concepts and the image generation API for an optional decorative illustration when no reference photos were uploaded. The API key stays on the server. Brand generation requires a verified Supabase session; the scan access code applies only to product analysis. No request runs automatically on profile creation or upload; generation requires the farmer’s explicit action.

- A supplied photo is labelled **Original photo provided by you**.
- A generated image is labelled **AI-generated image based on your written farm profile. This is an illustration, not a photograph of your farm.** This disclosure persists with the identity and appears in the product packaging preview as well.
- A typographic concept without a photo is described as a colour/type layout. It is not labelled as an AI-generated farm image.
- Generation prompts prohibit invented documentary depictions, certifications and factual farming claims. Review remains necessary.
- Optional photos are limited to three JPG/PNG/WebP files at 512 KB each. Story and philosophy can be absent, though richer input helps the resulting brief. The server sends the farm name, story, product range, philosophy and chosen photo references to OpenAI; farmer name and location are excluded from the upstream payload.

Set OPENAI_IMAGE_MODEL if needed (default gpt-image-1). Image generation can require separate model access and has its own cost. Without a configured key, the UI explains that live generation is unavailable and offers clearly marked sample concepts. No successful live recognition or image generation is claimed by the local tests.

## Verification

Run npm run build for UI/server type checks and the standard Vite production build. Run npm test for the extraction, onboarding progression, provenance and API integration checks. Provider calls are mocked in tests; no paid calls are made. Browser checks cover product filters and states, packaging completion, publishing, gated analytics, order transitions, profile editing, brand cascade updates and saved progress after reload.

## Product photo analysis — local setup

This implementation is local and has not been deployed. It replaces the timed scan simulation with a bounded image analysis workflow: upload → server analysis → editable review → explicitly apply to product details. Sample data remains separate and clearly labelled.

1. Use Node.js 24 LTS and run `npm ci`.
2. Copy `.env.example` to `.env.local` and set `OPENAI_API_KEY` privately in that file. Never paste a key into the app or commit it. The default model is `gpt-4.1-mini`; `OPENAI_MODEL` can select another image-capable model supporting Responses structured outputs.
3. In one terminal run `npm run dev:api` (loopback port 8787).
4. In a second terminal run `npm run dev`. Open the Vite address. Vite forwards `/api` to the local server.
5. Upload a JPG, PNG or WebP under 2 MB and choose **Analyze photo**. The image is sent to OpenAI only at this point. Review/correct fields, check the review box, then use the details. Add price and any missing ingredients/allergen declarations manually.

The production preview command serves static assets only. Use the development commands above to test scans locally.

### Extraction rules

- Readable labels: extract name, category, description, brand, ingredients, allergens, net quantity, nutrition (including units/serving context), storage, dates as printed, producer and origin. Each label-derived value carries a short supporting quote.
- Unlabelled products: suggest only a basic name, category and visible description. Label-only facts remain empty. Ambiguity produces clarification questions; unrelated photos return no product facts.
- A second validation step removes unsupported sensitive field guesses independently of the prompt. This does not guarantee factual accuracy; farmers must compare results with the photo. An unreadable or absent allergen declaration never becomes “no allergens”.
- Applying a scan starts a fresh product draft so the sample tomato values cannot leak into another product. Review edits also reset the final ingredients/allergens confirmation.
- Missing configuration, service errors, refusal, incomplete replies and cancellation offer retry/manual entry. No fake scan result is substituted.

### Server and later Vercel setup

`api/analyze.ts` is a Vercel Node function; `server/dev.ts` runs the same handler locally. Set `OPENAI_API_KEY`, optional `OPENAI_MODEL`, and `AI_SCAN_TOKEN` in server environment settings when deployment is authorized. The deployed endpoint refuses scans unless a scan token is configured. Demo users enter that separate token under **Have a scan access code?**; it is held in memory and is not the OpenAI key. No secrets use a `VITE_` prefix.

The access code is a temporary gate for a class demo, not farmer accounts or a distributed rate limiter. Before broad public use, replace it with authenticated farmer sessions and per-user quotas. Configure provider project spending limits as appropriate. The function enforces request/image limits, validates image signatures, bounds output, times out upstream requests, and uses `store: false`. Application code does not log or persist uploaded photos on the server. OpenAI provider retention rules still apply. Product photos/drafts are saved in this browser only when the farmer saves a draft.

### Checks

`npm run build` checks both UI and server TypeScript, then builds the UI. `npm test` tests extraction rules and HTTP handler success/error cases with a mocked OpenAI transport; it makes no paid requests. This suite does not measure real OCR/recognition accuracy.

API references: [image inputs](https://developers.openai.com/api/docs/guides/images-vision), [structured outputs](https://developers.openai.com/api/docs/guides/structured-outputs?api-mode=responses).

## Roles, accounts and guests

Welcome offers Customer and Farmer choices with equal prominence. Farmer opens setup; existing valid profiles resume Home. Guests and each local account have separate browser workspaces. Creating an account transfers guest progress only after successful local creation. Signing into an existing account resumes its own saved data.

For optional real authentication, set `VITE_ENABLE_BACKEND=true`, `VITE_SUPABASE_URL` and `VITE_SUPABASE_PUBLISHABLE_KEY`. Use only a public publishable/anon key. Enable email confirmation, configure return URLs and apply `supabase/workspaces.sql` with owner-based Row Level Security. Restart Vite after changing environment values. No Supabase project, cloud saving, email delivery or real account lifecycle has been verified here.

The default demo does not call these services. Local demo credentials, orders, publishing and generated exports are clearly marked development features.

## Temporary dev testing access
Vercel deployments from the dev branch allow guests and demo accounts to generate branding and analyze product photos without signing in or entering a scan code. AI calls still require the server OPENAI_API_KEY and use its quota. Other branches retain their account and scan-code checks. Guest work remains in the browser, and marketplace publishing remains an unconnected prototype. Remove this temporary bypass before opening dev to general use.
