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
public site is fed by a **separate pipeline** into the off-platform host, so a Replit
publish on its own leaves the public domain unchanged — which looks exactly like a
caching or stale-build bug and is not one.

**But code from this repo does reach the public domain.** This was confirmed directly:
server changes written in this workspace were later observed live on the public site
with no Replit publish involved. The opposite conclusion — "these fixes are stranded,
nothing I write can ship" — was asserted repeatedly across a session and was **wrong**,
and it delayed real diagnosis because live symptoms were blamed on old code.

**How to apply:** never *assume* either way. Pick a **fingerprint** unique to the change
— a tag it adds or removes, a status code it alters — and curl the public domain for
exactly that. One request settles it. Only after the fingerprint is missing should you
treat a change as undeployed, and even then diff the same path from the `.replit.app`
URL (via `getDeploymentInfo()`) before concluding it is a topology problem. Do not
respond by rewriting build config, adding cache-busting headers, or redeploying
repeatedly.

**Corollary:** because deploys *do* land, a change that hardens live behaviour can break
real users. Treat this repo as production, not a staging copy.

## Both hosts read the SAME database

The two hosts run different *code* but share one database. A record created in the
Replit workspace is immediately visible on the public domain, with no deploy involved.

**Why this matters:** it splits every "the live site is wrong" report into two very
different classes, and guessing wrong wastes a session:

- **Data differs** between the workspace and the public site → not possible; suspect
  caching or a filter, not a sync gap. Do not go looking for a second database or an
  import job.
- **Behaviour differs** (same data, different response) → a code change that has not
  reached the other host. This is the topology problem above.

**How to apply:** diff `/api/<resource>` from both hosts first. Identical payloads
prove the shared database and point at code; differing payloads point at caching.
A record created in the workspace minutes ago and visible publicly is the fastest
positive proof of the shared database.

## A third system holds an API key into this app

A separate care-management platform both consumes this app's data and pushes into it
through an authenticated API namespace, and it also hosts job share images on its own
public URLs. Two consequences worth remembering:

- It is a *client* of this database, not the source of the records. "Their system must
  be out of sync" is the wrong first hypothesis.
- Hiding something in this app does **not** withdraw assets that the third party serves
  from its own domain. Suppressing a record here only closes this app's surface; the
  upstream public asset URL has to be handled on their side.

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
