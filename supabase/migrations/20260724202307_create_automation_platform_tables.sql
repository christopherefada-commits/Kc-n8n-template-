/*
# Automation Deployment Platform - Core Tables

## Purpose
Stores user configurations and deployment records for the Automation Deployment
Platform. The platform treats n8n workflow JSON files as installable automation
templates. Users configure automations via business-friendly forms (API keys,
company name, email, webhook URLs, etc.) and deploy them. Configuration values
are stored separately from the immutable workflow template.

## Tables

### automation_configs
Stores per-user configuration values for a specific automation template.
- `id` (uuid, primary key)
- `automation_id` (text, the unique template id from the catalog)
- `name` (text, a user-given label for this configuration)
- `values` (jsonb, the user-supplied config values keyed by field id)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

### automation_deployments
Records each deployment of an automation with an injected configuration.
- `id` (uuid, primary key)
- `automation_id` (text, the template id)
- `config_id` (uuid, foreign key to automation_configs)
- `status` (text: 'pending' | 'deployed' | 'failed' | 'archived')
- `deployed_workflow` (jsonb, the cloned+injected workflow JSON - never the original)
- `node_count` (int, number of nodes in the deployed workflow)
- `notes` (text, optional user notes)
- `created_at` (timestamptz)
- `updated_at` (timestamptz)

## Security
Single-tenant platform with no authentication yet. RLS enabled on all tables
with anon+authenticated full CRUD since the data is intentionally shared
within the platform. When auth is added later, these policies can be tightened
to owner-scoped checks without restructuring the tables.

## Notes
1. The original workflow templates are NEVER stored in the database - they live
   as immutable files in the repository and are indexed into a static catalog.
2. Only cloned+injected copies are stored in automation_deployments.
3. The `values` jsonb in automation_configs is keyed by the config field id
   defined in each template's config.schema.json.
*/

CREATE TABLE IF NOT EXISTS automation_configs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id text NOT NULL,
  name text NOT NULL,
  values jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS automation_deployments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  automation_id text NOT NULL,
  config_id uuid REFERENCES automation_configs(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'pending',
  deployed_workflow jsonb,
  node_count int DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE automation_configs ENABLE ROW LEVEL SECURITY;
ALTER TABLE automation_deployments ENABLE ROW LEVEL SECURITY;

-- automation_configs policies (single-tenant, no auth yet)
DROP POLICY IF EXISTS "anon_select_configs" ON automation_configs;
CREATE POLICY "anon_select_configs" ON automation_configs FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_configs" ON automation_configs;
CREATE POLICY "anon_insert_configs" ON automation_configs FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_configs" ON automation_configs;
CREATE POLICY "anon_update_configs" ON automation_configs FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_configs" ON automation_configs;
CREATE POLICY "anon_delete_configs" ON automation_configs FOR DELETE
  TO anon, authenticated USING (true);

-- automation_deployments policies (single-tenant, no auth yet)
DROP POLICY IF EXISTS "anon_select_deployments" ON automation_deployments;
CREATE POLICY "anon_select_deployments" ON automation_deployments FOR SELECT
  TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_deployments" ON automation_deployments;
CREATE POLICY "anon_insert_deployments" ON automation_deployments FOR INSERT
  TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_deployments" ON automation_deployments;
CREATE POLICY "anon_update_deployments" ON automation_deployments FOR UPDATE
  TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_deployments" ON automation_deployments;
CREATE POLICY "anon_delete_deployments" ON automation_deployments FOR DELETE
  TO anon, authenticated USING (true);

-- Index for common lookups
CREATE INDEX IF NOT EXISTS idx_configs_automation_id ON automation_configs(automation_id);
CREATE INDEX IF NOT EXISTS idx_deployments_automation_id ON automation_deployments(automation_id);
CREATE INDEX IF NOT EXISTS idx_deployments_config_id ON automation_deployments(config_id);
