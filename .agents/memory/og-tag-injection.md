---
name: Server-side OG tag injection for SPA share previews
description: index.html ships its own OG tags — strip them before injecting per-page ones, or crawlers pick the wrong image.
---

# Injecting per-page OG tags into the built SPA HTML

The client `index.html` ships a full set of **homepage** `og:` / `twitter:` meta tags
and a `<title>`.

**Rule:** a server route injecting page-specific OG tags into that HTML must **remove
the existing `<title>` and `og:`/`twitter:` meta tags first**. Appending a second block
before `</head>` is not enough. The result must contain exactly one `<title>` and
exactly one `og:image`.

**Why:** Facebook and most crawlers honour the **first** `og:image` they encounter. The
inherited homepage tag appears earlier in the document than an appended block, so the
crawler silently uses the homepage image and ignores the per-page one. The symptom is
"sharing shows no image" while the correct tag is demonstrably present in the HTML —
which reads as a caching problem and sends you chasing the wrong thing.

It compounds when the homepage `og:image` points at an asset that does not exist: an
SPA catch-all answers the request with `text/html` and a 200, so the crawler receives a
success response that is not an image and renders no preview at all.

**How to apply:** applies to every share-preview route (job pages, blog sharing, any
future one). Verify by *counting* tags in the response, not by confirming the right tag
exists somewhere.

**Verifying:** request the page with a crawler user-agent rather than trusting the
browser, and confirm the image URL itself responds with an `image/*` content type — a
200 alone proves nothing when an SPA catch-all serves HTML for missing files. Facebook
also caches scraped previews for weeks, so a corrected page still needs a re-scrape
through the Sharing Debugger before the new image appears.

Note: Facebook's `sharer.php` `picture` query parameter has been ignored since 2017 —
it cannot be used to bypass OG scraping.
