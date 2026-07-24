import { Outlet, NavLink } from "react-router-dom";
import { Zap } from "lucide-react";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-logo">
          <div className="app-logo-icon">
            <Zap size={18} color="white" strokeWidth={2.5} />
          </div>
          Automation Platform
        </div>
        <nav className="app-nav">
          <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
            Catalog
          </NavLink>
          <NavLink to="/deployments" className={({ isActive }) => (isActive ? "active" : "")}>
            Deployments
          </NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
