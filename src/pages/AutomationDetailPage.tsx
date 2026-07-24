import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Clock, GitBranch, Package, CircleCheck as CheckCircle2, CircleAlert as AlertCircle, Loader as Loader2, Settings, Zap } from "lucide-react";
import {
  loadAutomation,
  ConfigurationEngine,
  type FormDefinition,
  type Automation,
  type ValidationResult,
} from "@platform";
import { listConfigs, saveConfig, createDeployment } from "@platform";

const configEngine = new ConfigurationEngine();

export function AutomationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [automation, setAutomation] = useState<Automation | null>(null);
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [configName, setConfigName] = useState("");
  const [values, setValues] = useState<Record<string, string | number | boolean>>({});
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [deploying, setDeploying] = useState(false);
  const [deployResult, setDeployResult] = useState<
    { ok: true; deploymentId: string } | { ok: false; message: string } | null
  >();
  const [savedConfigs, setSavedConfigs] = useState<
    { id: string; name: string; createdAt: string }[]
  >([]);

  useEffect(() => {
    if (!id) return;
    loadAutomation(id)
      .then((a: Automation | undefined) => {
        if (!a) {
          setError("Automation not found.");
          setLoading(false);
          return;
        }
        setAutomation(a);
        setForm(configEngine.generateForm(a));
        const defaults: Record<string, string | number | boolean> = {};
        for (const g of configEngine.generateForm(a).groups) {
          for (const f of g.fields) {
            if (f.defaultValue !== undefined) defaults[f.id] = f.defaultValue;
          }
        }
        setValues(defaults);
        setConfigName(`${a.name} — Default Config`);
        setLoading(false);
      })
      .catch((e: Error) => {
        setError(e.message);
        setLoading(false);
      });
    listConfigs(id!).then(setSavedConfigs).catch(() => {});
  }, [id]);

  function handleDeploy() {
    if (!automation) return;
    const result = configEngine.validate(automation, values);
    setValidation(result);
    if (!result.valid) return;

    setDeploying(true);
    setDeployResult(null);

    fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/deploy-automation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        automationId: automation.id,
        configName,
        values,
      }),
    })
      .then(async (res) => {
        const body = await res.json();
        if (!res.ok) throw new Error(body.error || `Deployment failed (${res.status})`);
        setDeployResult({ ok: true, deploymentId: body.deploymentId });
        listConfigs(automation.id).then(setSavedConfigs).catch(() => {});
      })
      .catch((e) => {
        setDeployResult({ ok: false, message: e.message });
      })
      .finally(() => setDeploying(false));
  }

  if (loading) return <div className="loading">Loading automation…</div>;
  if (error)
    return (
      <div className="empty-state">
        <AlertCircle size={48} color="var(--color-error)" />
        <p style={{ marginTop: 16 }}>{error}</p>
      </div>
    );
  if (!automation || !form) return null;

  return (
    <div>
      <button className="detail-back" onClick={() => navigate("/")}>
        <ArrowLeft size={16} /> Back to catalog
      </button>

      <div className="detail-header">
        <span className="detail-icon">{automation.icon}</span>
        <div style={{ flex: 1 }}>
          <h1 className="detail-title">{automation.name}</h1>
          <p className="detail-desc">{automation.description}</p>
          <div className="detail-meta">
            <span className="badge badge-category">{automation.category}</span>
            <span className="badge badge-time">
              <Clock size={12} /> {automation.estimatedSetupTime} min setup
            </span>
            <span className="badge badge-nodes">
              <GitBranch size={12} /> {automation.nodeCount} nodes
            </span>
            <span className="badge">
              <Package size={12} /> v{automation.version}
            </span>
          </div>
        </div>
      </div>

      <div className="detail-body">
        {/* Left: config form */}
        <div className="detail-section">
          <h2 className="detail-section-title">
            <Settings size={18} /> Configuration
          </h2>
          <p style={{ fontSize: 14, color: "var(--color-text-muted)", marginBottom: 16 }}>
            {form.summary}
          </p>

          <div className="config-name-input">
            <label className="form-field-label">Configuration Name</label>
            <input
              className="form-input"
              value={configName}
              onChange={(e) => setConfigName(e.target.value)}
              placeholder="e.g. Production Config"
            />
          </div>

          {form.groups.map((group) => (
            <div className="form-group" key={group.name}>
              <div className="form-group-title">{group.name}</div>
              {group.fields.map((field) => {
                const fieldError = validation?.errors.find((e) => e.fieldId === field.id);
                return (
                  <div className="form-field" key={field.id}>
                    <label className="form-field-label">
                      {field.label}
                      {field.required && <span className="req">*</span>}
                    </label>
                    {field.description && (
                      <div className="form-field-desc">{field.description}</div>
                    )}
                    {field.inputType === "select" ? (
                      <select
                        className={`form-input ${fieldError ? "error" : ""}`}
                        value={(values[field.id] as string) ?? ""}
                        onChange={(e) =>
                          setValues({ ...values, [field.id]: e.target.value })
                        }
                      >
                        <option value="">Select…</option>
                        {field.options?.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </select>
                    ) : field.inputType === "checkbox" ? (
                      <input
                        type="checkbox"
                        checked={Boolean(values[field.id])}
                        onChange={(e) =>
                          setValues({ ...values, [field.id]: e.target.checked })
                        }
                      />
                    ) : field.inputType === "textarea" ? (
                      <textarea
                        className={`form-input ${fieldError ? "error" : ""}`}
                        value={(values[field.id] as string) ?? ""}
                        onChange={(e) =>
                          setValues({ ...values, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder ?? ""}
                      />
                    ) : (
                      <input
                        type={field.inputType}
                        className={`form-input ${fieldError ? "error" : ""}`}
                        value={(values[field.id] as string) ?? ""}
                        onChange={(e) =>
                          setValues({ ...values, [field.id]: e.target.value })
                        }
                        placeholder={field.placeholder ?? ""}
                      />
                    )}
                    {fieldError && (
                      <div className="form-error">{fieldError.message}</div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}

          {form.groups.length === 0 ||
          form.groups.every((g) => g.fields.length === 0) ? (
            <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
              This automation has no required configuration. You can deploy it directly.
            </p>
          ) : null}

          <div style={{ marginTop: 20, display: "flex", gap: 12 }}>
            <button
              className="btn btn-primary"
              onClick={handleDeploy}
              disabled={deploying || !configName}
            >
              {deploying ? (
                <>
                  <Loader2 size={16} className="spin" /> Deploying…
                </>
              ) : (
                <>
                  <Zap size={16} /> Deploy Automation
                </>
              )}
            </button>
          </div>

          {deployResult?.ok && (
            <div
              className="toast success"
              style={{ position: "static", boxShadow: "none", marginTop: 16 }}
            >
              <CheckCircle2 size={18} color="var(--color-success)" />
              Deployment created successfully.{" "}
              <button
                className="btn btn-secondary"
                style={{ marginLeft: 8, padding: "4px 12px", fontSize: 13 }}
                onClick={() => navigate("/deployments")}
              >
                View deployments
              </button>
            </div>
          )}
          {deployResult && !deployResult.ok && (
            <div
              className="toast error"
              style={{ position: "static", boxShadow: "none", marginTop: 16 }}
            >
              <AlertCircle size={18} color="var(--color-error)" />
              {deployResult.message}
            </div>
          )}
        </div>

        {/* Right: integrations + saved configs */}
        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div className="detail-section">
            <h2 className="detail-section-title">
              <Package size={18} /> Integrations
            </h2>
            {automation.integrations.length > 0 ? (
              <div className="integration-list">
                {automation.integrations.map((i) => (
                  <span className="integration-chip" key={i}>
                    {i}
                  </span>
                ))}
              </div>
            ) : (
              <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                No external integrations detected.
              </p>
            )}
          </div>

          <div className="detail-section">
            <h2 className="detail-section-title">
              <Settings size={18} /> Saved Configurations
            </h2>
            {savedConfigs.length === 0 ? (
              <p style={{ color: "var(--color-text-muted)", fontSize: 14 }}>
                No saved configurations yet. Deploy to create one.
              </p>
            ) : (
              savedConfigs.map((c) => (
                <div className="saved-config-item" key={c.id}>
                  <span className="name">{c.name}</span>
                  <span className="date">
                    {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
