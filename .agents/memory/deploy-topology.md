---
name: Two hosts, two build layouts
description: The public domain is not the Replit deployment, and the two hosts lay the built client out differently. Read before debugging "my deploy had no effect".
---

# The public domain is not served by Replit

This project is deployed to **two separate hosts**:

- The **public custom domain** is served off-platform (observed on Microsoft Azure
  infrastructure, with Azure Application Insights response headers).
- The **Replit deployment** is a different host at the project's `.replit.app` URL.

No custom domain is attached to the Replit deployment.

**Why this matters:** publishing from Replit updates *only* the `.replit.app` host. The
public site never receives those deploys. The build succeeds, the deploy succeeds, and
the live site is unchanged — which looks exactly like a caching or stale-build bug and
is not one. This burned multiple sessions.

**How to apply:** before concluding "the deployment is serving stale code", fetch the
same path from the `.replit.app` URL (from `getDeploymentInfo()`) and from the public
domain, and diff the responses. If they differ, it is a topology problem, not a build
problem. Do not respond by rewriting build config, adding cache-busting headers, or
redeploying repeatedly. Either DNS moves to Replit, or the change ships through the
pipeline that feeds the other host — a decision for the user, not something to work
around in code.

## The two hosts use different client build layouts

The built frontend lives in a different directory on each host — the Replit/vite build
output location differs from the layout the off-platform deploy packages. Server code
that resolves `index.html` (static file serving **and** any server-side OG/meta
injection) must handle both, or it breaks on whichever host it was not written for.

Symptoms of getting this wrong are misleading: a wrong static path returns **404 on
every route including the homepage**, and a wrong OG-injection path silently skips the
tags via its "file missing" safety valve. Neither error names the path as the cause.

**Rule:** resolve the client directory by probing for the one that actually contains
`index.html`, resolve it once per process so all consumers agree, and allow an explicit
environment override to pin it on any host where both layouts might be present.
