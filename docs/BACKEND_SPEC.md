# Dossier — Xano Backend Spec

Everything below gets built in the Xano workspace via the Xano MCP / CLI once the
CLI is authenticated. This is the source of truth for the build.

## Database tables

### `accounts`

| field | type | notes |
|---|---|---|
| id | int | pk |
| created_at | timestamp | auto |
| name | text | required |
| domain | text | nullable |
| industry | text | nullable, filled by research |
| status | enum(`lead`,`qualified`,`customer`,`dormant`) | default `lead` |
| owner_id | int | ref `users.id`, set from auth |

### `contacts`

| field | type | notes |
|---|---|---|
| id | int | pk |
| account_id | int | ref `accounts.id` |
| name | text | |
| title | text | nullable |
| email | text | nullable |
| linkedin_url | text | nullable |

### `signals`

| field | type | notes |
|---|---|---|
| id | int | pk |
| account_id | int | ref `accounts.id` |
| type | enum(`news`,`hiring`,`funding`,`tech`,`other`) | |
| headline | text | |
| url | text | nullable |
| source | text | nullable |
| published_at | text | nullable (as returned by SerpApi) |
| relevance_score | int | 0–100, set by the LLM |

### `briefs`

One current brief per account (re-run replaces).

| field | type | notes |
|---|---|---|
| id | int | pk |
| account_id | int | ref `accounts.id` |
| generated_at | timestamp | |
| summary_md | text | |
| buying_signals_md | text | |
| recommended_action | text | |
| draft_outreach | text | |

### `activities`

| field | type | notes |
|---|---|---|
| id | int | pk |
| created_at | timestamp | auto |
| account_id | int | ref `accounts.id` |
| type | enum(`note`,`task`,`email`) | |
| body | text | |
| due_at | timestamp | nullable |
| done | bool | default false |

## Environment variables (Xano workspace settings)

- `SERPAPI_KEY`
- `ANTHROPIC_API_KEY`
- `ANTHROPIC_MODEL` = `claude-sonnet-5`

## API group: `auth`

Use Xano's built-in auth template on the `users` table.

- `POST /auth/signup` → `{ email, password, name }` → creates user, returns `{ authToken }`
- `POST /auth/login` → `{ email, password }` → `{ authToken }`
- `GET /auth/me` → returns `{ id, name, email }` for the token

## API group: `main` (all require auth)

### `GET /accounts?status=`
Return accounts where `owner_id = auth.id`, optional `status` filter, newest first.

### `POST /accounts`
Input `{ name?, domain? }`. Require at least one. If `name` missing, derive a
placeholder from the domain (`acme.com` → `Acme`). Create with
`owner_id = auth.id`, `status = lead`. Return the row.

### `GET /accounts/{id}`
Guard `owner_id = auth.id`. Return the account plus:
`contacts[]`, `signals[]`, `brief` (latest or null), `activities[]`.

### `PATCH /accounts/{id}`
Input `{ status }`. Guard owner. Update, return the row.

### `POST /accounts/{id}/research` ← the centerpiece
Guard owner. Steps:

1. **Delete** existing `signals` and `briefs` for this account (clean re-run).
2. **SerpApi call 1 — news.** External API request:
   `GET https://serpapi.com/search.json`
   query: `engine=google_news`, `q="<account.name>"`, `api_key=$SERPAPI_KEY`.
   Take up to 8 `news_results` → `{title, link, source.name, date}`.
3. **SerpApi call 2 — web/about.** External API request:
   `GET https://serpapi.com/search.json`
   query: `engine=google`, `q="<account.name> company"`, `num=5`,
   `api_key=$SERPAPI_KEY`.
   Take `organic_results[].{title, link, snippet, source}` and
   `knowledge_graph` if present (for industry + description).
4. **Claude call.** POST `https://api.anthropic.com/v1/messages`
   headers: `x-api-key: $ANTHROPIC_API_KEY`, `anthropic-version: 2023-06-01`,
   `content-type: application/json`.
   body:
   ```json
   {
     "model": "$ANTHROPIC_MODEL",
     "max_tokens": 1400,
     "messages": [{ "role": "user", "content": "<PROMPT below>" }]
   }
   ```
   The prompt embeds the account name/domain + the JSON blobs from steps 2–3 and
   asks for a single JSON object back (see `RESEARCH_PROMPT.md`).
5. **Parse** the JSON from `content[0].text`.
6. **Write** `industry` back onto the account if returned and currently null.
7. **Insert** each `signals[]` item from the model output.
8. **Insert** one `briefs` row from `summary_md`, `buying_signals_md`,
   `recommended_action`, `draft_outreach`.
9. Return the same shape as `GET /accounts/{id}`.

Error handling: if SerpApi or Claude returns non-200, return a `502` with a
`message` the frontend can show; do not write partial data.

### `POST /accounts/{id}/activities`
Input `{ type, body, due_at? }`. Guard owner. Insert, return the row.

### `PATCH /activities/{id}`
Input `{ done }`. Guard owner via the parent account. Update, return the row.

## Static hosting

Frontend built from `/web` (`npm run build` → `web/dist`) is deployed to Xano
static hosting. `VITE_API_BASE` is set to the workspace API base URL
(`https://<xxxx>.xano.io/api:<main-group>`) at build time.
