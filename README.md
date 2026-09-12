# PindariCoders

A developer workshop by **Abou Bakar Arisar** and **Abdullah Arain**. Always use these spellings.

Built with Next.js App Router and React, preserving the original notebook design. Includes three interactive playgrounds, field notes, and Frontend, Backend, React, and Next.js learning roadmaps.

The homepage is an introduction. `/learn` has separate domain pages; `/lab` hosts the playgrounds; `/notes` has the field notes; `/story` introduces both founders; `/trending` fetches live AI-related Hacker News stories through the public Algolia API when opened or refreshed. It ranks results from the past seven days by Hacker News points, deduplicates them, and handles empty, partial, and failed responses. Requests are aborted after 12 seconds or on unmount. There is no API key, background scheduler, or build-time news snapshot.

Founder details are in `lib/founders.js`. Abdullah’s portfolio URL is not yet supplied. His temporary portrait is a copy of Abou Bakar’s image, as requested; replace `public/abdullah-arain.png` with his portrait later. The story page labels the photo as temporary.

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

Roadmap content lives in `lib/roadmaps.js`; home content in `components/home.jsx`; playgrounds in `components/lab.jsx`; shared design in `app/globals.css`. The paths are original starting guides inspired by roadmap.sh, with links to primary learning resources and attribution. They are not a copy of roadmap.sh’s full curriculum.

Inter and DM Mono load from Google Fonts with local fallbacks. Playground event listeners and agent tools are cleaned up when the home page unmounts. Roadmap selections last for the current page visit; there are no accounts or saved progress.

`npm run check` validates exported routes and assets plus focused interaction logic in a mock DOM. It does not replace browser or assistive-technology testing. Agent tools are checked in a mock context only.
