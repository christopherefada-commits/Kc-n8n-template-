/**
 * Automation Catalog
 *
 * The catalog is the in-memory index of all discovered Automation records.
 * It is built once at startup (in the browser, from the pre-built JSON file;
 * in Node, from the scanner+parser pipeline) and provides lookup, filtering,
 * and search operations.
 *
 * The catalog NEVER holds or returns raw workflow JSON — only metadata.
 */

import type { Automation, AutomationStatus } from "./types";

export interface CatalogFilter {
  category?: string;
  tag?: string;
  status?: AutomationStatus;
  search?: string;
}

export class AutomationCatalog {
  private readonly byId = new Map<string, Automation>();

  constructor(automations: Automation[]) {
    for (const a of automations) {
      this.byId.set(a.id, a);
    }
  }

  /** Get a single automation by id. Returns undefined if not found. */
  get(id: string): Automation | undefined {
    return this.byId.get(id);
  }

  /** List all automations, optionally filtered. */
  list(filter?: CatalogFilter): Automation[] {
    let items = [...this.byId.values()];

    if (filter?.status) {
      items = items.filter((a) => a.status === filter.status);
    } else {
      items = items.filter((a) => a.status === "active");
    }

    if (filter?.category) {
      items = items.filter((a) => a.category === filter.category);
    }
    if (filter?.tag) {
      items = items.filter((a) => a.tags.includes(filter.tag!));
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      items = items.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.tags.some((t) => t.toLowerCase().includes(q)),
      );
    }

    return items.sort((a, b) => a.name.localeCompare(b.name));
  }

  /** All distinct categories. */
  categories(): string[] {
    const set = new Set<string>();
    for (const a of this.byId.values()) {
      if (a.status === "active") set.add(a.category);
    }
    return [...set].sort();
  }

  /** All distinct tags. */
  tags(): string[] {
    const set = new Set<string>();
    for (const a of this.byId.values()) {
      if (a.status !== "active") continue;
      for (const t of a.tags) set.add(t);
    }
    return [...set].sort();
  }

  get count(): number {
    return this.byId.size;
  }
}
