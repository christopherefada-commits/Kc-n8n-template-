import { LayoutGrid, List as ListIcon, ArrowUpDown, Search } from "lucide-react";
import type { SortKey } from "@platform";

interface RepositoryToolbarProps {
  search: string;
  onSearchChange: (value: string) => void;
  sort: SortKey;
  sortDir: "asc" | "desc";
  onSortChange: (sort: SortKey) => void;
  onSortDirToggle: () => void;
  view: "grid" | "list";
  onViewChange: (view: "grid" | "list") => void;
  resultCount: number;
}

const sortOptions: { label: string; value: SortKey }[] = [
  { label: "Name", value: "name" },
  { label: "Category", value: "category" },
  { label: "Node Count", value: "nodes" },
  { label: "Setup Time", value: "setupTime" },
  { label: "Version", value: "version" },
];

export function RepositoryToolbar({
  search,
  onSearchChange,
  sort,
  sortDir,
  onSortChange,
  onSortDirToggle,
  view,
  onViewChange,
  resultCount,
}: RepositoryToolbarProps) {
  return (
    <div className="flex items-center gap-3 mb-4" style={{ flexWrap: "wrap" }}>
      <div style={{ position: "relative", flex: 1, maxWidth: 360 }}>
        <Search
          size={15}
          strokeWidth={1.75}
          style={{
            position: "absolute",
            left: 10,
            top: "50%",
            transform: "translateY(-50%)",
            color: "var(--color-text-dim)",
          }}
        />
        <input
          className="input-field"
          style={{ paddingLeft: 32 }}
          placeholder="Search by name, description, or tag"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
        />
      </div>

      <div className="flex items-center gap-2">
        <select
          className="input-field"
          style={{ width: "auto", minWidth: 130 }}
          value={sort}
          onChange={(e) => onSortChange(e.target.value as SortKey)}
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              Sort: {o.label}
            </option>
          ))}
        </select>
        <button
          className="icon-button"
          onClick={onSortDirToggle}
          aria-label="Toggle sort direction"
          title={sortDir === "asc" ? "Ascending" : "Descending"}
        >
          <ArrowUpDown size={15} strokeWidth={1.75} />
        </button>
      </div>

      <div className="flex items-center gap-1">
        <button
          className="icon-button"
          onClick={() => onViewChange("grid")}
          aria-label="Grid view"
          title="Grid view"
          style={
            view === "grid"
              ? { background: "var(--color-primary-soft)", color: "var(--color-primary)" }
              : {}
          }
        >
          <LayoutGrid size={16} strokeWidth={1.75} />
        </button>
        <button
          className="icon-button"
          onClick={() => onViewChange("list")}
          aria-label="List view"
          title="List view"
          style={
            view === "list"
              ? { background: "var(--color-primary-soft)", color: "var(--color-primary)" }
              : {}
          }
        >
          <ListIcon size={16} strokeWidth={1.75} />
        </button>
      </div>

      <span className="text-muted text-sm" style={{ whiteSpace: "nowrap" }}>
        {resultCount} {resultCount === 1 ? "result" : "results"}
      </span>
    </div>
  );
}
