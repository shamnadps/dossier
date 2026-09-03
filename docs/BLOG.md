# Building Dossier: a CRM account page that does its own reading

*DevNetwork [API + Cloud + AI] Hackathon 2026 — Xano + SerpApi tracks. Solo, ~one day.*

## The itch

Every CRM I've used is a filing cabinet. Salesforce, HubSpot, the lot — they
store what you type and hand none of it back. So before every call, the same
ritual: open a dozen tabs, skim Google News, the company blog, a funding
tracker, try to walk in sounding like you've been paying attention.

That research is the actual work. The CRM just watches you do it.

So the whole project is one idea: **the account page should do the reading.**
You add a company, press one button, and the page comes back with a briefing —
a short summary of what the company does and the moment it's in, a handful of
buying signals each tied to a real headline, a recommended next step, and a
drafted outreach email that references the news instead of a template.

I called it Dossier.

## Why Xano

I had a day. A day is not enough time to build a real backend the normal way —
schema, migrations, auth, an external-API layer, a deploy target — *and* spend
any real thought on the thing that actually matters, which is whether the brief
is any good.

Xano collapses the first list. The data model is five tables. Auth came from a
starter template — signup, login, a `users` table with password hashing already
wired. Every endpoint is a function stack written in XanoScript, and the
external-API calls I needed (two to SerpApi, one to an LLM) are just
`api.request` blocks in the same stack as the database writes. No separate
service. No ORM. No "now stand up a server somewhere."

That meant the interesting endpoint — `POST /accounts/{id}/research` — could be
one file: clear the old signals, hit SerpApi for Google News and Google web,
hand the raw results to a model with a strict analyst prompt, parse the JSON it
returns, write the signals and the brief in one pass, and return the refreshed
account. Roughly eighty lines of XanoScript, and it's the entire product.

A couple of things I learned the hard way:

- `db.bulk.delete ... { search: ... }` is in the docs but the parser rejected
  it on my instance. A `db.query` + `foreach` + `db.del` did the same job and
  parsed fine.
- The `==?` operator on a `where` clause is great: `owner_id == $auth.id &&
  status ==? $input.status` applies the status filter only when the input is
  non-null. One expression, no branching.
- Free-plan instances don't get static hosting, which I found out at deploy
  time. The front end went to GitHub Pages instead. Xano's CORS was already
  open to the new origin, so that was a five-minute detour, not a rebuild.

## Why SerpApi

The AI half is only trustworthy if it's grounded. The prompt is explicit: reason
*only* over the SerpApi results, never invent a funding round or a headcount,
and if the data is thin, say so. Every signal that shows up in the UI links back
to its source article, and every line in the brief traces to one of those
signals. SerpApi's `google_news` and `google` engines do the reading; the model
just organises it. When it works, you get a brief on Stripe that correctly leads
with the OpenRouter acquisition and the collapsed PayPal bid — because those
were the top news results that morning, not because anything was baked in.

## The pivot

The first version called Anthropic's API for the brief. The key came back with a
zero balance, so rather than ask anyone to top up a card mid-hackathon, I swapped
the one `api.request` block to Google's Gemini API. `gemini-3.6-flash` with
`responseMimeType: "application/json"` turned out better for this anyway — the
model is forced to return a parseable object, so the "unparseable response" path
mostly stopped happening. Total change: about fifteen lines and one env var.

That's the thing about keeping the LLM call to a single block in a single
function stack — the provider is a detail, not an architecture decision.

## What the day actually looked like

Most of it was not backend. The backend — schema, eight endpoints, auth reuse —
was maybe two hours once I stopped fighting XanoScript syntax and started
reading the function reference properly. The front end (React + Vite, a pipeline
list and an account detail page) was another few hours. The rest went where I
wanted it to go: the research prompt, the signal scoring, making the brief read
like something a person would actually send.

A research run takes 20–30 seconds live — two SerpApi calls plus a Gemini
generation plus the database writes. For a hackathon demo that's fine; for
production you'd want it backgrounded, which Xano's background tasks would
handle.

## Would I keep building it?

Yes. The next things are obvious: contact enrichment (the `contacts` table is
there and empty), backgrounding the research job, a digest that re-runs research
on stale accounts and surfaces what changed. None of those need a new backend —
they're each a function stack and a table index.

The one-line version, for the judges: **without Xano, the day goes to auth and
migrations. With it, the day went into the brief.**

---

- **Live:** https://shamnadps.github.io/dossier/ · demo login `demo+dossier@example.com` / `hunter2demo`
- **Repo:** https://github.com/shamnadps/dossier
- **Built with:** Xano (backend + auth + the research function stack), SerpApi
  (`google_news` + `google`), Gemini (`gemini-3.6-flash`), React + Vite on
  GitHub Pages. Coded solo with an AI pair-programming agent in about a day.
