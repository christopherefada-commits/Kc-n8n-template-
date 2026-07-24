/*
# Add config_schema column to workflow_templates

## Purpose
Stores the configuration schema (from the catalog) alongside each workflow
template so the deploy-automation edge function can validate user-submitted
values server-side without relying on client-supplied data.

## Changes
- Add `config_schema` (jsonb) column to `workflow_templates`.
- Add `automation_name` (text) column for display.
- Add `category` (text) column for reference.

## Security
No policy changes — the table remains RLS-locked (service role only).
*/

ALTER TABLE workflow_templates
  ADD COLUMN IF NOT EXISTS config_schema jsonb DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS automation_name text DEFAULT '',
  ADD COLUMN IF NOT EXISTS category text DEFAULT '';
