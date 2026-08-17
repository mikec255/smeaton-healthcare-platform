---
name: Server code reading client assets
description: Why server-side fs reads of client/public or client/src fail silently once deployed, and the containment rules for paths that come from the database
---

# Server code must not read from the client source tree

A server-side `fs` read built from `client/public/...` or `client/src/assets/...`
works in the workspace and finds nothing on a deployed host: only the built client
ships. Vite copies `client/public/*` into the build output, so the file still exists
after deploy — at a different path.

**Why:** this fails silently rather than loudly. Image-serving endpoints typically
end a failed read in a `catch` that returns a placeholder, so the endpoint still
answers 200 with a valid image and nothing logs an error. The only symptom is a
wrong-looking picture, which invites hours of chasing caches and crawlers instead.

**How to apply:**
- Resolve through the shared client-directory helper, which already handles both
  deploy layouts (`dist/public` here, a bare `public/` on the Azure host).
- Order roots by environment: build output first in production; source first in
  development, so a leftover build cannot shadow an edited image.
- Verify by running the production bundle from a scratch directory holding only the
  build output and a symlinked `node_modules`. A test run in the workspace always
  has the source tree present and cannot detect this class of bug.
- A new image asset only reaches the deployed host once it is committed — check
  tracking, not just that the file exists locally.

# Paths built from database content need two containment checks

When a stored value selects a file on disk, closing only the obvious hole still
leaves an exploitable one:

- Lexical — `path.resolve` collapses `..`; require the result to equal the root or
  start with root + separator.
- Symlink — a link inside the root can point outside it and passes every string
  check. Canonicalise both root and candidate, then re-test containment after
  following the link, before reading.

**How to apply:** test by planting a genuine readable file outside the root and
aiming both a `../../` path and an in-root symlink at it, then assert the response
is byte-identical to the known fallback. Never assert on appearance — once the
fallback has any detail drawn on it, "does the image look blank?" no longer
distinguishes blocked from leaked.
