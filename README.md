# PindariCoders

A developer workshop by **Abou Bakar** and **Muhammad Abdullah**. Always use these spellings.

Built with Next.js App Router and React, preserving the original notebook design. Includes nine interactive modules across four lab domains, a resource shelf, and Frontend, Backend, React, and Next.js learning roadmaps.

The homepage is an introduction. `/learn` has separate domain pages; `/lab` links to Frontend & Design, Backend & APIs, Algorithms, and AI & Text modules; `/resources` replaces Field Notes; `/story` tells the project's origin and return; `/trending` fetches live AI-related Hacker News stories through the public Algolia API when opened or refreshed. It ranks results from the past seven days by Hacker News points, deduplicates them, and handles empty, partial, and failed responses. Requests are aborted after 12 seconds or on unmount. There is no API key, background scheduler, or build-time news snapshot.

Resources are defined in `lib/resources.js` with `id`, `name`, `description`, `image`, and `url`. The shelf is intentionally empty until real entries are added. An authenticated admin panel is future work. The lab includes Flexbox, typography, contrast, JSON inspection, simulated HTTP responses, bubble sort, binary search, text chunking, and word-count cosine similarity. HTTP and text exercises run locally; they do not call a backend or AI model.

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

The production static export is in `out`. All roadmap routes are generated at build time. Deploy this directory to a static host; content changes require a rebuild. No request-time server or database is required.

Roadmap content lives in `lib/roadmaps.js`; home content in `components/home.jsx`; frontend playgrounds in `components/lab.jsx`; other modules in `components/domain-modules.jsx` and `lib/lab-modules.js`; shared design in `app/globals.css`. The paths are original starting guides inspired by roadmap.sh, with links to primary learning resources and attribution. They are not a copy of roadmap.sh’s full curriculum.

Inter and DM Mono load from Google Fonts with local fallbacks. Playground event listeners and agent tools are cleaned up when the frontend lab unmounts. Roadmap completion is saved in this browser with localStorage, with an explicit fallback when storage is unavailable. There are no accounts or cross-device progress. Each step includes a practical completion criterion. Motion respects reduced-motion settings.

`npm run check` validates exported routes and assets plus focused interaction logic in a mock DOM. It does not replace browser or assistive-technology testing. Agent tools are checked in a mock context only.
