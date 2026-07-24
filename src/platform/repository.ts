/**
 * Automation Repository
 *
 * The repository is the single source of truth for where workflow files live
 * on disk. It abstracts file-system access so the scanner and parser never
 * touch `fs` directly. In the browser, the repository is represented by the
 * pre-built catalog file; in Node (the scanner script), it reads the real
 * filesystem.
 */

import { promises as fs } from "node:fs";
import path from "node:path";

export interface RawWorkflowFile {
  /** Relative path from the repo root, e.g. "Telegram/recipe-bot.json". */
  relativePath: string;
  /** Absolute path on disk. */
  absolutePath: string;
  /** The raw workflow JSON content (parsed). */
  content: unknown;
}

export class AutomationRepository {
  constructor(private readonly rootDir: string) {}

  /** Recursively find all `*.json` files that look like n8n workflows. */
  async discoverWorkflowFiles(): Promise<string[]> {
    const results: string[] = [];
    await this.walk(this.rootDir, results);
    return results.sort();
  }

  private async walk(dir: string, results: string[]): Promise<void> {
    let entries: import("node:fs").Dirent[];
    try {
      entries = await fs.readdir(dir, { withFileTypes: true });
    } catch {
      return;
    }
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (this.shouldSkipDir(entry.name)) continue;
        await this.walk(full, results);
      } else if (entry.isFile() && entry.name.endsWith(".json")) {
        results.push(full);
      }
    }
  }

  private shouldSkipDir(name: string): boolean {
    return (
      name === "node_modules" ||
      name === ".git" ||
      name === "dist" ||
      name === "docs" ||
      name === "img" ||
      name === "Other" ||
      name === ".github"
    );
  }

  /** Read and parse a JSON file, returning null if it is not valid JSON. */
  async readJson<T = unknown>(filePath: string): Promise<T | null> {
    try {
      const raw = await fs.readFile(filePath, "utf-8");
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }

  /** Read a text file (e.g. README.md), returning null if missing. */
  async readText(filePath: string): Promise<string | null> {
    try {
      return await fs.readFile(filePath, "utf-8");
    } catch {
      return null;
    }
  }

  /** Check whether a file exists. */
  async exists(filePath: string): Promise<boolean> {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }

  /** Convert an absolute path to a repo-relative path. */
  relative(absolutePath: string): string {
    return path.relative(this.rootDir, absolutePath).replace(/\\/g, "/");
  }
}
