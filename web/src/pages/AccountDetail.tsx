import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, ApiError } from "../api";
import type { AccountDetail, AccountStatus, ActivityType } from "../types";

const STATUSES: AccountStatus[] = ["lead", "qualified", "customer", "dormant"];

export default function AccountDetailPage() {
  const { id } = useParams();
  const accountId = Number(id);
  const [acct, setAcct] = useState<AccountDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [researching, setResearching] = useState(false);
  const [err, setErr] = useState("");

  function load() {
    setLoading(true);
    api
      .getAccount(accountId)
      .then(setAcct)
      .catch((e) =>
        setErr(e instanceof ApiError ? e.message : "Failed to load account"),
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [accountId]);

  async function runResearch() {
    setResearching(true);
    setErr("");
    try {
      setAcct(await api.research(accountId));
    } catch (e) {
      setErr(
        e instanceof ApiError ? e.message : "Research failed. Try again.",
      );
    } finally {
      setResearching(false);
    }
  }

  async function setStatus(status: AccountStatus) {
    if (!acct) return;
    setAcct({ ...acct, status });
    try {
      await api.updateAccountStatus(accountId, status);
    } catch {
      load();
    }
  }

  if (loading)
    return (
      <div className="empty">
        <span className="spinner" /> Loading…
      </div>
    );
  if (!acct) return <div className="error-banner">{err || "Not found"}</div>;

  return (
    <>
      <div className="page-head">
        <div>
          <div className="muted">
            <Link to="/">Pipeline</Link> / {acct.name}
          </div>
          <h1>{acct.name}</h1>
          <div className="muted">
            {acct.domain ? (
              <a
                href={`https://${acct.domain}`}
                target="_blank"
                rel="noreferrer"
              >
                {acct.domain}
              </a>
            ) : (
              "no domain"
            )}
            {acct.industry ? ` · ${acct.industry}` : ""}
          </div>
        </div>
        <button
          className="primary"
          onClick={runResearch}
          disabled={researching}
        >
          {researching && <span className="spinner" />}
          {acct.brief ? "Re-run research" : "Run research"}
        </button>
      </div>

      {err && <div className="error-banner">{err}</div>}

      <div className="row wrap" style={{ marginBottom: 20 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={acct.status === s ? "primary" : ""}
            onClick={() => setStatus(s)}
            style={{ textTransform: "capitalize" }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="detail-grid">
        <div className="stack">
          <BriefCard acct={acct} researching={researching} />
          <SignalsCard acct={acct} />
        </div>
        <div className="stack">
          <ContactsCard acct={acct} />
          <ActivityCard acct={acct} onChange={load} />
        </div>
      </div>
    </>
  );
}

function BriefCard({
  acct,
  researching,
}: {
  acct: AccountDetail;
  researching: boolean;
}) {
  const [copied, setCopied] = useState(false);
  const b = acct.brief;

  return (
    <div className="card card-pad">
      <div className="row between">
        <h3>AI Brief</h3>
        {b && (
          <span className="muted" style={{ fontSize: 12 }}>
            {new Date(b.generated_at).toLocaleString()}
          </span>
        )}
      </div>

      {!b && !researching && (
        <div className="muted">
          No brief yet. Run research to pull live signals and generate an
          account brief.
        </div>
      )}
      {researching && (
        <div className="muted">
          <span className="spinner" /> Pulling signals and writing the brief…
        </div>
      )}

      {b && (
        <div className="brief-body">
          <h4>Summary</h4>
          {b.summary_md}
          <h4>Buying signals</h4>
          {b.buying_signals_md}
          <h4>Recommended next step</h4>
          {b.recommended_action}
          <h4>Draft outreach</h4>
          <div className="outreach">{b.draft_outreach}</div>
          <button
            style={{ marginTop: 10 }}
            onClick={() => {
              navigator.clipboard?.writeText(b.draft_outreach);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
          >
            {copied ? "Copied ✓" : "Copy outreach"}
          </button>
        </div>
      )}
    </div>
  );
}

function SignalsCard({ acct }: { acct: AccountDetail }) {
  const signals = [...acct.signals].sort(
    (a, b) => b.relevance_score - a.relevance_score,
  );
  return (
    <div className="card card-pad">
      <h3>Signals ({signals.length})</h3>
      {signals.length === 0 && (
        <div className="muted">No signals pulled yet.</div>
      )}
      {signals.map((s) => (
        <div key={s.id} className="signal">
          <span className="score">{s.relevance_score}</span>
          <span className={`badge type`}>{s.type}</span>{" "}
          <span className="headline">
            {s.url ? (
              <a href={s.url} target="_blank" rel="noreferrer">
                {s.headline}
              </a>
            ) : (
              s.headline
            )}
          </span>
          <div className="meta">
            {s.source ?? "—"}
            {s.published_at ? ` · ${s.published_at}` : ""}
          </div>
        </div>
      ))}
    </div>
  );
}

function ContactsCard({ acct }: { acct: AccountDetail }) {
  return (
    <div className="card card-pad">
      <h3>Contacts ({acct.contacts.length})</h3>
      {acct.contacts.length === 0 && (
        <div className="muted">No contacts found.</div>
      )}
      {acct.contacts.map((c) => (
        <div key={c.id} style={{ padding: "8px 0" }}>
          <div style={{ fontWeight: 600 }}>{c.name}</div>
          <div className="muted" style={{ fontSize: 13 }}>
            {c.title ?? ""}
            {c.email ? ` · ${c.email}` : ""}
          </div>
          {c.linkedin_url && (
            <a href={c.linkedin_url} target="_blank" rel="noreferrer">
              LinkedIn
            </a>
          )}
        </div>
      ))}
    </div>
  );
}

function ActivityCard({
  acct,
  onChange,
}: {
  acct: AccountDetail;
  onChange: () => void;
}) {
  const [type, setType] = useState<ActivityType>("task");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);

  const activities = [...acct.activities].sort(
    (a, b) => b.created_at - a.created_at,
  );

  async function add(e: React.FormEvent) {
    e.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await api.addActivity(acct.id, { type, body: body.trim() });
      setBody("");
      onChange();
    } finally {
      setBusy(false);
    }
  }

  async function toggle(actId: number, done: boolean) {
    await api.toggleActivity(actId, done);
    onChange();
  }

  return (
    <div className="card card-pad">
      <h3>Activity</h3>
      <form onSubmit={add} className="stack" style={{ gap: 8 }}>
        <select
          value={type}
          onChange={(e) => setType(e.target.value as ActivityType)}
        >
          <option value="task">Task</option>
          <option value="note">Note</option>
          <option value="email">Email</option>
        </select>
        <input
          placeholder="Follow up next Tuesday…"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        <button disabled={busy}>Add</button>
      </form>

      <div style={{ marginTop: 12 }}>
        {activities.length === 0 && (
          <div className="muted">Nothing logged yet.</div>
        )}
        {activities.map((a) => (
          <div
            key={a.id}
            className={`activity ${a.done ? "done" : ""}`}
          >
            {a.type === "task" ? (
              <input
                type="checkbox"
                checked={a.done}
                onChange={(e) => toggle(a.id, e.target.checked)}
                style={{ width: "auto", marginTop: 3 }}
              />
            ) : (
              <span className="badge type">{a.type}</span>
            )}
            <div>
              <div className="body">{a.body}</div>
              <div className="when">
                {new Date(a.created_at).toLocaleDateString()}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
