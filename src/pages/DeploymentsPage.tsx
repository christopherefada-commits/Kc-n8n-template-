import { useEffect, useState } from "react";
import { Rocket, GitBranch } from "lucide-react";
import { listDeployments, loadCatalog, type AutomationCatalog } from "@platform";
import type { Deployment } from "@platform";

export function DeploymentsPage() {
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [catalog, setCatalog] = useState<AutomationCatalog | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([listDeployments(), loadCatalog()])
      .then(([deps, cat]) => {
        setDeployments(deps);
        setCatalog(cat);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading">Loading deployments…</div>;
  if (error)
    return (
      <div className="empty-state">
        <div className="empty-state-icon">⚠️</div>
        <p>{error}</p>
      </div>
    );

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Deployments</h1>
        <p className="page-subtitle">
          All automations you have deployed with injected configurations.
        </p>
      </div>

      {deployments.length === 0 ? (
        <div className="empty-state">
          <Rocket size={48} color="var(--color-text-dim)" />
          <p style={{ marginTop: 16 }}>No deployments yet.</p>
          <p style={{ fontSize: 14, marginTop: 4 }}>
            Browse the catalog and deploy an automation to get started.
          </p>
        </div>
      ) : (
        <div className="deployment-list">
          {deployments.map((d) => {
            const auto = catalog?.get(d.automationId);
            return (
              <div className="deployment-item" key={d.id}>
                <span style={{ fontSize: 28 }}>{auto?.icon ?? "⚡"}</span>
                <div className="deployment-info">
                  <div className="deployment-name">
                    {auto?.name ?? d.automationId}
                  </div>
                  <div className="deployment-meta">
                    <span className={`status-dot ${d.status}`} />
                    {d.status} · {d.nodeCount} nodes ·{" "}
                    {new Date(d.createdAt).toLocaleString()}
                  </div>
                </div>
                <span className="badge badge-nodes">
                  <GitBranch size={12} /> {d.nodeCount} nodes
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
