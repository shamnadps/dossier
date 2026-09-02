import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api, ApiError } from "../api";
import type { Account, AccountStatus } from "../types";

const STATUSES: (AccountStatus | "all")[] = [
  "all",
  "lead",
  "qualified",
  "customer",
  "dormant",
];

export default function Pipeline() {
  const nav = useNavigate();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [filter, setFilter] = useState<AccountStatus | "all">("all");
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [showNew, setShowNew] = useState(false);

  function load() {
    setLoading(true);
    api
      .listAccounts(filter === "all" ? undefined : filter)
      .then(setAccounts)
      .catch((e) =>
        setErr(e instanceof ApiError ? e.message : "Failed to load accounts"),
      )
      .finally(() => setLoading(false));
  }

  useEffect(load, [filter]);

  return (
    <>
      <div className="page-head">
        <div>
          <h1>Pipeline</h1>
          <div className="muted">{accounts.length} accounts</div>
        </div>
        <button className="primary" onClick={() => setShowNew(true)}>
          + New account
        </button>
      </div>

      {err && <div className="error-banner">{err}</div>}

      <div className="row wrap" style={{ marginBottom: 16 }}>
        {STATUSES.map((s) => (
          <button
            key={s}
            className={filter === s ? "primary" : ""}
            onClick={() => setFilter(s)}
            style={{ textTransform: "capitalize" }}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="empty">
          <span className="spinner" /> Loading…
        </div>
      ) : accounts.length === 0 ? (
        <div className="empty">
          No accounts yet. Add one and run research to see Dossier work.
        </div>
      ) : (
        <table className="acct-table">
          <thead>
            <tr>
              <th>Account</th>
              <th>Domain</th>
              <th>Industry</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {accounts.map((a) => (
              <tr key={a.id} onClick={() => nav(`/accounts/${a.id}`)}>
                <td className="acct-name">{a.name}</td>
                <td className="muted">{a.domain ?? "—"}</td>
                <td className="muted">{a.industry ?? "—"}</td>
                <td>
                  <span className={`badge ${a.status}`}>{a.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {showNew && (
        <NewAccountModal
          onClose={() => setShowNew(false)}
          onCreated={(a) => {
            setShowNew(false);
            nav(`/accounts/${a.id}`);
          }}
        />
      )}
    </>
  );
}

function NewAccountModal({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (a: Account) => void;
}) {
  const [name, setName] = useState("");
  const [domain, setDomain] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!name && !domain) {
      setErr("Enter a company name or a domain.");
      return;
    }
    setBusy(true);
    setErr("");
    try {
      const a = await api.createAccount({
        name: name || undefined,
        domain: domain || undefined,
      });
      onCreated(a);
    } catch (e) {
      setErr(e instanceof ApiError ? e.message : "Failed to create account");
      setBusy(false);
    }
  }

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form
        className="modal"
        onClick={(e) => e.stopPropagation()}
        onSubmit={create}
      >
        <h2>New account</h2>
        <div className="muted">
          Give a name or a domain — research fills in the rest.
        </div>
        {err && (
          <div className="error-banner" style={{ marginTop: 12 }}>
            {err}
          </div>
        )}
        <div className="field">
          <label>Company name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div className="field">
          <label>Domain</label>
          <input
            placeholder="acme.com"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
          />
        </div>
        <div className="actions">
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            {busy && <span className="spinner" />}
            Create
          </button>
        </div>
      </form>
    </div>
  );
}
