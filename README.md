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

## Farmer onboarding and product flow

The current prototype follows the revised [farmer onboarding frame](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=430-995). Profile creation leads to the farmer home, with independently tracked steps for profile, brand identity and the first saved product. Photos, story and philosophy are optional during profile creation; the farmer can add them later.

The home keeps the cream/green palette, farm overview, brand brief, products and suggestion cards from the reference. Missing photos have an explicit empty state rather than a stock farm photo. The navigation is Home, Products, Orders and Profile. Brand creation is a standalone page, launched from onboarding or the branding actions, with no bottom navigation. The top-right close button saves work in progress and returns to the page that opened it. Orders currently shows an empty state; no order backend is connected. Text, controls and additional onboarding details extend the visible Figma frame where needed.

Brand identity follows the [brand creation screens](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=579-1208): choose a new/existing brand, confirm editable farm information, then customise and save. It includes a generation screen, label/packaging carousel, Minimal/Rustic/Playful styles, three palettes, refinement suggestions and text, and a saved-design summary linking to the first product or Home. New AI directions use the existing profile, philosophy and optional photos. An existing brand can be confirmed without AI or an upload; this does not claim that its artwork is stored. The selected palette, typography and style persist with the product packaging identity. Closing the full-page flow saves progress; interrupted generation reopens a usable step without issuing a paid request. Changes to the saved farm profile require a fresh review rather than restoring stale completed work.

A saved, reviewed brand identity matching the current farm profile is required before product creation. Every add-product entry point routes to branding when the identity is missing or needs review; saving/publishing is also guarded. Product creation is now **photo/manual entry → product details → review and save**. It reuses the farm story and saved brand identity; packaging generation is no longer a step in each product flow. Listing previews reuse the same identity. Product analysis still uses the real server endpoint described below. Fields, review checks, saved product drafts, and local publishing remain functional. This prototype currently stores one product draft in the browser; it is not a multi-product database.

The sample farm, sample product and sample brand concepts are explicitly marked examples. They make no API calls. The DEV sample-brand path uses the exact locally downloaded Figma label/packaging images. Customising it switches to a live layout using the selected farm name, style and colours. Arbitrary text refinements require real AI; the three sample suggestion chips make explicitly local demo changes. Palanquin and Lora are bundled locally; Silom headings fall back to the existing Bree Serif font where Silom is unavailable. The profile, reviewed identity, first saved product and explicitly paused branding work persist in localStorage. They are not accounts or cloud storage. Authentication is optional and requires the Supabase setup below. Order management and marketplace publishing remain unconnected.

## Branding AI and image provenance

The same local API server exposes POST /api/branding. It uses the Responses API for structured brand concepts and the image generation API for an optional decorative illustration when no reference photos were uploaded. The API key stays on the server. Brand generation requires a verified Supabase session; the scan access code applies only to product analysis. No request runs automatically on profile creation or upload; generation requires the farmer’s explicit action.

- A supplied photo is labelled **Original photo provided by you**.
- A generated image is labelled **AI-generated image based on your written farm profile. This is an illustration, not a photograph of your farm.** This disclosure persists with the identity and appears in the product packaging preview as well.
- A typographic concept without a photo is described as a colour/type layout. It is not labelled as an AI-generated farm image.
- Generation prompts prohibit invented documentary depictions, certifications and factual farming claims. Review remains necessary.
- Optional photos are limited to three JPG/PNG/WebP files at 512 KB each. Story and philosophy can be absent, though richer input helps the resulting brief. The server sends the farm name, story, product range, philosophy and chosen photo references to OpenAI; farmer name and location are excluded from the upstream payload.

Set OPENAI_IMAGE_MODEL if needed (default gpt-image-1). Image generation can require separate model access and has its own cost. Without a configured key, the UI explains that live generation is unavailable and offers clearly marked sample concepts. No successful live recognition or image generation is claimed by the local tests.

## Verification

Run npm run build for UI/server type checks and the standard Vite production build. Run npm test for the extraction, onboarding progression, provenance and API integration checks. Provider calls are mocked in tests; no paid calls are made. Browser checks cover profile creation without photos, progress at 1/3 → 2/3 → 3/3, pausing/reloading a branding draft, editing/saving a sample identity, reusing it in product review, and saved progress after reload.

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

The welcome screen offers **Explore Farmily**, **Start selling**, and **Sign in**. Start selling opens a three-step **Set up your farm** flow: Basics, Your story and Photos. Story and photos have explicit optional labels and **Skip for now** controls; empty earlier steps are marked Skipped rather than Complete. **Save farm profile** finishes setup, then a separate invitation offers **Create account**, **Sign in** and **Continue as guest**. Guest completion enters Home at **1/3**, and declining the account offer is remembered. Unfinished profile answers, pending product text and the current step are saved to an owner-scoped draft for refresh/back recovery. Completed profiles are stored separately, and their onboarding draft is removed after saving. **Explore with a sample farm** remains available for demos. Profile also offers confirmed deletion of the farm workspace, returning to Welcome without deleting the account. Buying stops at a WIP notice; no customer shopping interface is implemented. A returning guest or signed-in user with a valid profile skips repeated profile questions. Local profile existence never means authenticated.

Guest mode is explicit and labelled in the farmer header, Home and Profile. Guests can explore sample branding and save product drafts. Generating their own branding requires farm details and a verified account. Publishing requires a verified account. Publishing is still a local prototype action, not a live marketplace API. Orders remains an empty preview; accepting real orders is not implemented.

Email/password authentication uses the official Supabase client. Configure VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY in .env.local and Vercel Preview settings. Only a public publishable (or anon) project key belongs here; never use a service-role/secret key. Restart Vite or rebuild after changing these values. No Supabase project was provisioned or linked by this change.

In Supabase, enable email/password authentication and email confirmation, set the Site URL, and allow the localhost and Vercel preview return URLs. Run supabase/workspaces.sql once to create the workspace table with per-user Row Level Security. Verify real sign-up, confirmation email delivery, sign-in, refresh, sign-out and saving in the configured project before release.

When configuration is missing, the account forms explain that sign-up/sign-in are not connected and keep guest entry available. They do not fake accounts or sign-in success. Email confirmation without a session prompts the user to check their email. Passwords are not saved by application code or included in the profile. The SDK handles session persistence/refresh, and sessions are verified with getUser before an identity is accepted.

Guest profile/branding/product data stays in the original browser workspace. Signed-in users have separate per-account browser keys and a cloud workspace keyed by auth.uid(). Account changes remount the farmer UI so another user’s draft cannot remain on screen. Creating an account automatically transfers guest farm progress into an empty account. After an explicit sign-in, differing saved account and guest progress opens a choice: keep the account version (guest drafts stay on the device), or replace it with guest progress. Identical progress and role-only selections do not prompt. Transfer intent survives email confirmation on the same browser for 24 hours and is matched to the verified account email. Guest data is cleared only after a successful transfer; failed transfers retain the source. Cloud saving failures retain drafts and display an error. Row Level Security restricts reads/writes to the owner.

No real-account or cloud-saving success has been verified without project credentials. Automated permission/storage tests and guest browser checks run without creating remote users or sending emails.

Existing accounts use their own saved workspace. Returning farmers with a valid profile enter Home directly. Legacy deferred-setup preferences are respected on reload; explicitly choosing Start selling opens onboarding when the profile is incomplete. The first product stays locked until brand identity is ready. The customer route remains a WIP notice.
