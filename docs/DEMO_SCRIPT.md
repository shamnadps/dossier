# Dossier — demo video

`dossier_demo.mp4` (repo root, gitignored) — ~2:00, 1080p. Narrated walkthrough
of real screenshots from the live app (https://shamnadps.github.io/dossier/);
the "Notion" account was researched live via SerpApi + Gemini.
Voice: Google Cloud TTS `en-US-Studio-Q`. Rebuild: `cd video && python3 build.py`.

## Narration (as recorded)

**1 — login screen**
Meet Dossier. Every salesperson knows the drill. Before a call, you spend twenty
minutes digging through Google News and the company blog, trying to walk in
sounding informed. Your CRM doesn't help with that. It's a filing cabinet. It
stores what you type, and never reads anything back to you. Dossier rebuilds the
account page around one idea: the CRM should do the research for you.

**2 — pipeline list**
Here's the pipeline. Your accounts, grouped by stage — lead, qualified, customer.
Filter, sort, the usual. Everything you'd expect from a CRM. The difference is
what happens when you open an account.

**3 — account with an empty brief**
This one has never been researched. One button: Run research. Behind it, the Xano
backend fires two live SerpApi queries — Google News and Google web — for this
exact company. It passes those raw results to Gemini with a strict analyst
prompt. Nothing here is cached or pre-written. It runs on demand, every time.

**4 — the brief**
Seconds later, the account page has a brief. A short summary of what the company
does and the moment it's in. Buying signals, each tied to a specific recent
headline. A concrete recommended next step. And a drafted outreach email that
references the news, not a mail-merge template with the company name dropped in.

**5 — the signals feed**
Below the brief, the signals themselves. Ranked by relevance, scored zero to a
hundred, each linking straight to its source article. Every claim in the brief
traces back to one of these. No invented funding rounds, no made-up headcounts.
If the model didn't read it, it doesn't say it.

**6 — activity + the build**
From here it's a normal CRM. Copy the email, log a follow-up task, move the
account down the pipeline. Under the hood, the entire backend is Xano — the data
model, authentication, and the research workflow that orchestrates SerpApi and
Gemini, all in a single function stack. No separate server. The frontend is a
small React app on GitHub Pages. Built solo, in about a day.

## If you re-record as a live screencast (stronger for judges)

- 1280×800, browser only. Pre-create one un-researched account so the "Run
  research" moment is real.
- Companies with thin news read poorly — pick a mid-size company with recent
  coverage (the seeded Notion / Stripe / Figma accounts all work).
- Research takes ~20–30s live; trim the wait in edit, don't fake the result.
- Keep API keys off-screen (no Xano env tab, DevTools closed).
