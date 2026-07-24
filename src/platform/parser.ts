/**
 * Template Parser
 *
 * Reads a raw n8n workflow file and produces a fully-formed Automation record.
 *
 * Metadata resolution strategy (designed for extensibility):
 *   1. If a `manifest.json` exists alongside the workflow, use it (explicit).
 *   2. Otherwise, auto-extract metadata from the workflow content (name from
 *      file name, description from notes, category from folder, etc.).
 *
 * Configuration schema resolution:
 *   1. If a `config.schema.json` exists, use it verbatim.
 *   2. Otherwise, auto-generate a schema by scanning the workflow for common
 *      placeholder patterns (APIKEYHERE, your_sheet_id, etc.) and credential
 *      references.
 *
 * This dual approach means the platform works out-of-the-box with the existing
 * flat JSON files, while supporting the richer template format
 * (workflow.json + manifest.json + config.schema.json) the user described.
 */

import type {
  Automation,
  AutomationManifest,
  ConfigField,
  ConfigSchema,
} from "./types";
import type { RawWorkflowFile } from "./repository";

/* ------------------------------------------------------------------ */
/* n8n workflow shape                                                  */
/* ------------------------------------------------------------------ */

interface N8nNode {
  name: string;
  type: string;
  parameters?: Record<string, unknown>;
  credentials?: Record<string, { id?: string; name?: string }>;
  notes?: string;
}

interface N8nWorkflow {
  nodes: N8nNode[];
  name?: string;
  active?: boolean;
}

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

/** Convert a file path like "Telegram/Send a recipe.json" to "telegram-send-a-recipe". */
export function slugify(relativePath: string): string {
  const base = relativePath
    .replace(/\.json$/, "")
    .replace(/[\\/]/g, "-")
    .replace(/[^a-zA-Z0-9-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .toLowerCase();
  return base;
}

/** Derive a human-friendly name from a file path. */
function deriveName(relativePath: string): string {
  const base = relativePath.split(/[\\/]/).pop()!.replace(/\.json$/, "");
  return base
    .replace(/[_-]+/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();
}

/** Derive the category from the top-level folder. */
function deriveCategory(relativePath: string): string {
  const parts = relativePath.split(/[\\/]/);
  if (parts.length < 2) return "General";
  return parts[0]
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

/** Pick an emoji icon based on category or node types. */
function deriveIcon(category: string, integrations: string[]): string {
  const iconMap: Record<string, string> = {
    Telegram: "✈️",
    Gmail: "📧",
    "Gmail and Email Automation": "📧",
    Slack: "💬",
    Discord: "🎮",
    Airtable: "🗂️",
    Notion: "📝",
    WordPress: "📰",
    WhatsApp: "📱",
    "Instagram Twitter Social Media": "📸",
    "HR and Recruitment": "👤",
    "PDF and Document Processing": "📄",
    "Google Drive and Google Sheets": "📊",
    "Forms and Surveys": "📋",
    "AI Research RAG and Data Analysis": "🔍",
    "OpenAI and LLMs": "🤖",
    "Database and Storage": "🗄️",
    "Other Integrations and Use Cases": "🔗",
    Devops: "⚙️",
  };
  if (iconMap[category]) return iconMap[category];
  if (integrations.some((i) => i.includes("openAi"))) return "🤖";
  if (integrations.some((i) => i.includes("telegram"))) return "✈️";
  if (integrations.some((i) => i.includes("slack"))) return "💬";
  return "⚡";
}

/** Extract unique integration names from node types. */
function extractIntegrations(nodes: N8nNode[]): string[] {
  const seen = new Set<string>();
  for (const node of nodes) {
    if (!node.type) continue;
    if (node.type === "n8n-nodes-base.cron") continue;
    if (node.type === "n8n-nodes-base.set") continue;
    if (node.type === "n8n-nodes-base.if") continue;
    if (node.type === "n8n-nodes-base.noOp") continue;
    const parts = node.type.split(".");
    if (parts.length >= 2) {
      seen.add(parts[parts.length - 1]);
    }
  }
  return [...seen].sort();
}

/** Derive a description from workflow notes or node names. */
function deriveDescription(workflow: N8nWorkflow, relativePath: string): string {
  const notes = workflow.nodes
    .map((n) => n.notes)
    .filter((n): n is string => typeof n === "string" && n.trim().length > 0);
  if (notes.length > 0) {
    return notes[0].slice(0, 200);
  }
  const name = deriveName(relativePath);
  const integrations = extractIntegrations(workflow.nodes);
  if (integrations.length > 0) {
    return `Automation using ${integrations.slice(0, 3).join(", ")}${integrations.length > 3 ? " and more" : ""}.`;
  }
  return `${name} automation workflow.`;
}

/** Derive tags from category and integrations. */
function deriveTags(category: string, integrations: string[]): string[] {
  const tags = new Set<string>();
  tags.add(category.toLowerCase());
  for (const i of integrations) {
    tags.add(i.toLowerCase());
  }
  return [...tags].slice(0, 12);
}

/* ------------------------------------------------------------------ */
/* Auto-generated configuration schema                                 */
/* ------------------------------------------------------------------ */

/** Known placeholder strings in the workflow JSON that signal a config field. */
const PLACEHOLDER_PATTERNS: { pattern: RegExp; field: Omit<ConfigField, "id" | "label"> }[] =
  [
    {
      pattern: /APIKEYHERE|YOUR_API_KEY|your_api_key|apiKey=APIKEY/i,
      field: {
        type: "apikey",
        required: true,
        description: "The API key for the external service.",
      },
    },
    {
      pattern: /your_sheet_id|your_sheet|YOUR_SHEET_ID/i,
      field: {
        type: "string",
        required: true,
        description: "The spreadsheet or base ID.",
      },
    },
    {
      pattern: /your_bot_id|YOUR_BOT_ID|your_bot_token/i,
      field: {
        type: "apikey",
        required: true,
        description: "The bot token for the messaging service.",
      },
    },
    {
      pattern: /your_email|YOUR_EMAIL|you@example\.com/i,
      field: {
        type: "email",
        required: true,
        description: "The email address to use for sending or receiving.",
      },
    },
    {
      pattern: /your_phone|YOUR_PHONE|\+1\d{10}/i,
      field: {
        type: "phone",
        required: true,
        description: "The phone number for notifications.",
      },
    },
    {
      pattern: /your_webhook|YOUR_WEBHOOK|https:\/\/example\.com\/webhook/i,
      field: {
        type: "webhookUrl",
        required: true,
        description: "The webhook URL to send or receive data.",
      },
    },
  ];

/** Recursively collect all string values from an object, with their dot-paths. */
function collectStringValues(
  obj: unknown,
  prefix: string,
  out: { path: string; value: string }[],
): void {
  if (typeof obj === "string") {
    out.push({ path: prefix, value: obj });
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) =>
      collectStringValues(item, `${prefix}[${i}]`, out),
    );
  } else if (typeof obj === "object" && obj !== null) {
    for (const [key, val] of Object.entries(obj)) {
      const newPrefix = prefix ? `${prefix}.${key}` : key;
      collectStringValues(val, newPrefix, out);
    }
  }
}

/** Auto-generate a configuration schema from a workflow's placeholder strings. */
function autoGenerateSchema(workflow: N8nWorkflow): ConfigSchema {
  const fields: ConfigField[] = [];
  const seenIds = new Set<string>();

  for (const node of workflow.nodes) {
    if (!node.parameters) continue;
    const strings: { path: string; value: string }[] = [];
    collectStringValues(node.parameters, "", strings);

    for (const { value } of strings) {
      for (const { pattern, field } of PLACEHOLDER_PATTERNS) {
        if (pattern.test(value)) {
          const id = `auto_${field.type}_${node.name.replace(/\s+/g, "_").toLowerCase()}`;
          if (seenIds.has(id)) continue;
          seenIds.add(id);
          fields.push({
            id,
            label: labelForType(field.type),
            type: field.type,
            required: field.required,
            description: field.description,
            placeholder: value,
            group: "Required Credentials",
          });
          break;
        }
      }
    }

    // Credential-based fields
    if (node.credentials) {
      for (const [credType, credInfo] of Object.entries(node.credentials)) {
        const credName = credType.replace(/Api$/, "");
        const id = `cred_${credName.replace(/\s+/g, "_").toLowerCase()}`;
        if (seenIds.has(id)) continue;
        seenIds.add(id);
        fields.push({
          id,
          label: `${credName} Credential`,
          type: "apikey",
          required: true,
          description: `Credentials for the ${credInfo.name ?? credName} integration.`,
          group: "Required Credentials",
        });
      }
    }
  }

  return {
    version: 1,
    summary:
      fields.length > 0
        ? "This automation requires the following credentials and settings."
        : "This automation has no required configuration. You can deploy it directly.",
    fields,
  };
}

function labelForType(type: ConfigField["type"]): string {
  const labels: Partial<Record<ConfigField["type"], string>> = {
    apikey: "API Key",
    string: "Identifier",
    email: "Email Address",
    phone: "Phone Number",
    webhookUrl: "Webhook URL",
    url: "URL",
  };
  return labels[type] ?? "Setting";
}

/* ------------------------------------------------------------------ */
/* Main parser                                                         */
/* ------------------------------------------------------------------ */

export interface ParsedTemplate {
  automation: Automation;
  /** The raw workflow content (kept for the deployment engine, never sent to the UI). */
  workflow: N8nWorkflow;
}

export class TemplateParser {
  /**
   * Parse a single workflow file into an Automation record.
   *
   * @param file        The raw workflow file from the scanner.
   * @param manifest    Optional pre-read manifest (if a manifest.json was found).
   * @param schema      Optional pre-read config schema (if a config.schema.json was found).
   */
  parse(
    file: RawWorkflowFile,
    manifest: AutomationManifest | null,
    schema: ConfigSchema | null,
  ): ParsedTemplate {
    const workflow = file.content as N8nWorkflow;
    const integrations = extractIntegrations(workflow.nodes);
    const category = manifest?.category ?? deriveCategory(file.relativePath);
    const name = manifest?.name ?? deriveName(file.relativePath);
    const description =
      manifest?.description ?? deriveDescription(workflow, file.relativePath);
    const tags = manifest?.tags ?? deriveTags(category, integrations);
    const icon = manifest?.icon ?? deriveIcon(category, integrations);
    const configSchema = schema ?? autoGenerateSchema(workflow);

    const automation: Automation = {
      id: slugify(file.relativePath),
      name,
      description,
      category,
      tags,
      version: manifest?.version ?? "1.0.0",
      estimatedSetupTime: manifest?.estimatedSetupTime ?? estimateSetupTime(configSchema),
      icon,
      status: manifest?.status ?? "active",
      workflowPath: file.relativePath,
      configSchema,
      nodeCount: workflow.nodes.length,
      integrations,
      indexedAt: new Date().toISOString(),
    };

    return { automation, workflow };
  }
}

/** Rough estimate: 2 min base + 1 min per required field. */
function estimateSetupTime(schema: ConfigSchema): number {
  const required = schema.fields.filter((f) => f.required).length;
  return 2 + required;
}
