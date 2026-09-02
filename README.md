# Dossier

**The CRM account page that shows up to the meeting already briefed.**

Add a company by name or domain, hit **Run research**, and Dossier pulls live
Google News + web results (SerpApi) and turns them into an AI account brief:
a summary, cited buying signals, a recommended next step, and a drafted outreach
email — with every claim traceable to a source URL.

Built for the DevNetwork [API + Cloud + AI] Hackathon 2026 —
**Xano** (Rebuild a SaaS Tool You Hate) + **SerpApi** (Best AI Use Case).

## Stack

| Layer | Tech |
|---|---|
| Backend | Xano — data model, auth, and the research function stack |
| External data | SerpApi (`google_news` + `google` engines) |
| AI | Claude Messages API (`claude-sonnet-5`) |
| Frontend | React + Vite + TypeScript, hosted on Xano static hosting |

## Repo layout

```
web/            React frontend
docs/
  BACKEND_SPEC.md     Xano tables + endpoints (source of truth for the build)
  RESEARCH_PROMPT.md  the Claude prompt used by /accounts/{id}/research
  DEMO_SCRIPT.md      video script
  SUBMISSION.md       Devpost write-up
```

## Frontend — local dev

```sh
cd web
npm install
echo "VITE_API_BASE=https://<your-xano>.xano.io/api:<main-group>" > .env.local
npm run dev
```

## Backend — Xano

The backend is built in a Xano workspace from `docs/BACKEND_SPEC.md`.
Required workspace environment variables:

- `SERPAPI_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` = `claude-sonnet-5`

## Deploy

```sh
cd web && npm run build        # -> web/dist
# deploy web/dist to Xano static hosting (xano CLI)
```
