import { useEffect, useState } from "react";
import { Rocket, GitBranch, RefreshCw, FileText } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardHeader, Badge, Button } from "@/components/ui";
import { listDeployments, loadCatalog, type AutomationCatalog } from "@platform";
import type { Deployment } from "@platform";
import { useApp } from "@/state/AppContext";

export function DeploymentsPage() {
  const { showToast } = useApp();
  const [deployments, setDeployments] = useState<Deployment[]>([]);
  const [catalog, setCatalog] = useState<AutomationCatalog | null>(null);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    try {
      const [deps, cat] = await Promise.all([listDeployments(), loadCatalog()]);
      setDeployments(deps);
      setCatalog(cat);
    } catch {
      showToast("Failed to load deployments", "error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div>
      <PageHeader
        title="Deployments"
        subtitle="Manage your deployed automations and their status."
        action={
          <Button variant="secondary" onClick={load} disabled={loading}>
            <RefreshCw size={16} className={loading ? "spin" : ""} /> Refresh
          </Button>
        }
      />

      {loading ? (
        <div className="spinner-container">Loading deployments…</div>
      ) : deployments.length === 0 ? (
        <EmptyState
          icon={<Rocket size={28} />}
          title="No deployments yet"
          description="Browse the Marketplace and deploy an automation to get started."
          action={
            <Button onClick={() => (window.location.href = "/marketplace")}>
              Browse Marketplace
            </Button>
          }
        />
      ) : (
        <Card>
          <CardHeader title={`Active Deployments (${deployments.length})`} />
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Automation</th>
                  <th>Status</th>
                  <th>Nodes</th>
                  <th>Deployed</th>
                </tr>
              </thead>
              <tbody>
                {deployments.map((d) => {
                  const auto = catalog?.get(d.automationId);
                  return (
                    <tr key={d.id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="list-item-icon" style={{ width: 28, height: 28 }}>
                            <FileText size={14} strokeWidth={1.75} />
                          </div>
                          <span style={{ fontWeight: 600 }}>
                            {auto?.name ?? d.automationId}
                          </span>
                        </div>
                      </td>
                      <td>
                        <Badge
                          variant={
                            d.status === "deployed"
                              ? "success"
                              : d.status === "failed"
                                ? "error"
                                : d.status === "pending"
                                  ? "warning"
                                  : "default"
                          }
                        >
                          {d.status}
                        </Badge>
                      </td>
                      <td>
                        <span className="flex items-center gap-2 text-muted">
                          <GitBranch size={13} /> {d.nodeCount}
                        </span>
                      </td>
                      <td className="text-muted text-sm">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
