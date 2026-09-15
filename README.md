# PindariCoders

A developer workshop by **Abou Bakar** and **Muhammad Abdullah**. Always use these spellings.

Built with Next.js App Router and React, preserving the original notebook design. Includes eighteen interactive modules across four lab domains, a resource shelf, Frontend, Backend, React, and Next.js learning roadmaps, and a moderated community project wall.

The homepage is an introduction. `/learn` has separate domain pages; `/lab` links to Frontend & Design, Backend & APIs, Algorithms, and AI & Text modules; `/resources` replaces Field Notes; `/story` tells the project's origin and return; `/wall` contains approved community projects; `/trending` fetches live AI, tech, job market, and developer stories from Hacker News (Algolia) and DEV Community. Only items published within the last 72 hours are shown. Topic/source filters and newest/popular sorting apply before pagination (10 stories per page); changing a filter or refreshing returns to page one. Each of 8 queries retrieves at most 100 items, so this is a bounded recent selection. Repeated results from the same source are merged. Points and DEV reactions are labeled separately. Failed requests show a partial-coverage notice, and a complete failure preserves still-recent previous results. All requests share a 15-second deadline and abort on unmount.

Resources are managed in the standalone Sanity Studio in `studio/`, connected to project `uffqpes0` and the `production` dataset. The resource schema includes name, description, image and alt text, URL, category, and pricing. The website queries published entries from the Sanity CDN on page load without an API token; changes appear after publication and CDN refresh, with no site rebuild. Drafts stay out of the website. Failures show a retry state. Only authorized Sanity members can edit.

Founder details are in `lib/founders.js`. Both supplied portraits and portfolio links are active. Muhammad Abdullah’s photo is `public/muhammad-abdullah.jpeg`.

## Preview

```sh
npm ci
npm run dev
```

Open http://127.0.0.1:4173. Stop the server with Ctrl+C.

## Build and check

```sh
npm run build
npm run check
```

The production build requires a Next.js server-capable host because The Wall uses request-time API routes and secure cookies. Roadmap routes remain generated at build time.

## The Wall setup

1. Create a Supabase project and run `supabase/migrations/20260915_create_community_wall.sql` in its SQL editor.
2. Copy `.env.example` to `.env.local` and provide `SUPABASE_URL`, the server-only `SUPABASE_SERVICE_ROLE_KEY`, a new shared `CONTROL_ROOM_PASSWORD`, and a random `CONTROL_ROOM_SESSION_SECRET` of at least 32 characters.
3. Add the same four variables to the deployment environment. Never prefix the service key or control-room secrets with `NEXT_PUBLIC_`.

Public submissions accept one to three JPG, PNG, or WebP images of up to 3 MB each. New projects remain pending until approved at `/control-room`. The control-room route uses one shared password, rate-limited login attempts, an HTTP-only signed session cookie, and server-only Supabase access.

Roadmap content lives in `lib/roadmaps.js`; home content in `components/home.jsx`; frontend playgrounds in `components/lab.jsx`; other modules in `components/domain-modules.jsx` and `lib/lab-modules.js`; shared design in `app/globals.css`. The paths are original starting guides inspired by roadmap.sh, with links to primary learning resources and attribution. They are not a copy of roadmap.sh’s full curriculum.

Inter and DM Mono load from Google Fonts with local fallbacks. Playground event listeners and agent tools are cleaned up when the frontend lab unmounts. Roadmap completion is saved in this browser with localStorage, with an explicit fallback when storage is unavailable. There are no accounts or cross-device progress. Each step includes a practical completion criterion. Motion respects reduced-motion settings.

`npm run check` validates focused content and interaction logic. It does not replace browser or assistive-technology testing. Agent tools are checked in a mock context only.
