/**
 * Automation Catalog
 *
 * The catalog is the in-memory index of all discovered Automation records.
 * It is built once at startup (in the browser, from the pre-built JSON file;
 * in Node, from the scanner+parser pipeline) and provides lookup, filtering,
 * search, sorting, and statistics operations.
 *
 * The catalog NEVER holds or returns raw workflow JSON — only metadata.
 */

import type { Automation, AutomationStatus } from "./types";

export type SortKey = "name" | "category" | "nodes" | "setupTime" | "version";

export interface CatalogFilter {
  category?: string;
  tag?: string;
  status?: AutomationStatus;
  search?: string;
  sort?: SortKey;
  sortDir?: "asc" | "desc";
}

export interface CategoryCount {
  category: string;
  count: number;
}

export interface CatalogStats {
  total: number;
  active: number;
  draft: number;
  deprecated: number;
  categories: number;
  tags: number;
  totalNodes: number;
  avgSetupTime: number;
}

export class AutomationCatalog {
  private readonly byId = new Map<string, Automation>();
  private readonly byCategory = new Map<string, Automation[]>();
  private allTags: string[] = [];

  constructor(automations: Automation[]) {
    for (const a of automations) {
      this.byId.set(a.id, a);
      const bucket = this.byCategory.get(a.category) ?? [];
      bucket.push(a);
      this.byCategory.set(a.category, bucket);
    }

    const tagSet = new Set<string>();
    for (const a of automations) {
      for (const t of a.tags) tagSet.add(t);
    }
    this.allTags = [...tagSet].sort();
  }

  /** Get a single automation by id. Returns undefined if not found. */
  get(id: string): Automation | undefined {
    return this.byId.get(id);
  }

  /** Check whether an automation exists by id. */
  has(id: string): boolean {
    return this.byId.has(id);
  }

  /** List all automations, optionally filtered and sorted. */
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
          a.tags.some((t) => t.toLowerCase().includes(q)) ||
          a.category.toLowerCase().includes(q),
      );
    }

    const sortKey = filter?.sort ?? "name";
    const sortDir = filter?.sortDir ?? "asc";
    items.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = a.name.localeCompare(b.name);
          break;
        case "category":
          cmp = a.category.localeCompare(b.category);
          break;
        case "nodes":
          cmp = a.nodeCount - b.nodeCount;
          break;
        case "setupTime":
          cmp = a.estimatedSetupTime - b.estimatedSetupTime;
          break;
        case "version":
          cmp = a.version.localeCompare(b.version);
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });

    return items;
  }

  /** List automations in a specific category. */
  listByCategory(category: string): Automation[] {
    return (this.byCategory.get(category) ?? []).filter(
      (a) => a.status === "active",
    );
  }

  /** All distinct categories with counts, sorted alphabetically. */
  categoriesWithCounts(): CategoryCount[] {
    const result: CategoryCount[] = [];
    for (const [category, items] of this.byCategory) {
      const activeCount = items.filter((a) => a.status === "active").length;
      if (activeCount > 0) {
        result.push({ category, count: activeCount });
      }
    }
    return result.sort((a, b) => a.category.localeCompare(b.category));
  }

  /** All distinct categories (flat list). */
  categories(): string[] {
    return this.categoriesWithCounts().map((c) => c.category);
  }

  /** All distinct tags. */
  tags(): string[] {
    return this.allTags;
  }

  /** Aggregate statistics about the catalog. */
  stats(): CatalogStats {
    let active = 0;
    let draft = 0;
    let deprecated = 0;
    let totalNodes = 0;
    let totalSetup = 0;
    const catSet = new Set<string>();

    for (const a of this.byId.values()) {
      if (a.status === "active") active++;
      else if (a.status === "draft") draft++;
      else if (a.status === "deprecated") deprecated++;
      totalNodes += a.nodeCount;
      totalSetup += a.estimatedSetupTime;
      catSet.add(a.category);
    }

    const total = this.byId.size;
    return {
      total,
      active,
      draft,
      deprecated,
      categories: catSet.size,
      tags: this.allTags.length,
      totalNodes,
      avgSetupTime: total > 0 ? Math.round(totalSetup / total) : 0,
    };
  }

  get count(): number {
    return this.byId.size;
  }
}
