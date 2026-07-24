/*
# Workflow Templates Table

## Purpose
Stores the raw n8n workflow JSON for each automation template. The edge function
fetches templates from this table (server-side only) to clone + inject config
values during deployment. The original templates are immutable and never exposed
to end users via RLS — only the service role (used by the edge function) can read them.

## Tables

### workflow_templates
- `id` (text, primary key — matches the automation id from the catalog)
- `workflow_path` (text, the relative file path in the repository)
- `workflow_json` (jsonb, the full n8n workflow JSON)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Security
RLS enabled. The anon role has NO access to this table — the raw workflow JSON
must never be exposed to end users. Only the service role (used by the
deploy-automation edge function) can read and write, since it bypasses RLS.

## Notes
1. This table is populated by the upload-templates script at build time.
2. The catalog.json (metadata only, no workflow JSON) is served as a static
   file from the frontend's public directory.
3. The edge function uses Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") which
   bypasses RLS to fetch templates from this table.
*/

CREATE TABLE IF NOT EXISTS workflow_templates (
  id text PRIMARY KEY,
  workflow_path text NOT NULL,
  workflow_json jsonb NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE workflow_templates ENABLE ROW LEVEL SECURITY;

-- No policies for anon/authenticated — the table is locked down.
-- Only the service role (which bypasses RLS) can access it.
-- This ensures raw workflow JSON is NEVER exposed to end users.

CREATE INDEX IF NOT EXISTS idx_workflow_templates_path ON workflow_templates(workflow_path);
