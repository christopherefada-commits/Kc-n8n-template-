/**
 * Catalog Scanner Script
 *
 * Runs at build time (Node.js) to scan the repository for n8n workflow JSON
 * files, parse them into Automation records, and write the catalog to
 * `public/catalog.json`.
 *
 * Usage:  npm run scan
 *
 * This script also supports the richer template format the user described:
 *   invoice-generator/
 *   ├── workflow.json
 *   ├── manifest.json
 *   ├── config.schema.json
 *   ├── README.md
 *   └── thumbnail.png
 *
 * If a directory contains a `workflow.json`, the scanner treats it as a
 * template directory and looks for the sibling manifest and schema files.
 * Otherwise it treats each standalone `*.json` file as a workflow.
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { AutomationRepository } from "../src/platform/repository.ts";
import { WorkflowScanner } from "../src/platform/scanner.ts";
import { TemplateParser } from "../src/platform/parser.ts";
import type { Automation, CatalogFile, ConfigSchema, AutomationManifest } from "../src/platform/types.ts";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const PUBLIC_DIR = path.join(ROOT, "public");

async function main() {
  const repo = new AutomationRepository(ROOT);
  const scanner = new WorkflowScanner(repo);
  const parser = new TemplateParser();

  console.log("Scanning repository for n8n workflows...");
  const rawFiles = await scanner.scan();
  console.log(`Found ${rawFiles.length} workflow files.`);

  const automations: Automation[] = [];

  for (const file of rawFiles) {
    // Check for template-directory format: a directory with workflow.json
    const dir = path.dirname(file.absolutePath);
    const workflowJsonPath = path.join(dir, "workflow.json");
    const manifestPath = path.join(dir, "manifest.json");
    const schemaPath = path.join(dir, "config.schema.json");

    let manifest: AutomationManifest | null = null;
    let schema: ConfigSchema | null = null;

    // If this file IS workflow.json in a template directory, look for siblings.
    if (path.basename(file.relativePath) === "workflow.json" || await repo.exists(workflowJsonPath)) {
      manifest = await repo.readJson<AutomationManifest>(manifestPath);
      schema = await repo.readJson<ConfigSchema>(schemaPath);
    }

    const { automation } = parser.parse(file, manifest, schema);
    automations.push(automation);
    console.log(`  ✓ ${automation.id} (${automation.category}) — ${automation.nodeCount} nodes`);
  }

  const catalog: CatalogFile = {
    builtAt: new Date().toISOString(),
    count: automations.length,
    automations,
  };

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await fs.writeFile(
    path.join(PUBLIC_DIR, "catalog.json"),
    JSON.stringify(catalog, null, 2),
    "utf-8",
  );

  console.log(`\nCatalog written to public/catalog.json (${automations.length} automations).`);

  // Print a summary of categories
  const byCategory = new Map<string, number>();
  for (const a of automations) {
    byCategory.set(a.category, (byCategory.get(a.category) ?? 0) + 1);
  }
  console.log("\nBy category:");
  for (const [cat, count] of [...byCategory.entries()].sort()) {
    console.log(`  ${cat}: ${count}`);
  }
}

main().catch((err) => {
  console.error("Scanner failed:", err);
  process.exit(1);
});
