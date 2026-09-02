import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Shell() {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="logo">
          <span className="dot" />
          Dossier
        </div>
        <nav>
          <NavLink to="/" end>
            Pipeline
          </NavLink>
        </nav>
        <div className="spacer" />
        <div className="user-box">
          <div className="name">{user?.name ?? "—"}</div>
          <div style={{ color: "#9ca3af" }}>{user?.email}</div>
          <button
            onClick={() => {
              logout();
              nav("/login");
            }}
          >
            Sign out
          </button>
        </div>
      </aside>
      <main className="main">
        <Outlet />
      </main>
    </div>
  );
}
