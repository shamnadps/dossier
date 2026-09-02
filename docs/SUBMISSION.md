# Devpost submission — Dossier

## Project name
Dossier

## One-line pitch
The CRM account page that shows up to the meeting already briefed — live web
signals plus an AI account brief, on a Xano backend.

## Which tracks
- **Xano — Rebuild a SaaS Tool You Hate** (primary)
- **SerpApi — Best AI Use Case** (secondary)

## What software did you replace, and why?
The account/company page in Salesforce and HubSpot. It stores what you type and
nothing more. Reps still do the pre-call research by hand every time. Dossier
makes the account page do the reading: one click pulls live news and web results
and turns them into a brief with cited buying signals and a drafted outreach
email.

## Build story
- **AI tools:** Claude Code (end to end — backend build via the Xano MCP,
  React frontend, this write-up).
- **Time to build:** ~1 day, solo.
- **What would have taken much longer without AI + Xano:** auth, the database
  schema and migrations, external-API orchestration, and a real deploy target.
  Xano collapsed that to a data model plus one function stack, so the day went
  into the research pipeline and the brief quality instead.

## Where Xano does the real work
The `POST /accounts/{id}/research` function stack is the whole product: it clears
stale data, calls SerpApi twice (Google News + web) via External API Requests,
passes the results to Google's Gemini API, parses the returned JSON, and writes
`signals` + a `brief` in one transaction. Auth, ownership guards, the data model,
and static hosting for the frontend are all Xano too. No separate backend
service exists.

## Where SerpApi does the real work
Every factual line in a brief comes from a SerpApi result. The AI is constrained
to reason only over the `google_news` and `google` engine responses, and each
signal in the UI links back to its SerpApi source URL — so the brief is grounded
and checkable rather than hallucinated.

## Links
- Repo: <fill in>
- Live app (Xano static hosting): <fill in>
- Demo video: <fill in>

## Submission checklist
- [ ] Public repo with setup instructions (`README.md`)
- [ ] 2–4 min demo video, end to end
- [ ] Live URL working with a seeded demo account
- [ ] One line on where Xano does the heavy lifting (above)
- [ ] One line on where SerpApi does the heavy lifting (above)
- [ ] Registered on Devpost, both challenges selected
