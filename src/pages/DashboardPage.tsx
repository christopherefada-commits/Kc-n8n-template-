import { Boxes, Rocket, Store, Clock, RefreshCw, ArrowUpRight } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardHeader, Badge, Button } from "@/components/ui";
import { useApp } from "@/state/AppContext";

const stats = [
  { label: "Total Automations", value: "321", icon: Boxes, trend: "+12 this week", up: true },
  { label: "Active Deployments", value: "1", icon: Rocket, trend: "+1 today", up: true },
  { label: "Marketplace Items", value: "321", icon: Store, trend: "Browse catalog", up: true },
  { label: "Avg Setup Time", value: "4m", icon: Clock, trend: "-2m vs last month", up: true },
];

const recentActivity = [
  { action: "Deployed", target: "Telegram Recipe Bot", time: "2h ago", status: "deployed" },
  { action: "Configured", target: "AI Email Auto-Responder", time: "5h ago", status: "pending" },
  { action: "Discovered", target: "321 workflow templates", time: "1d ago", status: "deployed" },
];

export function DashboardPage() {
  const { showToast } = useApp();

  return (
    <div>
      <PageHeader
        title="Dashboard"
        subtitle="Overview of your automation platform activity."
        action={
          <Button variant="secondary" onClick={() => showToast("Refreshed dashboard data", "success")}>
            <RefreshCw size={14} strokeWidth={1.75} /> Refresh
          </Button>
        }
      />

      <div className="stat-grid">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <div key={s.label} className="stat-card">
              <div className="stat-card-label">
                <Icon size={13} strokeWidth={1.75} /> {s.label}
              </div>
              <div className="stat-card-value">{s.value}</div>
              <div className={`stat-card-trend ${s.up ? "up" : "down"}`}>
                <ArrowUpRight size={11} strokeWidth={1.75} /> {s.trend}
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-2">
        <Card>
          <CardHeader title="Recent Activity" />
          <div className="list">
            {recentActivity.map((item, i) => (
              <div className="list-item" key={i}>
                <div className="list-item-body">
                  <div className="list-item-title">{item.target}</div>
                  <div className="list-item-subtitle">
                    {item.action} · {item.time}
                  </div>
                </div>
                <Badge
                  variant={
                    item.status === "deployed"
                      ? "success"
                      : item.status === "pending"
                        ? "warning"
                        : "default"
                  }
                >
                  {item.status}
                </Badge>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <CardHeader title="Quick Actions" />
          <div className="list">
            <div className="list-item">
              <div className="list-item-body">
                <div className="list-item-title">Browse Marketplace</div>
                <div className="list-item-subtitle">Discover new automation templates</div>
              </div>
              <Button variant="secondary" size="sm">Open</Button>
            </div>
            <div className="list-item">
              <div className="list-item-body">
                <div className="list-item-title">Deploy Automation</div>
                <div className="list-item-subtitle">Configure and launch a workflow</div>
              </div>
              <Button variant="secondary" size="sm">Start</Button>
            </div>
            <div className="list-item">
              <div className="list-item-body">
                <div className="list-item-title">View Deployments</div>
                <div className="list-item-subtitle">Manage your active automations</div>
              </div>
              <Button variant="secondary" size="sm">View</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
