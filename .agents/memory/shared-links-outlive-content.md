---
name: Shared links outlive the content behind them
description: Why soft-deleted/expired items reachable by a public share URL must not answer 4xx, and what to serve instead.
---

# Shared links outlive the content behind them

A URL that has been posted to Facebook, emailed, or indexed keeps being clicked
long after the thing it points at is withdrawn. For any resource that is
soft-deleted rather than truly absent (job advert filled or re-posted, event
finished, product discontinued), **do not answer 4xx/410 on the HTML route.**

Serve **HTTP 200** with a purpose-built "no longer available" page:

- `<meta name="robots" content="noindex, follow">` to drop it from search
- canonical pointing at the parent listing page, not itself
- its own og/twitter tags, so the social card is not the homepage's
- a visible explanation plus a link to what *is* currently available
- no detail fields from the withdrawn record, and no structured data

Reserve a genuine `404` for ids that never existed.

**Why:** Facebook's in-app browser refuses a 4xx/410 outright and shows its own
"this page isn't available" — the visitor never reaches the page, so a friendly
body on the error response is invisible. A well-meant fix that hardened an HTML
route from 200 to 410 for withdrawn items silently killed every share of every
previous advert, and the symptom surfaced only days later as "the links I posted
don't exist any more". Status-code correctness on the *HTML* route was worth
much less than the traffic it destroyed; `noindex` achieves the same
de-indexing goal without breaking humans.

**How to apply:** Whenever tightening visibility on a route that renders a
shareable page, separate the two audiences. Lock down the **JSON/API** route
(404 for withdrawn records — that is what actually prevents the content
leaking) and keep the **HTML** route reachable at 200 with a placeholder. Ask
"has this URL ever been public?" before choosing a status code. Watch for
duplicate `robots` directives when injecting into a shell that already ships
one — strip before injecting.
