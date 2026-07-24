/**
 * Public barrel for the platform layer.
 *
 * Frontend code imports from here so the internal module structure can
 * evolve without breaking callers.
 */

export type {
  Automation,
  AutomationStatus,
  ConfigField,
  ConfigFieldType,
  ConfigSchema,
  ConfigMapping,
  AutomationManifest,
  StoredConfig,
  Deployment,
  CatalogFile,
} from "./types";

export { AutomationCatalog } from "./catalog";
export type { CatalogFilter, CatalogFilter as CatalogQuery, SortKey, CategoryCount, CatalogStats } from "./catalog";

export { ConfigurationEngine } from "./config-engine";
export type { FormField, FormDefinition, ValidationResult } from "./config-engine";

export { DeploymentEngine } from "./deployment-engine";
export type { DeploymentResult } from "./deployment-engine";

export {
  saveConfig,
  listConfigs,
  getConfig,
  deleteConfig,
  createDeployment,
  listDeployments,
  updateDeploymentStatus,
} from "./config-storage";

export { supabase } from "./supabase-client";

export { loadCatalog } from "./catalog-index";
export { loadAutomation } from "./catalog-index";
