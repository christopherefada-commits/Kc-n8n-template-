import { Search, Bell, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { Avatar } from "@/components/ui";

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/repository": "Repository",
  "/marketplace": "Marketplace",
  "/configuration": "Configuration",
  "/deployments": "Deployments",
  "/settings": "Settings",
};

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const title = routeTitles[location.pathname] ?? "SynQdash";

  return (
    <header className="topbar">
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={18} />
      </button>
      <span className="topbar-title">{title}</span>
      <div className="topbar-search">
        <Search size={15} strokeWidth={1.75} />
        <input type="text" placeholder="Search" />
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={17} strokeWidth={1.75} />
          <span className="badge-dot" />
        </button>
        <Avatar name="Workspace User" size="sm" />
      </div>
    </header>
  );
}
