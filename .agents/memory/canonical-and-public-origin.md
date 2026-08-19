---
name: Canonical tags and the public origin
description: Why every public URL this server emits must come from one pinned origin constant, and why the SPA shell must not carry a canonical tag.
---

# Canonical tags and the public origin

Two rules, both learned from the same incident.

## 1. The shared SPA shell must never carry a `<link rel="canonical">`

The built `index.html` is served for *every* route. A canonical hardcoded in it
therefore declares that every page — jobs, blog posts, services, locations — is
really the homepage.

**Why:** the crawler-facing routes inject per-page metadata by string-replacing
into that shell. They stripped `<title>` and `og:`/`twitter:` tags but left the
canonical, so it survived into every server-rendered page. Search engines were
told the homepage was the original for the entire site, which suppresses the
pages that matter most.

**How to apply:** pages declare their own canonical (client-side via the Seo
component, server-side in the crawler routes). Any new server-side meta injector
must strip inherited canonical tags before adding its own — treat the canonical
as part of the same strip step as the og tags, not an afterthought.

## 2. Public URLs come from a pinned origin, never the request host

Anything that emits an absolute public URL — canonical, `og:url`, `og:image`,
sitemap `<loc>` and `<image:loc>`, the `Sitemap:` line in robots.txt — must use
a fixed public-origin constant.

**Why:** this app answers on more than one hostname. Host-derived URLs mean the
secondary host serves a sitemap advertising *itself* and canonicals naming
*itself*, so that copy presents as an independent site competing with the real
one for its own content. Deriving from `req.get('host')` also trusts a header
the caller controls.

**How to apply:** when adding any endpoint that emits an absolute URL, reach for
the origin constant. Verify by requesting the endpoint with a foreign `Host:`
header and confirming the output still names the public domain — that test
catches the regression immediately and costs nothing.

## Known outstanding issue

Apex and `www` both answer `200` with no redirect between them, so the site is
fully reachable on two hostnames. Canonicals now consistently name the apex,
which mitigates it, but the real fix is a host redirect in the hosting layer —
not something that can be done from this codebase.
