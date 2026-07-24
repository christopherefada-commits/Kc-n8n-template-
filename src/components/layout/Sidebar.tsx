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
          <div className="sidebar-brand-icon">
            <Boxes size={18} strokeWidth={2.5} />
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
                    <Icon size={18} />
                    {item.label}
                  </NavLink>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="list-item" style={{ border: "none", padding: "4px 8px" }}>
            <div className="list-item-icon">
              <Settings size={16} />
            </div>
            <div className="list-item-body">
              <div className="list-item-title text-sm">Workspace</div>
              <div className="list-item-subtitle">Free plan</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
