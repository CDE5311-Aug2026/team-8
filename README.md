# Farmily — Live demos

Quick access to the hosted previews:

- **Production** — [Open Farmily app](https://farmily-sg.vercel.app)
- **Development** — [Open Farmily dev](https://farmily-git-dev-reldhas.vercel.app)

[![Production](https://img.shields.io/badge/Production-Open%20Farmily%20App-brightgreen)](https://farmily-sg.vercel.app) [![Development](https://img.shields.io/badge/Development-Open%20Farmily%20Dev-yellow)](https://farmily-git-dev-reldhas.vercel.app)


# Farmily local prototype

## V2 onboarding

Sample mode is shared across Home, Products, Orders and product Analytics through the built-in demo account (`farmer@example.com`, password `123456`). Choosing Samples signs into that account, opens its completed workspace and keeps the mode after a refresh. Sample products and edits use the same account workspace across tabs. Exit sample restores the previous guest or local account workspace (or reconnects the existing cloud session); personal data is kept separate.

The [V2 publish section](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=1153-3087) is available from the Home publishing task or a saved product’s Publish action. It includes editable details, optional three product/two process photos, voice description entry, independent Original/Polished wording, a swipeable gallery, listing preview and the confirmation screen. Wording assistance runs locally and preserves supplied facts; it does not call AI. Uploads accept JPG, PNG and WebP up to 512 KB each. Drafts are workspace-scoped and invalidate when the saved source product changes. Ingredient and allergen editing use the existing controls and preserve declaration qualifiers.

Publish saves an explicitly labelled **local demo listing**, not a public marketplace listing. The success subtitle and preview footer state this; View in marketplace opens a local preview. Publishing preserves the existing saved-product format, adds listing photos and local-publication metadata, and completes the Home setup deck. No marketplace API is called. Figma’s exact sample imagery appears only for explicitly marked sample products; uploaded photos remain dynamic.

The [refined V2 brand identity flow](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=1588-233) keeps farm review first, followed by three selectable directions and independent Colour, Type, Logo and Pattern editors. Sprout remains a local demo: typed requests and prompt chips re-rank approved choices without network AI calls. Reasons use actual saved farm products/story; the demo does not infer facts from photo pixels or generate animal marks. It uses the six visible marks confirmed for this revision, six exact palettes, six locally bundled logo fonts and four patterns. The two unnamed swatches use their hex values rather than invented names. Selection, requests, active tab and stage persist per workspace, including save-and-leave/resume. The saved kit retains contrast choices and opens the existing packaging, Profile and Products pages. New-product labels and product-card farm strips use the selected identity; Farmily controls, prices and badges keep their own styling. Existing brand confirmation is preserved.

The [V2 first home section](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=1153-3084) is connected after onboarding. Returning farmers resume Home. The task deck follows actual saved profile, brand and product progress; completing a task animates its card away over 0.45 seconds, with reduced-motion support. Brand, product, order and profile actions open the existing flows. Sales stay empty until connected; tapping the sales card offers an explicitly labelled sample analytics preview. Home uses the exact local Figma icons and illustrations, with farmer details supplied by the saved profile.

The entry flow now implements only the [V2 onboarding section](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=1153-3083): welcome, sign-in, create account, farm basics, story (including recording/review), growing practices, optional certificate selection and review, photos, and account prompt. It uses locally bundled Figtree/Bricolage Grotesque fonts and downloaded Figma assets. The existing marketplace and farmer workspace remain the destinations after onboarding.

Farm details, pending product text, story fields and photos are stored in the current workspace under `farmily-v2-onboarding`. This draft transfers with guest account progress. Photo uploads accept JPG, PNG and WebP up to 512 KB each. Story suggestion chips insert editable text locally. Voice entry uses the browser speech recognition service when available: Stop opens review, Use this replaces the selected field, and Close leaves the original field intact. Unsupported or blocked microphone access returns to typing. Recording controls were browser-tested with simulated recognition; actual microphone recognition depends on browser/device support.

React + TypeScript + Vite reconstruction of the mobile screens visible in [Farmily — UI](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=189-476).

## Run

Use Node.js 22.12+ (or 24 LTS). From this folder:

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

The [added onboarding steps](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=1607-10003) extend setup to five stages. Growing practices can be selected or removed, with initial suggestions matched to explicit wording in the story. Certificate type selection does not imply certification. Uploads accept PDF/JPG/PNG/WebP up to 512 KB; certificate fields are entered manually and “Send for review” saves a clearly labelled local pending record. No extraction, submission or verification service is called. Practices and certificates can also be edited in Profile. The farmer portrait is stored separately from the three farm photos. New fields and navigation survive reloads and transfer with the account workspace; older drafts retain their current screen.

## Farmer onboarding and product flow

Farmer setup has three numbered steps with visible progress and previous/continue actions, followed by an optional account invitation. Story input is scaffolded into short sections. Setup can be deferred and resumed from Home. A saved brand identity is required before adding a product.

Branding and product creation are full-page processes with a save/discard exit dialog. Product details include searchable category, ingredient and allergen controls, removable chips, explicit Not applicable / Allergen-free declarations, SGD pricing and optional extra photos. A named unfinished product saved on exit appears as Draft; confirming its packaging makes it Unpublished. Publishing now follows the final two-step Publish Product editor (details, then optional photos/description), a customer-style Preview and a success screen. Completed details, description, at least one additional product photo and behind-the-product imagery skip directly to Preview. Editing always opens the stepper; preview pencils open the relevant step. Product and behind-the-product photos have no count limit: overflow is grouped into the last tile, which opens a full gallery with captions and removal controls. Each file remains limited to 512 KB; browser storage capacity still applies. Optional content can be left empty when proceeding manually. Description tools retain Original and Polished versions, support labelled local demo refinements and browser-supported dictation. View product opens the selected product’s Overview; Back to Products opens the catalogue. Publishing remains a local demo action.

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

## V2 daily-use screens

The non-Home screens from Figma section `1153:3088` are implemented: product status lists, product overview, analytics and packaging tabs (including empty states), orders, and profile. Home is unchanged. The catalogue keeps multiple saved products and supports duplication, editing, local publication, unpublishing and deletion. Farm details and photos can be edited from Profile.

Samples are an explicit preview. Sample order actions stay local and do not contact customers; analytics and reviews are examples, not measured farm results. Live orders, marketplace publishing and account deletion still require backend integration. Password updates use the configured Supabase account; guest/demo sessions do not fake password changes.

Packaging downloads provide PDF label artwork, SVG label artwork and a PNG preview, individually or as a ZIP. These are prototype label exports, not manufacturing-ready structural dielines. The sample PNG uses the supplied Figma pouch reference. Exact Figma assets are stored in `public/daily-v2`.

Validation: 58 automated tests, TypeScript and production build; isolated browser checks cover all new tabs and empty states, order actions, profile persistence, actual-product duplication/edit routing, image loading, narrow-screen overflow and the packaging ZIP download.
## Temporary dev testing access

Vercel deployments from the dev branch allow guests and demo accounts to generate branding and analyze product photos without signing in or entering a scan code. AI calls still require the server OPENAI_API_KEY and use its quota. Other branches retain their account and scan-code checks. Guest work remains in the browser, and marketplace publishing remains an unconnected prototype. Remove this temporary bypass before opening dev to general use.

Browser dictation uses the [Web Speech API](https://developer.mozilla.org/en-US/docs/Web/API/SpeechRecognition), which is not supported by every browser and may use the browser vendor’s speech service. It starts only on a mic tap. Unsupported or denied dictation leaves typed editing available. No speech, image or text service is called by the local demo polishing tools.

## Brief in v2
The central Brief tab now follows Figma section `1389:3904`, replacing the earlier Shorts presentation. New ideas use a photo card deck: swipe right to try, left to skip, and flip Why this? to inspect the example evidence. The three editable workflows are a breakfast bundle (product selection, price, saved draft, customer preview, local publication), a Pandan Kaya taster (size, price and jar count), and free delivery (area, minimum order and duration).

Trying keeps saved drafts and active or paused examples. It supports resume, edit, unpublish and confirmed deletion, plus product details and sample analytics. State persists in the account-scoped `farmily-brief-v2` workspace key and participates in guest-progress transfer. The older Shorts data remains untouched under its original key.

The supplied products, evidence and performance figures are samples, identified through the Sample control and results notes. Publishing and delivery actions are local previews: they do not contact shoppers, change the real catalogue, charge delivery costs or schedule check-ins. The confirmation screens state that distinction. Exact Figma assets are stored in `public/brief-v2`.

Validation: 85 tests, TypeScript and production build. Isolated browser checks cover all three workflows, card flip, price adjustment, adding/removing bundle products, saved drafts, customer preview, pause/resume, edits, confirmed deletion, swipe actions, reload, 320px layout, image loading and intrinsic SVG dimensions.

Brief and homepage onboarding cards now follow horizontal pointer/touch drags, snap back below the threshold, and animate out before opening a workflow or skipping an idea. Brief buttons and keyboard actions use the same motion, and the next idea rises into the stack. Homepage swipes and Start open the current incomplete setup step without changing completion status. Completed setup cards swipe out when returning Home. Reduced-motion preferences bypass the animation delay. Browser checks cover drag/snap-back, exit transitions, both destinations and reduced-motion behavior.

## V2 add product
Home setup, the Products add button, draft resume, and product editing now use `ProductFlowV2`, following Figma section `1153:3086`. The flow includes camera/upload, explicit photo review, reading, reviewed product details, 3D/photo packaging, saved themes, label download, and the saved confirmation linking directly to v2 publishing. Product declarations and ingredient/allergen controls retain their existing validation and evidence. Unknown allergens are never filled from appearance. Sample artwork appears only on the explicit sample path; real uploads keep the user's photo and saved brand. Theme selection and draft stage resume after leaving/reloading.

The obsolete `ProductFlow.tsx` creation page and unused legacy `ProductDetails.tsx` page were removed. Shared camera, scanning, packaging and ingredient/allergen controls remain in use. Camera capture requires device permission; failed access keeps close/upload available. Local scanning previews are identified and require manual details. Marketplace publication remains the existing labelled local demo.

Ingredients in v2 creation and publishing are now optional free text with voice entry. Blank ingredients do not block saving and do not appear on exported labels. Multiline wording is preserved. Product name and quantity remain required and show required markers.

## Completed Home, messages and Sprout
After all four setup tasks are complete, Home uses Figma node `1103:498`: farm summary, Brief shortcut, product carousel, sales, customer reviews/regions and packaging design banner. Samples explicitly previews the supplied design data; actual farm details/products remain dynamic and unconnected analytics stay empty. The message button opens the new inbox and conversation screens from section `1309:3223`.

Messages are labelled sample conversations. Filters, suggestion chips, editable text/voice replies, local reply history and explicitly saved Sprout guidelines work within the account-scoped `farmily-sample-messages-v2` workspace. They do not send messages to real shoppers or activate automatic replies. Message badge state updates after returning Home. Sprout branding and its supplied icon replace AI suggestion labels throughout onboarding, branding, publishing, product analytics and customer assistance. Product analytics now uses “Sprout’s read” and “Ideas from Sprout”.

Validation: 88 tests, TypeScript and production build; isolated browser checks cover completion routing, sample Home, inbox filters, suggestions, local replies, teaching Sprout, persistence, visible SVG dimensions and 320px layouts.


## Updated product details, Orders and Profile
The [updated daily-use screens](https://www.figma.com/design/kowdyJKqaPGqrG9qWD2Lb9/Farmily---UI?node-id=1607-10004) add a Sprout shopper-message editor, full order details and Profile growing-practice/certificate cards. Message drafts and simulated sends are account scoped; no shoppers are contacted. The supplied honey sample uses the Figma stock/message fixture; other products use only their saved name and description.

Orders follow New → Preparing → Ready → Delivered. Ready replaces On the way, and old saved On the way/Completed statuses migrate to Ready/Delivered. New order cards and rows open full customer/item/payment details. Sample order #1042 includes the exact two items, 10% welcome discount and $19.35 proceeds from the design. No payment or delivery service is connected.

Profile supports multiple certificate files, manual details, re-upload after rejection and growing-practice editing. Existing onboarding certificates remain available. Approved/rejected examples are explicitly sample records; new uploads remain in local review. Certificate updates appear in Messages and affect unread badges. Calendar expiry uses Singapore end of day, announces the 30-day reminder, and updates at the expiry boundary while the app is open (or on next open/focus). Expired or rejected certificates are excluded from shopper eligibility; sample approvals never become real shopper proof. No background notification or verification service is connected.


## Sample product packaging
Packaging previews rotate directly with horizontal mouse, pen or touch drags. The box, jar and carton previews share the same interaction, with pointer capture and bounded rotation. Vertical touch gestures retain page scrolling. Rotation sliders have been removed; arrow keys rotate and Home resets the view.

Bottom drawers share outside-click and swipe-down dismissal across general dialogs, brand-exit sheets and recording/review popups. Dragging the handle/header works with mouse or touch; touch drags from non-interactive content also work when its scroll area is at the top. Short drags snap back, upward/horizontal gestures and form controls keep their normal behavior, and reduced-motion preferences skip the transition. Dismissal uses each popup’s existing Cancel action, preserving focus restoration and recording cleanup.

New products use a Botanical label by default, with Minimal and Market alternatives in the packaging step. Label selection persists with the product draft and saved item, independently of the selected farm brand. Templates keep the saved brand palette and farm identity, use readable contrast, and preserve ingredient and allergen wording in SVG/PDF exports.

All four farmer demo products have complete fictional listing details and suitable packaging: honey, pandan kaya and mango jam use glass jars with screw lids and tamper seals; lemongrass tea uses a paperboard carton for 20 tea bags. The generated studio mockups are stored in public/sample-packaging with their exact generation prompts. The Packaging tab also renders editable jar/carton concepts, and downloads use the matching mockup plus product-specific label dimensions. These are sample concepts, not production specifications. Kaya correctly declares eggs. Existing demo workspaces migrate once to seed version 5, retaining edited fields, custom images and publication/draft states. Real products are unaffected.
