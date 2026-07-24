/**
 * deploy-automation Edge Function
 *
 * Receives a deployment request from the frontend, fetches the original
 * workflow template from the catalog, clones it, injects the user's
 * configuration values, and stores the result in automation_deployments.
 *
 * The original template is NEVER modified or exposed. Only the cloned +
 * injected copy is stored.
 *
 * POST /functions/v1/deploy-automation
 * Body: { automationId: string, configName: string, values: Record<string, ...> }
 */

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface N8nNode {
  name: string;
  type: string;
  parameters?: Record<string, unknown>;
  credentials?: Record<string, { id?: string; name?: string }>;
}

interface N8nWorkflow {
  nodes: N8nNode[];
  name?: string;
}

interface ConfigField {
  id: string;
  label: string;
  type: string;
  required: boolean;
  description?: string;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  placeholder?: string;
  group?: string;
}

interface Automation {
  id: string;
  name: string;
  configSchema: { version: number; summary?: string; fields: ConfigField[] };
  workflowPath: string;
}

/* ------------------------------------------------------------------ */
/* Deep clone + inject                                                 */
/* ------------------------------------------------------------------ */

function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj));
}

function replaceInObject(obj: unknown, search: string, replacement: string): number {
  let count = 0;
  if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      if (typeof obj[i] === "string" && obj[i].includes(search)) {
        obj[i] = (obj[i] as string).split(search).join(replacement);
        count++;
      } else if (typeof obj[i] === "object" && obj[i] !== null) {
        count += replaceInObject(obj[i], search, replacement);
      }
    }
  } else if (typeof obj === "object" && obj !== null) {
    for (const key of Object.keys(obj)) {
      const val = (obj as Record<string, unknown>)[key];
      if (typeof val === "string" && val.includes(search)) {
        (obj as Record<string, unknown>)[key] = val.split(search).join(replacement);
        count++;
      } else if (typeof val === "object" && val !== null) {
        count += replaceInObject(val, search, replacement);
      }
    }
  }
  return count;
}

function placeholderPatternsForField(field: ConfigField): string[] {
  const patterns: string[] = [];
  switch (field.type) {
    case "apikey":
      patterns.push("APIKEYHERE", "YOUR_API_KEY", "your_api_key");
      break;
    case "email":
      patterns.push("your_email", "YOUR_EMAIL", "you@example.com");
      break;
    case "phone":
      patterns.push("your_phone", "YOUR_PHONE");
      break;
    case "webhookUrl":
      patterns.push("your_webhook", "YOUR_WEBHOOK");
      break;
    case "string":
      patterns.push("your_sheet_id", "YOUR_SHEET_ID", "your_bot_id", "YOUR_BOT_ID");
      break;
  }
  return patterns;
}

function injectField(
  workflow: N8nWorkflow,
  field: ConfigField,
  value: string,
): number {
  let count = 0;
  if (field.placeholder) {
    count += replaceInObject(workflow, field.placeholder, value);
  }
  for (const pattern of placeholderPatternsForField(field)) {
    count += replaceInObject(workflow, pattern, value);
  }
  if (field.type === "apikey" && field.id.startsWith("cred_")) {
    const credName = field.id.replace("cred_", "").replace(/_/g, " ");
    for (const node of workflow.nodes) {
      if (!node.credentials) continue;
      for (const [credType, credRef] of Object.entries(node.credentials)) {
        if (
          credType.toLowerCase().includes(credName.toLowerCase()) ||
          (credRef.name && credRef.name.toLowerCase().includes(credName.toLowerCase()))
        ) {
          credRef.name = value;
          credRef.id = undefined;
          count++;
        }
      }
    }
  }
  return count;
}

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

function isValidEmail(v: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}
function isValidUrl(v: string): boolean {
  try {
    new URL(v);
    return true;
  } catch {
    return false;
  }
}
function isValidPhone(v: string): boolean {
  return /^\+?[\d\s()-]{7,}$/.test(v);
}

function validate(
  automation: Automation,
  values: Record<string, string | number | boolean>,
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  for (const field of automation.configSchema.fields) {
    const raw = values[field.id];
    const value = raw === undefined || raw === "" ? null : raw;
    if (field.required && (value === null || value === undefined)) {
      errors.push(`${field.label} is required.`);
      continue;
    }
    if (value === null) continue;
    if (typeof value === "string") {
      if (field.type === "email" && !isValidEmail(value))
        errors.push(`${field.label}: invalid email.`);
      if ((field.type === "url" || field.type === "webhookUrl") && !isValidUrl(value))
        errors.push(`${field.label}: invalid URL.`);
      if (field.type === "phone" && !isValidPhone(value))
        errors.push(`${field.label}: invalid phone number.`);
    }
  }
  return { valid: errors.length === 0, errors };
}

/* ------------------------------------------------------------------ */
/* Main handler                                                        */
/* ------------------------------------------------------------------ */

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { automationId, configName, values } = await req.json();

    if (!automationId || typeof automationId !== "string") {
      return jsonError(400, "Missing automationId.");
    }
    if (!configName || typeof configName !== "string") {
      return jsonError(400, "Missing configName.");
    }
    if (!values || typeof values !== "object") {
      return jsonError(400, "Missing values.");
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // 1. Fetch the workflow template + metadata from the database (server-side only).
    const { data: templateRow, error: templateErr } = await supabase
      .from("workflow_templates")
      .select("workflow_json, config_schema, automation_name")
      .eq("id", automationId)
      .maybeSingle();

    if (templateErr) {
      return jsonError(500, `Failed to query template: ${templateErr.message}`);
    }
    if (!templateRow) {
      return jsonError(404, `Automation "${automationId}" not found in template store.`);
    }

    const configSchema = (templateRow.config_schema as { version: number; fields: ConfigField[] }) ?? { version: 1, fields: [] };
    const automation: Automation = {
      id: automationId,
      name: (templateRow.automation_name as string) ?? automationId,
      configSchema,
      workflowPath: "",
    };

    // 2. Validate user values against the schema.
    const { valid, errors } = validate(automation, values);
    if (!valid) {
      return jsonError(422, `Validation failed: ${errors.join(" ")}`);
    }

    // 3. The original workflow template (server-side only, never exposed to users).
    const template = templateRow.workflow_json as N8nWorkflow;

    // 4. Clone the template and inject config values.
    const cloned = deepClone(template) as N8nWorkflow;
    let injectedCount = 0;
    for (const field of automation.configSchema.fields) {
      const value = values[field.id];
      if (value === undefined || value === "") continue;
      injectedCount += injectField(cloned, field, String(value));
    }
    if (!cloned.name) cloned.name = automation.name;

    // 5. Store the configuration.
    const { data: configRow, error: configErr } = await supabase
      .from("automation_configs")
      .insert({
        automation_id: automationId,
        name: configName,
        values,
      })
      .select("id")
      .single();
    if (configErr) {
      return jsonError(500, `Failed to save configuration: ${configErr.message}`);
    }

    // 6. Store the deployment with the cloned+injected workflow.
    const { data: deployRow, error: deployErr } = await supabase
      .from("automation_deployments")
      .insert({
        automation_id: automationId,
        config_id: configRow.id,
        status: "deployed",
        deployed_workflow: cloned,
        node_count: cloned.nodes.length,
      })
      .select("id")
      .single();
    if (deployErr) {
      return jsonError(500, `Failed to create deployment: ${deployErr.message}`);
    }

    return new Response(
      JSON.stringify({
        deploymentId: deployRow.id,
        configId: configRow.id,
        nodeCount: cloned.nodes.length,
        injectedCount,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return jsonError(500, err.message || "Internal server error.");
  }
});

function jsonError(status: number, message: string): Response {
  return new Response(JSON.stringify({ error: message }), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
