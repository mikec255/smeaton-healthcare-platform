# Memory Index

- [Deployment topology](deploy-topology.md) — the public domain is NOT on Replit; publishing only updates the `.replit.app` host. Check before blaming a stale build.
- [OG tag injection](og-tag-injection.md) — index.html ships homepage og: tags; strip them before injecting per-page ones or crawlers use the first (wrong) og:image.
- [Missing assets still return 200](spa-catchall-masks-missing-assets.md) — SPA fallback serves HTML for unmatched paths; check content-type not status. Root assets belong in client/public.
- [Server reads of client assets](server-reads-of-client-assets.md) — fs reads from client/public or client/src work locally, find nothing once deployed, and fail silently into a fallback.
- [Canonical & public origin](canonical-and-public-origin.md) — shell canonical leaks onto every route; pin one public origin for canonical/og/sitemap/robots, never the request host.
