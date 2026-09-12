# PindariCoders resource editor

Editor: https://pindaricoders-resources.sanity.studio/

Sign in with your Sanity account, open Resource, create an entry, fill its fields, upload an image, and publish. Drafts do not appear on the website. After publishing, reload the website's Resources page; Sanity's CDN can take a short time to update.

Only Sanity project members with editing permissions can publish. Add future editors through Sanity's project member settings. No editing token is included in the website.

The `production` dataset stores public resource content. Do not put private information in published entries or their uploaded images.

For local development, run `npm ci` then `npm run dev` from this folder. Deploy schema or editor changes with `npm run deploy` after signing into the official Sanity CLI. Content edits do not require deploying either app.

Project: `uffqpes0`; dataset: `production`. The website integration is in `../lib/resources.js` and `../components/resource-shelf.jsx`.
