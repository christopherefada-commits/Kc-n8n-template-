import { Loader as Loader2 } from "lucide-react";

interface SpinnerProps {
  size?: number;
  label?: string;
}

export function Spinner({ size = 24, label }: SpinnerProps) {
  return (
    <div className="spinner-container">
      <div className="flex items-center gap-2">
        <Loader2 size={size} className="spin" color="var(--color-primary)" />
        {label && <span className="text-muted">{label}</span>}
      </div>
    </div>
  );
}
