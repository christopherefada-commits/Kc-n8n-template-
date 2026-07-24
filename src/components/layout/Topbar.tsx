import { Search, Bell, Menu } from "lucide-react";
import { Avatar } from "@/components/ui";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  return (
    <header className="topbar">
      <button className="mobile-menu-btn" onClick={onMenuClick}>
        <Menu size={20} />
      </button>
      <div className="topbar-search">
        <Search size={16} />
        <input type="text" placeholder="Search…" />
      </div>
      <div className="topbar-spacer" />
      <div className="topbar-actions">
        <button className="icon-button" aria-label="Notifications">
          <Bell size={18} />
          <span className="badge-dot" />
        </button>
        <Avatar name="Workspace User" size="sm" />
      </div>
    </header>
  );
}
