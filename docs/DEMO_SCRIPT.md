# Dossier — Demo video script (target 2:45)

Record at 1280×800, browser only. Have one account pre-created but NOT researched
so the "Run research" moment is live.

## 0:00–0:20 — The problem
> "Every sales rep I know spends the first 20 minutes before a call digging
> through Google News and LinkedIn to sound informed. Their CRM — Salesforce,
> HubSpot — is just a filing cabinet. It never does the reading for them.
> So I rebuilt the account page. This is Dossier."

## 0:20–0:40 — The pipeline
- Show the pipeline list, status filters, a few accounts in different stages.
- "Standard CRM pipeline. The difference is one button."

## 0:40–1:40 — Run research (the centerpiece)
- Open the un-researched account. Point at the empty AI Brief card.
- Click **Run research**. Talk over the spinner:
  > "Xano is calling SerpApi twice — Google News and web — for live results on
  > this company, then handing them to Gemini to write the brief. Nothing is
  > pre-baked; this is happening now."
- Results land. Walk the brief: Summary → Buying signals (each tied to a real
  headline) → Recommended next step → the drafted outreach email.
- Scroll to the **Signals** feed: ranked, scored, each links to its source.
- "Every claim in the brief traces back to a signal with a URL. No hallucinated
  funding rounds."

## 1:40–2:10 — Work the account
- Click **Copy outreach**.
- Add a follow-up **task** in the Activity panel, check it off.
- Move the account **lead → qualified**. Back to pipeline, show it moved.

## 2:10–2:45 — The build
> "The entire backend is Xano — data model, auth, and the research workflow that
> orchestrates SerpApi and Gemini in one function stack. Frontend is a small
> React app on GitHub Pages. Built solo in about a day with an AI coding agent.
> Without Xano I'd have spent that day on auth, migrations, and a deploy target
> instead of the thing that matters — the brief."

## Shot list / safety
- Pre-test the exact demo account; some companies return thin news.
  Good bets: a mid-size public SaaS company with recent news.
- If research is slow on camera, cut the spinner in edit — don't fake the result.
- Keep API keys out of frame (DevTools closed, no Xano env screen on camera).
