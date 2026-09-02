import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { ApiError } from "../api";

export default function Login() {
  const { login, signup } = useAuth();
  const nav = useNavigate();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr("");
    setBusy(true);
    try {
      if (mode === "signup") await signup(email, password, name);
      else await login(email, password);
      nav("/");
    } catch (e) {
      setErr(
        e instanceof ApiError ? e.message : "Something went wrong. Try again.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="auth-wrap">
      <form className="auth-card" onSubmit={submit}>
        <div className="logo">
          <span className="dot" />
          Dossier
        </div>
        <div className="tag">The CRM that shows up already briefed.</div>

        {err && <div className="error-banner">{err}</div>}

        {mode === "signup" && (
          <>
            <label>Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              autoComplete="name"
            />
          </>
        )}
        <label>Work email</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <label>Password</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          autoComplete={mode === "signup" ? "new-password" : "current-password"}
        />

        <button className="primary" disabled={busy}>
          {busy && <span className="spinner" />}
          {mode === "signup" ? "Create account" : "Sign in"}
        </button>

        <div className="switch">
          {mode === "signup" ? (
            <>
              Have an account?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setMode("login")}
              >
                Sign in
              </button>
            </>
          ) : (
            <>
              New here?{" "}
              <button
                type="button"
                className="link-btn"
                onClick={() => setMode("signup")}
              >
                Create an account
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}
