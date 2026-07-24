import { Save, Settings2 } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/common";
import { Card, CardHeader, Button, Input, Select, Toggle, Field } from "@/components/ui";
import { useApp } from "@/state/AppContext";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { useState } from "react";

export function ConfigurationPage() {
  const { showToast } = useApp();
  const [workspaceName, setWorkspaceName] = useLocalStorage("synqdash:workspaceName", "My Workspace");
  const [defaultRegion, setDefaultRegion] = useLocalStorage("synqdash:region", "us-east-1");
  const [autoDeploy, setAutoDeploy] = useLocalStorage("synqdash:autoDeploy", false);
  const [notifications, setNotifications] = useLocalStorage("synqdash:notifications", true);
  const [apiKey, setApiKey] = useState("");

  return (
    <div>
      <PageHeader
        title="Configuration Engine"
        subtitle="Manage workspace settings and deployment configuration defaults."
      />

      <div className="grid grid-2">
        <Card>
          <CardHeader title="Workspace Settings" />
          <Input
            label="Workspace Name"
            value={workspaceName}
            onChange={(e) => setWorkspaceName(e.target.value)}
          />
          <Select
            label="Default Deployment Region"
            value={defaultRegion}
            onChange={setDefaultRegion}
            options={[
              { label: "US East (Virginia)", value: "us-east-1" },
              { label: "US West (Oregon)", value: "us-west-2" },
              { label: "EU (Frankfurt)", value: "eu-central-1" },
              { label: "Asia Pacific (Singapore)", value: "ap-southeast-1" },
            ]}
          />
          <Input
            label="Platform API Key"
            type="password"
            placeholder="Enter API key…"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            hint="Used for authenticating deployment requests."
          />
          <Button onClick={() => showToast("Workspace settings saved", "success")}>
            <Save size={14} strokeWidth={1.75} /> Save Settings
          </Button>
        </Card>

        <Card>
          <CardHeader title="Deployment Defaults" />
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Auto-deploy after configuration</div>
              <div className="setting-row-desc">
                Automatically deploy automations once all required fields are filled.
              </div>
            </div>
            <Toggle on={autoDeploy} onChange={setAutoDeploy} />
          </div>
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Deployment notifications</div>
              <div className="setting-row-desc">
                Receive a notification when a deployment succeeds or fails.
              </div>
            </div>
            <Toggle on={notifications} onChange={setNotifications} />
          </div>
          <div className="setting-row">
            <div className="setting-row-info">
              <div className="setting-row-title">Configuration validation</div>
              <div className="setting-row-desc">
                Validate all config values against the schema before deploying.
              </div>
            </div>
            <Toggle on={true} onChange={() => {}} />
          </div>
          <Field label="Retry Policy" hint="Number of retry attempts on deployment failure.">
            <Select
              value="3"
              onChange={() => {}}
              options={[
                { label: "1 attempt", value: "1" },
                { label: "3 attempts", value: "3" },
                { label: "5 attempts", value: "5" },
              ]}
            />
          </Field>
        </Card>
      </div>

      <div className="mt-4">
        <Card>
          <CardHeader title="Configuration Schema Preview" />
          <EmptyState
            icon={<Settings2 size={28} />}
            title="No automation selected"
            description="Select an automation from the Marketplace to preview its configuration schema."
          />
        </Card>
      </div>
    </div>
  );
}
