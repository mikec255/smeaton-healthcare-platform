---
name: SPA catch-all masks missing static assets
description: A 200 response does not prove a static file exists on this site — the SPA fallback serves HTML for any unmatched path, including image URLs.
---

# A 200 does not mean the file exists

Any unmatched path is answered by the SPA catch-all with the app's HTML shell
and a **200** status. That includes paths that look like static files, so
`/og-image.jpg`, `/logo.png` and `/favicon.ico` all returned `200` while no
such file existed anywhere in the project.

**Why:** this silently broke social sharing for a long time. Facebook fetched
the declared `og:image`, received `text/html` instead of an image, and rendered
no preview — while every manual spot-check of the URL "looked fine" because the
status code was 200. The same trap hid a completely broken deployment, where
every route 404'd but the failure surfaced only in logs.

**How to apply:** when verifying that a static asset exists, always check
`content_type` (and a plausible `size_download`), never the status code alone:

```
curl -sS -o /dev/null -w "%{http_code} %{content_type} %{size_download}\n" <url>
```

Treat `text/html` on an image or icon URL as a missing file.

Files that must be reachable at the site root belong in `client/public/` —
Vite copies that directory to the build root. Anything under
`client/src/assets/` is bundled with a hashed filename and is **not** available
at a predictable URL, so it can never satisfy an `og:image`, a schema.org
`logo`, or any other externally referenced absolute path.
