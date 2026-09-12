# PindariCoders

A small static developer workshop with a Flexbox playground, typography experiment, color contrast checker, and three readable field notes.

## Preview

Serve the `dist` directory with a static web server. For example:

```sh
python -m http.server 4173 --bind 127.0.0.1 --directory dist
```

Open http://127.0.0.1:4173. Stop the server with Ctrl+C.

No build step or JavaScript dependencies. Deploy `dist` to any static host. Inter and DM Mono load from Google Fonts, with local font fallbacks. Social links use the supplied profiles. Field notes are initial editorial content and can be edited directly in `dist/index.html`.
