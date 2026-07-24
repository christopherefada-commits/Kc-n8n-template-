/**
 * Seed workflow templates by calling the seed-templates edge function.
 * Reads all workflow files from the catalog and POSTs them in batches.
 *
 * Usage: npx tsx scripts/seed-templates.ts
 */

import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const BATCH_SIZE = 25;

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY!;

async function main() {
  // Read from .env if not in process env
  let url = supabaseUrl;
  let key = supabaseAnonKey;
  if (!url || !key) {
    const env = await fs.readFile(path.join(ROOT, ".env"), "utf-8");
    url = env.match(/VITE_SUPABASE_URL=(.+)/)?.[1]!;
    key = env.match(/VITE_SUPABASE_ANON_KEY=(.+)/)?.[1]!;
  }

  const catalogPath = path.join(ROOT, "public", "catalog.json");
  const catalog = JSON.parse(await fs.readFile(catalogPath, "utf-8"));

  const seen = new Set<string>();
  const templates: { id: string; workflowPath: string; workflowJson: unknown; configSchema: unknown; name: string; category: string }[] = [];

  for (const auto of catalog.automations) {
    if (seen.has(auto.id)) continue;
    seen.add(auto.id);

    const absPath = path.join(ROOT, auto.workflowPath);
    try {
      const content = JSON.parse(await fs.readFile(absPath, "utf-8"));
      templates.push({
        id: auto.id,
        workflowPath: auto.workflowPath,
        workflowJson: content,
        configSchema: auto.configSchema,
        name: auto.name,
        category: auto.category,
      });
    } catch {
      console.error(`Missing: ${auto.workflowPath}`);
    }
  }

  console.log(`Seeding ${templates.length} templates in batches of ${BATCH_SIZE}...`);

  for (let i = 0; i < templates.length; i += BATCH_SIZE) {
    const batch = templates.slice(i, i + BATCH_SIZE);
    const batchNum = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(templates.length / BATCH_SIZE);

    const res = await fetch(`${url}/functions/v1/seed-templates`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${key}`,
      },
      body: JSON.stringify({ templates: batch }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error(`  ✗ Batch ${batchNum}/${totalBatches} failed: ${res.status} ${body}`);
    } else {
      const body = await res.json();
      console.log(`  ✓ Batch ${batchNum}/${totalBatches} — ${body.inserted} templates`);
    }
  }

  console.log("Done.");
}

main().catch(console.error);
