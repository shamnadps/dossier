import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./auth";
import Shell from "./components/Shell";
import Login from "./pages/Login";
import Pipeline from "./pages/Pipeline";
import AccountDetailPage from "./pages/AccountDetail";

function Protected({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  if (loading)
    return (
      <div className="empty">
        <span className="spinner" /> Loading…
      </div>
    );
  if (!user) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            element={
              <Protected>
                <Shell />
              </Protected>
            }
          >
            <Route path="/" element={<Pipeline />} />
            <Route path="/accounts/:id" element={<AccountDetailPage />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
