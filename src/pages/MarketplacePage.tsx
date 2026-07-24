import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Store, Search, Clock, GitBranch, Package } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, Badge, Input } from "@/components/ui";
import { loadCatalog, type AutomationCatalog } from "@platform";
import { useEffect } from "react";

export function MarketplacePage() {
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
      <div>
        <PageHeader title="Marketplace" subtitle="Browse and install automation templates." />
        <EmptyState
          icon={<Store size={28} />}
          title="Could not load the marketplace"
          description={error}
        />
      </div>
    );
  }

  if (!catalog) {
    return (
      <div>
        <PageHeader title="Marketplace" subtitle="Browse and install automation templates." />
        <div className="spinner-container">Loading marketplace…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Marketplace"
        subtitle={`${catalog.count} automation templates ready to deploy.`}
      />

      <div className="flex items-center gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, maxWidth: 400 }}>
          <Search
            size={16}
            style={{
              position: "absolute",
              left: 11,
              top: "50%",
              transform: "translateY(-50%)",
              color: "var(--color-text-dim)",
            }}
          />
          <input
            className="input-field"
            style={{ paddingLeft: 36 }}
            placeholder="Search automations…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          style={{ width: "auto", minWidth: 180 }}
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
        <EmptyState
          icon={<Search size={28} />}
          title="No automations found"
          description="Try adjusting your search or filter."
        />
      ) : (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {automations.map((a) => (
            <Card key={a.id} hover onClick={() => navigate(`/automation/${a.id}`)}>
              <div className="flex items-center gap-2 mb-4">
                <span style={{ fontSize: 26 }}>{a.icon}</span>
                <span
                  style={{
                    fontWeight: 600,
                    fontSize: 14,
                    lineHeight: 1.3,
                    display: "-webkit-box",
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden",
                  }}
                >
                  {a.name}
                </span>
              </div>
              <p
                className="text-muted text-sm mb-4"
                style={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                }}
              >
                {a.description}
              </p>
              <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
                <Badge variant="primary">{a.category}</Badge>
                <Badge>
                  <Clock size={11} /> {a.estimatedSetupTime}m
                </Badge>
                <Badge>
                  <GitBranch size={11} /> {a.nodeCount}
                </Badge>
                <Badge>
                  <Package size={11} /> v{a.version}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
