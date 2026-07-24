import { CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Info, X } from "lucide-react";
import { useApp } from "@/state/AppContext";
import type { ToastMessage, ToastVariant } from "@/lib/types";

const iconMap: Record<ToastVariant, typeof CheckCircle2> = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
};

const colorMap: Record<ToastVariant, string> = {
  success: "var(--color-success)",
  error: "var(--color-error)",
  info: "var(--color-primary)",
};

export function ToastContainer() {
  const { toasts, dismissToast } = useApp();

  return (
    <div className="toast-container">
      {toasts.map((toast: ToastMessage) => {
        const Icon = iconMap[toast.variant];
        return (
          <div key={toast.id} className={`toast ${toast.variant}`}>
            <Icon size={18} color={colorMap[toast.variant]} />
            <span style={{ flex: 1 }}>{toast.message}</span>
            <button
              onClick={() => dismissToast(toast.id)}
              style={{ color: "var(--color-text-dim)" }}
            >
              <X size={14} />
            </button>
          </div>
        );
      })}
    </div>
  );
}
