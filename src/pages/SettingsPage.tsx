import { useState } from "react";
import { Settings, User, Bell, Palette, Shield } from "lucide-react";
import { PageHeader } from "@/components/common";
import { Card, CardHeader, Button, Input, Toggle, Badge } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";

type Tab = "profile" | "notifications" | "appearance" | "security";

const tabs: { id: Tab; label: string; icon: typeof User }[] = [
  { id: "profile", label: "Profile", icon: User },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
];

export function SettingsPage() {
  const { showToast } = useApp();
  const [tab, setTab] = useState<Tab>("profile");
  const [name, setName] = useLocalStorage("synqdash:userName", "Workspace User");
  const [email, setEmail] = useLocalStorage("synqdash:userEmail", "user@synqdash.io");
  const [emailNotifs, setEmailNotifs] = useLocalStorage("synqdash:emailNotifs", true);
  const [deployNotifs, setDeployNotifs] = useLocalStorage("synqdash:deployNotifs", true);
  const [compactMode, setCompactMode] = useLocalStorage("synqdash:compactMode", false);

  return (
    <div>
      <PageHeader title="Settings" subtitle="Manage your account and platform preferences." />

      <div className="flex gap-3 mb-4" style={{ flexWrap: "wrap" }}>
        {tabs.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`btn btn-sm ${active ? "btn-primary" : "btn-secondary"}`}
            >
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>

      {tab === "profile" && (
        <Card>
          <CardHeader title="Profile Information" />
          <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} />
          <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          <Button onClick={() => showToast("Profile updated", "success")}>
            <Settings size={16} /> Save Profile
          </Button>
        </Card>
      )}

      {tab === "notifications" && (
        <Card>
          <CardHeader title="Notification Preferences" />
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Email notifications</div>
              <div className="setting-row-desc">Receive platform updates via email.</div>
            </div>
            <Toggle on={emailNotifs} onChange={setEmailNotifs} />
          </div>
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Deployment alerts</div>
              <div className="setting-row-desc">Get notified when deployments succeed or fail.</div>
            </div>
            <Toggle on={deployNotifs} onChange={setDeployNotifs} />
          </div>
        </Card>
      )}

      {tab === "appearance" && (
        <Card>
          <CardHeader title="Appearance" />
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Compact mode</div>
              <div className="setting-row-desc">Reduce spacing and padding throughout the interface.</div>
            </div>
            <Toggle on={compactMode} onChange={setCompactMode} />
          </div>
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Theme</div>
              <div className="setting-row-desc">SynQdash uses a white and dark orange color scheme. Dark mode is coming soon.</div>
            </div>
            <Badge>Light</Badge>
          </div>
        </Card>
      )}

      {tab === "security" && (
        <Card>
          <CardHeader title="Security" />
          <Input label="Current Password" type="password" placeholder="••••••••" />
          <Input label="New Password" type="password" placeholder="••••••••" />
          <Input label="Confirm New Password" type="password" placeholder="••••••••" />
          <Button onClick={() => showToast("Password updated", "success")}>
            <Shield size={16} /> Update Password
          </Button>
        </Card>
      )}
    </div>
  );
}
