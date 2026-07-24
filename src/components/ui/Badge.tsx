import type { ReactNode } from "react";

type Variant = "default" | "primary" | "success" | "warning" | "error";

interface BadgeProps {
  children: ReactNode;
  variant?: Variant;
}

const variantClass: Record<Variant, string> = {
  default: "",
  primary: "badge-primary",
  success: "badge-success",
  warning: "badge-warning",
  error: "badge-error",
};

export function Badge({ children, variant = "default" }: BadgeProps) {
  return <span className={`badge ${variantClass[variant]}`}>{children}</span>;
}
