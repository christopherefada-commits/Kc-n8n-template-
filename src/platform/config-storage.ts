/**
 * Configuration Storage
 *
 * Persists user configurations and deployment records to Supabase.
 * This module is the only place that talks to the `automation_configs` and
 * `automation_deployments` tables.
 *
 * Configuration values are stored separately from the workflow template,
 * so a user can have multiple configurations for the same automation and
 * re-deploy with different settings without touching the original template.
 */

import { supabase } from "./supabase-client";
import type { StoredConfig, Deployment } from "./types";

/* ------------------------------------------------------------------ */
/* Configurations                                                      */
/* ------------------------------------------------------------------ */

export async function saveConfig(
  automationId: string,
  name: string,
  values: Record<string, string | number | boolean>,
): Promise<StoredConfig> {
  const { data, error } = await supabase
    .from("automation_configs")
    .insert({ automation_id: automationId, name, values })
    .select("id, automation_id, name, values, created_at, updated_at")
    .single();

  if (error) throw new Error(`Failed to save configuration: ${error.message}`);

  return rowToConfig(data);
}

export async function listConfigs(automationId: string): Promise<StoredConfig[]> {
  const { data, error } = await supabase
    .from("automation_configs")
    .select("id, automation_id, name, values, created_at, updated_at")
    .eq("automation_id", automationId)
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list configurations: ${error.message}`);

  return (data ?? []).map(rowToConfig);
}

export async function getConfig(configId: string): Promise<StoredConfig | null> {
  const { data, error } = await supabase
    .from("automation_configs")
    .select("id, automation_id, name, values, created_at, updated_at")
    .eq("id", configId)
    .maybeSingle();

  if (error) throw new Error(`Failed to get configuration: ${error.message}`);
  if (!data) return null;
  return rowToConfig(data);
}

export async function deleteConfig(configId: string): Promise<void> {
  const { error } = await supabase
    .from("automation_configs")
    .delete()
    .eq("id", configId);
  if (error) throw new Error(`Failed to delete configuration: ${error.message}`);
}

/* ------------------------------------------------------------------ */
/* Deployments                                                         */
/* ------------------------------------------------------------------ */

export async function createDeployment(
  automationId: string,
  configId: string | null,
  deployedWorkflow: unknown,
  nodeCount: number,
  notes?: string,
): Promise<Deployment> {
  const { data, error } = await supabase
    .from("automation_deployments")
    .insert({
      automation_id: automationId,
      config_id: configId,
      status: "deployed",
      deployed_workflow: deployedWorkflow,
      node_count: nodeCount,
      notes: notes ?? null,
    })
    .select("id, automation_id, config_id, status, node_count, notes, created_at, updated_at")
    .single();

  if (error) throw new Error(`Failed to create deployment: ${error.message}`);

  return rowToDeployment(data);
}

export async function listDeployments(): Promise<Deployment[]> {
  const { data, error } = await supabase
    .from("automation_deployments")
    .select("id, automation_id, config_id, status, node_count, notes, created_at, updated_at")
    .order("created_at", { ascending: false });

  if (error) throw new Error(`Failed to list deployments: ${error.message}`);

  return (data ?? []).map(rowToDeployment);
}

export async function updateDeploymentStatus(
  deploymentId: string,
  status: Deployment["status"],
): Promise<void> {
  const { error } = await supabase
    .from("automation_deployments")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", deploymentId);
  if (error) throw new Error(`Failed to update deployment: ${error.message}`);
}

/* ------------------------------------------------------------------ */
/* Mappers                                                             */
/* ------------------------------------------------------------------ */

interface ConfigRow {
  id: string;
  automation_id: string;
  name: string;
  values: Record<string, string | number | boolean>;
  created_at: string;
  updated_at: string;
}

function rowToConfig(row: ConfigRow): StoredConfig {
  return {
    id: row.id,
    automationId: row.automation_id,
    name: row.name,
    values: row.values,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

interface DeploymentRow {
  id: string;
  automation_id: string;
  config_id: string | null;
  status: string;
  node_count: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

function rowToDeployment(row: DeploymentRow): Deployment {
  return {
    id: row.id,
    automationId: row.automation_id,
    configId: row.config_id,
    status: row.status as Deployment["status"],
    nodeCount: row.node_count,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
