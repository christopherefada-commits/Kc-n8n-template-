import { Boxes, Layers, GitBranch, Clock, Tag } from "lucide-react";
import type { CatalogStats } from "@platform";
import { formatNumber } from "@/lib/utils";

interface RepositoryStatsProps {
  stats: CatalogStats;
}

export function RepositoryStats({ stats }: RepositoryStatsProps) {
  const items = [
    { label: "Total Automations", value: formatNumber(stats.total), icon: Boxes },
    { label: "Categories", value: formatNumber(stats.categories), icon: Layers },
    { label: "Total Nodes", value: formatNumber(stats.totalNodes), icon: GitBranch },
    { label: "Avg Setup Time", value: `${stats.avgSetupTime}m`, icon: Clock },
    { label: "Tags", value: formatNumber(stats.tags), icon: Tag },
    { label: "Active", value: formatNumber(stats.active), icon: Boxes },
  ];

  return (
    <div className="stat-grid">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div key={item.label} className="stat-card">
            <div className="stat-card-label">
              <Icon size={13} strokeWidth={1.75} /> {item.label}
            </div>
            <div className="stat-card-value">{item.value}</div>
          </div>
        );
      })}
    </div>
  );
}
