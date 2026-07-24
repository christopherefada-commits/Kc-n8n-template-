/** Application-wide constants for SynQdash. */

export const APP_NAME = "SynQdash";
export const APP_TAGLINE = "Automation Deployment Platform";

export const NAV_SECTIONS = [
  {
    label: "Overview",
    items: [
      { to: "/dashboard", label: "Dashboard", icon: "LayoutDashboard" },
      { to: "/repository", label: "Repository", icon: "Boxes" },
      { to: "/marketplace", label: "Marketplace", icon: "Store" },
    ],
  },
  {
    label: "Platform",
    items: [
      { to: "/configuration", label: "Configuration", icon: "Settings2" },
      { to: "/deployments", label: "Deployments", icon: "Rocket" },
      { to: "/settings", label: "Settings", icon: "Settings" },
    ],
  },
] as const;

export type NavIconName = (typeof NAV_SECTIONS)[number]["items"][number]["icon"];
