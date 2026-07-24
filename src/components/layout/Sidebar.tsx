import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Store,
  Settings2,
  Rocket,
  Settings,
  Boxes,
} from "lucide-react";
import { APP_NAME, NAV_SECTIONS } from "@/lib/constants";
import type { NavIconName } from "@/lib/constants";
import { Avatar } from "@/components/ui";

const iconMap: Record<NavIconName, typeof LayoutDashboard> = {
  LayoutDashboard,
  Store,
  Settings2,
  Rocket,
  Settings,
  Boxes,
};

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  return (
    <>
      <div
        className={`sidebar-overlay ${open ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${open ? "open" : ""}`}>
        <div className="sidebar-brand">
          <div className="sidebar-brand-mark">
            <Boxes size={14} strokeWidth={2.5} />
          </div>
          {APP_NAME}
        </div>
        <nav className="sidebar-nav">
          {NAV_SECTIONS.map((section) => (
            <div key={section.label}>
              <div className="sidebar-section-label">{section.label}</div>
              {section.items.map((item) => {
                const Icon = iconMap[item.icon];
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      `sidebar-link ${isActive ? "active" : ""}`
                    }
                    onClick={onClose}
                  >
                    <Icon size={16} strokeWidth={1.75} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <Avatar name="Workspace User" size="sm" />
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Workspace</div>
              <div className="sidebar-user-plan">Free plan</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
