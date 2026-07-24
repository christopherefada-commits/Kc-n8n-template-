/**
 * Workflow Scanner
 *
 * Walks the Automation Repository, discovers every `*.json` file, and filters
 * to only those that are valid n8n workflows (they must have a top-level
 * `nodes` array). The scanner produces a list of candidate file paths that
 * the Template Parser then turns into Automation records.
 */

import type { AutomationRepository, RawWorkflowFile } from "./repository";

interface N8nWorkflowShape {
  nodes?: unknown[];
}

function isN8nWorkflow(content: unknown): content is N8nWorkflowShape {
  return (
    typeof content === "object" &&
    content !== null &&
    Array.isArray((content as N8nWorkflowShape).nodes)
  );
}

export class WorkflowScanner {
  constructor(private readonly repo: AutomationRepository) {}

  /** Discover all valid n8n workflow files in the repository. */
  async scan(): Promise<RawWorkflowFile[]> {
    const allFiles = await this.repo.discoverWorkflowFiles();
    const workflows: RawWorkflowFile[] = [];

    for (const absPath of allFiles) {
      const content = await this.repo.readJson(absPath);
      if (content && isN8nWorkflow(content)) {
        workflows.push({
          relativePath: this.repo.relative(absPath),
          absolutePath: absPath,
          content,
        });
      }
    }

    return workflows;
  }
}
