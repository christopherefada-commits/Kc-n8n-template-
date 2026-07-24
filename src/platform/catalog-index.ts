/**
 * Catalog Index — browser-side loader.
 *
 * In the browser, the catalog is a static JSON file built by the scanner
 * script (`scripts/scan-catalog.ts`). This module fetches it and constructs
 * an `AutomationCatalog` instance.
 *
 * The catalog file contains ONLY metadata — never raw workflow JSON.
 * Workflow templates are fetched on demand (server-side only, via the edge
 * function) for deployment.
 */

import { AutomationCatalog } from "./catalog";
import type { Automation, CatalogFile } from "./types";

let cachedCatalog: AutomationCatalog | null = null;

export async function loadCatalog(): Promise<AutomationCatalog> {
  if (cachedCatalog) return cachedCatalog;

  const res = await fetch("/catalog.json");
  if (!res.ok) {
    throw new Error(`Failed to load automation catalog (${res.status}).`);
  }
  const data = (await res.json()) as CatalogFile;
  cachedCatalog = new AutomationCatalog(data.automations);
  return cachedCatalog;
}

/** Load a single automation by id (convenience). */
export async function loadAutomation(id: string): Promise<Automation | undefined> {
  const catalog = await loadCatalog();
  return catalog.get(id);
}
