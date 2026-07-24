/**
 * Core type definitions for the Automation Deployment Platform.
 *
 * These types define the shape of an Automation (an installable template
 * derived from an n8n workflow JSON file), its configuration schema, and
 * the deployment records that the platform produces.
 */

/** Status of an automation in the catalog. */
export type AutomationStatus = "active" | "draft" | "deprecated";

/** Field types that the Configuration Engine can render as form inputs. */
export type ConfigFieldType =
  | "string"
  | "email"
  | "phone"
  | "url"
  | "apikey"
  | "webhookUrl"
  | "select"
  | "boolean"
  | "number"
  | "textarea";

/** A single field in a configuration schema. */
export interface ConfigField {
  /** Unique key within the schema, e.g. "telegram_bot_token". */
  id: string;
  /** Business-friendly label shown to the user, e.g. "Telegram Bot Token". */
  label: string;
  /** The input type used to render the form field. */
  type: ConfigFieldType;
  /** Whether the user must provide a value before deploying. */
  required: boolean;
  /** Short helper text shown under the field. */
  description?: string;
  /** Default value if the user leaves the field blank. */
  defaultValue?: string | number | boolean;
  /** For select fields: the available options. */
  options?: { label: string; value: string }[];
  /**
   * Optional placeholder value that maps into the workflow. If omitted the
   * engine will replace the field id (e.g. "APIKEYHERE") inside node parameters.
   */
  placeholder?: string;
  /** Group the field under a section heading in the form. */
  group?: string;
}

/** The configuration schema for an automation template. */
export interface ConfigSchema {
  /** Schema format version, currently 1. */
  version: number;
  /** Human-friendly summary of what needs to be configured. */
  summary?: string;
  /** The list of fields the user must fill in. */
  fields: ConfigField[];
}

/**
 * A mapping target that tells the Deployment Engine where to inject a
 * configuration value inside the cloned workflow JSON.
 */
export interface ConfigMapping {
  /** The node `name` whose parameters should be modified. */
  node: string;
  /** Dot-path to the parameter, e.g. "url" or "additionalFields.chatId". */
  path: string;
  /** How to apply the value. */
  mode: "replace" | "append" | "queryParam";
}

/** Metadata stored in manifest.json alongside each workflow. */
export interface AutomationManifest {
  name: string;
  description: string;
  category: string;
  tags: string[];
  version: string;
  /** Estimated setup time in minutes. */
  estimatedSetupTime: number;
  /** Emoji or icon name for the marketplace UI. */
  icon: string;
  status: AutomationStatus;
}

/** The full Automation record exposed by the catalog. */
export interface Automation {
  /** Unique, stable id (slug derived from the file path). */
  id: string;
  /** Display name. */
  name: string;
  /** Short description. */
  description: string;
  /** Category folder, e.g. "Telegram". */
  category: string;
  /** Searchable tags. */
  tags: string[];
  /** Semantic version of the template. */
  version: string;
  /** Estimated setup time in minutes. */
  estimatedSetupTime: number;
  /** Emoji or icon identifier. */
  icon: string;
  /** Status controlling visibility. */
  status: AutomationStatus;
  /** Relative path to the workflow JSON inside the repository. */
  workflowPath: string;
  /** Relative path to the manifest, if present. */
  manifestPath?: string;
  /** Relative path to the config schema, if present. */
  configSchemaPath?: string;
  /** The parsed configuration schema. */
  configSchema: ConfigSchema;
  /** Number of nodes in the workflow (metadata, not the JSON itself). */
  nodeCount: number;
  /** List of n8n node types used (for advanced filtering later). */
  integrations: string[];
  /** ISO timestamp of when the catalog was built. */
  indexedAt: string;
}

/** A stored user configuration for an automation. */
export interface StoredConfig {
  id: string;
  automationId: string;
  name: string;
  values: Record<string, string | number | boolean>;
  createdAt: string;
  updatedAt: string;
}

/** A deployment record. */
export interface Deployment {
  id: string;
  automationId: string;
  configId: string | null;
  status: "pending" | "deployed" | "failed" | "archived";
  nodeCount: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

/** The catalog file written by the scanner. */
export interface CatalogFile {
  builtAt: string;
  count: number;
  automations: Automation[];
}
