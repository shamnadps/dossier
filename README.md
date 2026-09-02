# Dossier

**The CRM account page that shows up to the meeting already briefed.**

Add a company by name or domain, hit **Run research**, and Dossier pulls live
Google News + web results (SerpApi) and turns them into an AI account brief (Gemini):
a summary, cited buying signals, a recommended next step, and a drafted outreach
email — with every claim traceable to a source URL.

Built for the DevNetwork [API + Cloud + AI] Hackathon 2026 —
**Xano** (Rebuild a SaaS Tool You Hate) + **SerpApi** (Best AI Use Case).

## Stack

| Layer | Tech |
|---|---|
| Backend | Xano — data model, auth, and the research function stack |
| External data | SerpApi (`google_news` + `google` engines) |
| AI | Google Gemini API (`gemini-3.6-flash`) |
| Frontend | React + Vite + TypeScript, hosted on GitHub Pages |

## Repo layout

```
web/            React frontend
docs/
  BACKEND_SPEC.md     Xano tables + endpoints (source of truth for the build)
  RESEARCH_PROMPT.md  the Gemini prompt used by /accounts/{id}/research
  DEMO_SCRIPT.md      video script
  SUBMISSION.md       Devpost write-up
```

## Frontend — local dev

```sh
cd web
npm install
cp .env.example .env.local   # then fill in your Xano API base URLs
npm run dev
```

## Backend — Xano

The backend is built in a Xano workspace from `docs/BACKEND_SPEC.md`.
Required workspace environment variables:

- `SERPAPI_KEY`
- `GEMINI_API_KEY`

## Deploy

The built frontend (`web/dist`) is published to the `gh-pages` branch, served at
https://shamnadps.github.io/dossier/ . To redeploy:

```sh
cd web && npm run build
cd dist && git init -q && git checkout -b gh-pages && git add -A \
  && git commit -qm deploy \
  && git push -f https://github.com/shamnadps/dossier.git gh-pages
```
