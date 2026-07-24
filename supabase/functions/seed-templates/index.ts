/**
 * seed-templates Edge Function
 *
 * Accepts an array of workflow templates and inserts them into the
 * workflow_templates table. Uses the service role key (bypasses RLS).
 * This is a one-time admin function for populating the template store.
 *
 * POST /functions/v1/seed-templates
 * Body: { templates: [{ id, workflowPath, workflowJson, configSchema, name, category }] }
 */

import { createClient } from "npm:@supabase/supabase-js@2.45.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const { templates } = await req.json();

    if (!Array.isArray(templates) || templates.length === 0) {
      return new Response(JSON.stringify({ error: "Missing or empty templates array." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const rows = templates.map(
      (t: {
        id: string;
        workflowPath: string;
        workflowJson: unknown;
        configSchema?: unknown;
        name?: string;
        category?: string;
      }) => ({
        id: t.id,
        workflow_path: t.workflowPath,
        workflow_json: t.workflowJson,
        config_schema: t.configSchema ?? { version: 1, fields: [] },
        automation_name: t.name ?? t.id,
        category: t.category ?? "",
      }),
    );

    const { error } = await supabase
      .from("workflow_templates")
      .upsert(rows, { onConflict: "id" });

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(
      JSON.stringify({ inserted: rows.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message || "Internal server error." }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
