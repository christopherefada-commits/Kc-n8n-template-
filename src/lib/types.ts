/** Shared type definitions for SynQdash UI components and app state. */

export type ToastVariant = "success" | "error" | "info";

export interface ToastMessage {
  id: string;
  message: string;
  variant: ToastVariant;
}

export type ThemeMode = "light" | "dark";

export interface User {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
}

export type DeploymentStatus = "pending" | "deployed" | "failed" | "archived";

export interface NavItem {
  to: string;
  label: string;
  icon: string;
}

export interface NavSection {
  label: string;
  items: NavItem[];
}
