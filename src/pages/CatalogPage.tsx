import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Search, Clock, GitBranch, Package } from "lucide-react";
import { loadCatalog, type AutomationCatalog } from "@platform";

export function CatalogPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<AutomationCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  useEffect(() => {
    loadCatalog().then(setCatalog).catch((e) => setError(e.message));
  }, []);

  const automations = useMemo(() => {
    if (!catalog) return [];
    return catalog.list({ search, category: category || undefined });
  }, [catalog, search, category]);

  const categories = useMemo(() => (catalog ? catalog.categories() : []), [catalog]);

  if (error) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <p>Failed to load the automation catalog.</p>
        <p style={{ fontSize: 13, marginTop: 8 }}>{error}</p>
      </div>
    );
  }

  if (!catalog) {
    return <div className="loading">Loading automation catalog…</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Automation Catalog</h1>
        <p className="page-subtitle">
          {catalog.count} automations ready to deploy. Choose one to configure and launch.
        </p>
      </div>

      <div className="toolbar">
        <div className="search-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search automations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="filter-select"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      {automations.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <p>No automations match your search.</p>
        </div>
      ) : (
        <div className="automation-grid">
          {automations.map((a) => (
            <div
              key={a.id}
              className="automation-card"
              onClick={() => navigate(`/automation/${a.id}`)}
            >
              <div className="automation-card-header">
                <span className="automation-card-icon">{a.icon}</span>
                <span className="automation-card-name">{a.name}</span>
              </div>
              <p className="automation-card-desc">{a.description}</p>
              <div className="automation-card-footer">
                <span className="badge badge-category">{a.category}</span>
                <span className="badge badge-time">
                  <Clock size={12} /> {a.estimatedSetupTime} min
                </span>
                <span className="badge badge-nodes">
                  <GitBranch size={12} /> {a.nodeCount} nodes
                </span>
                <span className="badge">
                  <Package size={12} /> v{a.version}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
