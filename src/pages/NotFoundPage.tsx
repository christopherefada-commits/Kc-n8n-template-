import { useNavigate } from "react-router-dom";
import { Chrome as Home } from "lucide-react";
import { Button } from "@/components/ui";

export function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <div className="empty-state" style={{ paddingTop: "120px" }}>
      <div style={{ fontSize: 48, fontWeight: 700, color: "var(--color-primary)" }}>404</div>
      <div className="empty-state-title" style={{ marginTop: 12 }}>
        Page not found
      </div>
      <div className="empty-state-desc">
        The page you're looking for doesn't exist or has been moved.
      </div>
      <Button onClick={() => navigate("/dashboard")}>
        <Home size={16} /> Back to Dashboard
      </Button>
    </div>
  );
}
