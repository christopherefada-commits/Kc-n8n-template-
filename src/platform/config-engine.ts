/**
 * Configuration Engine
 *
 * Transforms an Automation's `ConfigSchema` into a form definition that the
 * UI can render, and validates user-submitted values against the schema.
 *
 * The engine also produces the "injection map" — a mapping from config field
 * ids to the placeholder strings they should replace inside the cloned
 * workflow JSON. This keeps the Deployment Engine agnostic of schema details.
 */

import type { Automation, ConfigField, ConfigSchema } from "./types";

/** A field ready for the UI to render. */
export interface FormField {
  id: string;
  label: string;
  type: ConfigField["type"];
  required: boolean;
  description: string;
  defaultValue?: string | number | boolean;
  options?: { label: string; value: string }[];
  group: string;
  placeholder?: string;
  /** HTML input type for convenience. */
  inputType:
    | "text"
    | "email"
    | "tel"
    | "url"
    | "password"
    | "number"
    | "checkbox"
    | "select"
    | "textarea";
}

/** A grouped form definition. */
export interface FormDefinition {
  automationId: string;
  summary: string;
  groups: { name: string; fields: FormField[] }[];
}

/** Result of validating user values. */
export interface ValidationResult {
  valid: boolean;
  errors: { fieldId: string; message: string }[];
}

export class ConfigurationEngine {
  /** Generate a form definition from an automation's config schema. */
  generateForm(automation: Automation): FormDefinition {
    const schema: ConfigSchema = automation.configSchema;
    const groupMap = new Map<string, FormField[]>();

    for (const field of schema.fields) {
      const group = field.group ?? "General Settings";
      if (!groupMap.has(group)) groupMap.set(group, []);
      groupMap.get(group)!.push(this.toFormField(field));
    }

    return {
      automationId: automation.id,
      summary: schema.summary ?? "Configure your automation.",
      groups: [...groupMap.entries()].map(([name, fields]) => ({ name, fields })),
    };
  }

  private toFormField(field: ConfigField): FormField {
    return {
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      description: field.description ?? "",
      defaultValue: field.defaultValue,
      options: field.options,
      group: field.group ?? "General Settings",
      placeholder: field.placeholder,
      inputType: this.toInputType(field.type),
    };
  }

  private toInputType(type: ConfigField["type"]): FormField["inputType"] {
    switch (type) {
      case "email":
        return "email";
      case "phone":
        return "tel";
      case "url":
      case "webhookUrl":
        return "url";
      case "apikey":
        return "password";
      case "number":
        return "number";
      case "boolean":
        return "checkbox";
      case "select":
        return "select";
      case "textarea":
        return "textarea";
      default:
        return "text";
    }
  }

  /** Validate user-submitted values against the schema. */
  validate(
    automation: Automation,
    values: Record<string, string | number | boolean>,
  ): ValidationResult {
    const errors: { fieldId: string; message: string }[] = [];

    for (const field of automation.configSchema.fields) {
      const raw = values[field.id];
      const value = raw === undefined || raw === "" ? null : raw;

      if (field.required && (value === null || value === undefined)) {
        errors.push({
          fieldId: field.id,
          message: `${field.label} is required.`,
        });
        continue;
      }
      if (value === null) continue;

      if (typeof value === "string") {
        if (field.type === "email" && !isValidEmail(value)) {
          errors.push({ fieldId: field.id, message: "Enter a valid email address." });
        }
        if ((field.type === "url" || field.type === "webhookUrl") && !isValidUrl(value)) {
          errors.push({ fieldId: field.id, message: "Enter a valid URL." });
        }
        if (field.type === "phone" && !isValidPhone(value)) {
          errors.push({ fieldId: field.id, message: "Enter a valid phone number." });
        }
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Build an injection map: for each field, the placeholder string in the
   * workflow JSON that should be replaced with the user's value.
   */
  buildInjectionMap(
    automation: Automation,
  values: Record<string, string | number | boolean>,
  workflow: unknown,
  resolvePlaceholders: (workflow: unknown, field: ConfigField) => string[],
  ): Record<string, string[]> {
    const map: Record<string, string[]> = {};
    for (const field of automation.configSchema.fields) {
      const placeholders = resolvePlaceholders(workflow, field);
      if (placeholders.length > 0) {
        map[field.id] = placeholders;
      }
    }
    return map;
  }
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidUrl(value: string): boolean {
  try {
    new URL(value);
    return true;
  } catch {
    return false;
  }
}

function isValidPhone(value: string): boolean {
  return /^\+?[\d\s()-]{7,}$/.test(value);
}
