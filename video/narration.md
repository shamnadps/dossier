# Dossier — narration (en-US-Studio-Q), ~2:05

S1 / login screen
Every sales rep spends the first twenty minutes before a call digging through
Google News, trying to sound informed. Their CRM just stores what they type into
it. Dossier makes the account page do the reading.

S2 / pipeline list
This is the pipeline. Accounts by stage, like any CRM. The difference is one
button.

S3 / account detail, top (empty brief state / run research)
Open an account and hit Run research. The Xano backend calls SerpApi twice, for
Google News and web results on the company, then hands them to Gemini to write
the brief. None of this is pre-baked.

S4 / brief card
Back comes a briefing. What the company does and the moment it's in. Buying
signals, each tied to a real headline. A recommended next step. And a drafted
outreach email that references actual news, not a template.

S5 / signals feed
Every claim traces back to a signal. Ranked, scored, each one linking to its
source. No invented funding rounds, no hallucinated headcounts.

S6 / activity + status, then pipeline
Copy the email, log a follow-up, move the account down the pipeline. The whole
backend is Xano. The data model, authentication, and the research workflow that
orchestrates SerpApi and Gemini, all in one function stack. The front end is a
small React app on GitHub Pages. Built solo, in about a day.
