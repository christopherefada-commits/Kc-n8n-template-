import type { Automation } from "@platform";
import { Clock, GitBranch, Package } from "lucide-react";

interface AutomationCardProps {
  automation: Automation;
  onClick: () => void;
}

export function AutomationCard({ automation, onClick }: AutomationCardProps) {
  return (
    <div className="card card-hover" onClick={onClick} style={{ cursor: "pointer" }}>
      <div className="flex items-center gap-2 mb-4">
        <span style={{ fontSize: 26, flexShrink: 0 }}>{automation.icon}</span>
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
          {automation.name}
        </span>
      </div>
      <p
        className="text-muted text-sm mb-4"
        style={{
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
          minHeight: "3.9em",
        }}
      >
        {automation.description}
      </p>
      <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
        <span className="badge badge-primary">{automation.category}</span>
        <span className="badge">
          <Clock size={11} /> {automation.estimatedSetupTime}m
        </span>
        <span className="badge">
          <GitBranch size={11} /> {automation.nodeCount}
        </span>
        <span className="badge">
          <Package size={11} /> v{automation.version}
        </span>
      </div>
    </div>
  );
}

interface AutomationListItemProps {
  automation: Automation;
  onClick: () => void;
}

export function AutomationListItem({ automation, onClick }: AutomationListItemProps) {
  return (
    <div
      className="list-item"
      onClick={onClick}
      style={{ cursor: "pointer" }}
    >
      <div className="list-item-icon" style={{ fontSize: 18 }}>
        {automation.icon}
      </div>
      <div className="list-item-body">
        <div className="list-item-title">{automation.name}</div>
        <div className="list-item-subtitle">{automation.description}</div>
      </div>
      <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
        <span className="badge badge-primary">{automation.category}</span>
        <span className="badge">
          <GitBranch size={11} /> {automation.nodeCount}
        </span>
        <span className="badge">
          <Clock size={11} /> {automation.estimatedSetupTime}m
        </span>
      </div>
    </div>
  );
}
