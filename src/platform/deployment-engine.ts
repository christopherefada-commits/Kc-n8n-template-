/**
 * Deployment Engine
 *
 * Takes an immutable workflow template + user configuration values and
 * produces a *cloned* workflow with the values injected. The original
 * template is never modified.
 *
 * Injection strategy:
 *   1. Deep-clone the workflow JSON.
 *   2. For each config field, find placeholder strings in the cloned
 *      workflow's node parameters and replace them with the user's value.
 *   3. Return the cloned+injected workflow (to be stored in the database).
 *
 * The engine also walks the workflow to find credential references and
 * replaces placeholder credential ids with user-supplied credential names.
 */

import type { Automation, ConfigField } from "./types";

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
}

export interface DeploymentResult {
  /** The cloned + injected workflow JSON. */
  workflow: N8nWorkflow;
  /** Number of nodes in the deployed workflow. */
  nodeCount: number;
  /** How many placeholder values were injected. */
  injectedCount: number;
}

export class DeploymentEngine {
  /**
   * Clone the workflow template and inject user configuration values.
   *
   * @param template   The original, immutable workflow JSON.
   * @param automation The automation metadata (for schema/fields).
   * @param values     The user-supplied configuration values.
   */
  deploy(
    template: unknown,
    automation: Automation,
    values: Record<string, string | number | boolean>,
  ): DeploymentResult {
    const workflow = this.deepClone(template) as N8nWorkflow;
    let injectedCount = 0;

    for (const field of automation.configSchema.fields) {
      const value = values[field.id];
      if (value === undefined || value === "") continue;
      injectedCount += this.injectField(workflow, field, String(value));
    }

    // Update the workflow name to include the automation name for clarity.
    if (!workflow.name) {
      workflow.name = automation.name;
    }

    return {
      workflow,
      nodeCount: workflow.nodes.length,
      injectedCount,
    };
  }

  /** Deep-clone using structured clone (falls back to JSON). */
  private deepClone(obj: unknown): unknown {
    if (typeof structuredClone === "function") {
      return structuredClone(obj);
    }
    return JSON.parse(JSON.stringify(obj));
  }

  /**
   * Inject a single field's value into the workflow.
   * Replaces placeholder strings in node parameters.
   */
  private injectField(
    workflow: N8nWorkflow,
    field: ConfigField,
    value: string,
  ): number {
    let count = 0;

    // If the field has an explicit placeholder, replace it everywhere.
    if (field.placeholder) {
      count += this.replaceInObject(workflow, field.placeholder, value);
    }

    // Also try common placeholder patterns based on field type.
    const patterns = this.placeholderPatternsForField(field);
    for (const pattern of patterns) {
      count += this.replaceInObject(workflow, pattern, value);
    }

    // For credential fields, update credential references.
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
            credRef.id = undefined; // clear placeholder id
            count++;
          }
        }
      }
    }

    return count;
  }

  /** Get placeholder patterns to try for a given field type. */
  private placeholderPatternsForField(field: ConfigField): string[] {
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

  /**
   * Recursively replace all occurrences of `search` with `replacement`
   * in any string value found within the object (in place).
   */
  private replaceInObject(obj: unknown, search: string, replacement: string): number {
    let count = 0;

    if (typeof obj === "string") {
      if (obj.includes(search)) {
        // We can't replace in-place on a string primitive; the caller handles reassignment.
        return 0;
      }
    } else if (Array.isArray(obj)) {
      for (let i = 0; i < obj.length; i++) {
        if (typeof obj[i] === "string" && obj[i].includes(search)) {
          obj[i] = (obj[i] as string).split(search).join(replacement);
          count++;
        } else if (typeof obj[i] === "object" && obj[i] !== null) {
          count += this.replaceInObject(obj[i], search, replacement);
        }
      }
    } else if (typeof obj === "object" && obj !== null) {
      for (const key of Object.keys(obj)) {
        const val = (obj as Record<string, unknown>)[key];
        if (typeof val === "string" && val.includes(search)) {
          (obj as Record<string, unknown>)[key] = val.split(search).join(replacement);
          count++;
        } else if (typeof val === "object" && val !== null) {
          count += this.replaceInObject(val, search, replacement);
        }
      }
    }

    return count;
  }
}
