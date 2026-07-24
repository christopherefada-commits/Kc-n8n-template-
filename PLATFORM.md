# Automation Deployment Platform

A backend-first platform that treats n8n workflow JSON files as installable
automation templates. Users browse a catalog, configure automations via
business-friendly forms, and deploy them — without ever touching workflow JSON.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│  Repository (n8n workflow JSON files on disk)                │
│  └── Workflow Scanner → Template Parser → Automation Catalog│
└─────────────────────────────────────────────────────────────┘
         │  catalog.json (metadata only, no workflow JSON)
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Frontend (React)                                           │
│  ├── Catalog Browser (search, filter by category)           │
│  ├── Automation Detail (config form, integrations)          │
│  └── Deployments (list deployed automations)                │
└─────────────────────────────────────────────────────────────┘
         │  POST /functions/v1/deploy-automation
         ▼
┌─────────────────────────────────────────────────────────────┐
│  Edge Function (deploy-automation)                           │
│  1. Fetch template from workflow_templates table             │
│  2. Validate config values against schema                    │
│  3. Clone workflow + inject config values                    │
│  4. Store deployment in automation_deployments               │
└─────────────────────────────────────────────────────────────┘
```

## Core Modules

| Module | Location | Responsibility |
|--------|----------|----------------|
| Automation Repository | `src/platform/repository.ts` | File-system access abstraction |
| Workflow Scanner | `src/platform/scanner.ts` | Discovers n8n workflow files |
| Template Parser | `src/platform/parser.ts` | Parses workflows + metadata into Automation records |
| Automation Catalog | `src/platform/catalog.ts` | In-memory index with search/filter |
| Configuration Engine | `src/platform/config-engine.ts` | Generates forms from schemas, validates values |
| Deployment Engine | `src/platform/deployment-engine.ts` | Clones + injects config into workflow templates |
| Configuration Storage | `src/platform/config-storage.ts` | Persists configs/deployments to Supabase |

## Template Format

Each automation can be a standalone JSON file or a template directory:

```
invoice-generator/
├── workflow.json         # Original n8n workflow
├── manifest.json         # Marketplace metadata (name, category, tags, version)
├── config.schema.json    # Defines user-facing config fields
├── README.md             # Internal documentation
└── thumbnail.png         # Marketplace UI icon
```

If manifest.json or config.schema.json are absent, the parser auto-extracts
metadata and auto-generates a config schema from placeholder patterns in the
workflow (APIKEYHERE, your_sheet_id, etc.).

## Scripts

- `npm run scan` — Scans the repository, builds `public/catalog.json`
- `npm run seed` — Uploads workflow templates to the database
- `npm run dev` — Starts the dev server
- `npm run build` — Production build

## Database Tables

- `workflow_templates` — Raw workflow JSON + config schema (RLS-locked, service-role only)
- `automation_configs` — User configurations (values keyed by field id)
- `automation_deployments` — Deployed workflows (cloned + injected copies)

## Security

- Raw workflow JSON is NEVER exposed to end users (RLS blocks anon access to `workflow_templates`)
- Only cloned + injected copies are stored in `automation_deployments`
- Config values are validated server-side against the schema
- The original template remains immutable
