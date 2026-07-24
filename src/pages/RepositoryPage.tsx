import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Boxes, Search } from "lucide-react";
import { PageHeader, EmptyState } from "@/components/common";
import { loadCatalog, type AutomationCatalog, type SortKey } from "@platform";
import { RepositoryStats } from "@/components/repository/RepositoryStats";
import { CategoryFilter } from "@/components/repository/CategoryFilter";
import { RepositoryToolbar } from "@/components/repository/RepositoryToolbar";
import {
  AutomationCard,
  AutomationListItem,
} from "@/components/repository/AutomationCard";

export function RepositoryPage() {
  const navigate = useNavigate();
  const [catalog, setCatalog] = useState<AutomationCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [sort, setSort] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadCatalog().then(setCatalog).catch((e) => setError(e.message));
  }, []);

  const automations = useMemo(() => {
    if (!catalog) return [];
    return catalog.list({
      search,
      category: category || undefined,
      sort,
      sortDir,
    });
  }, [catalog, search, category, sort, sortDir]);

  const categoriesWithCounts = useMemo(
    () => (catalog ? catalog.categoriesWithCounts() : []),
    [catalog],
  );

  const stats = useMemo(() => (catalog ? catalog.stats() : null), [catalog]);

  if (error) {
    return (
      <div>
        <PageHeader
          title="Automation Repository"
          subtitle="Browse all discovered automation templates."
        />
        <EmptyState
          icon={<Boxes size={28} />}
          title="Could not load the repository"
          description={error}
        />
      </div>
    );
  }

  if (!catalog || !stats) {
    return (
      <div>
        <PageHeader
          title="Automation Repository"
          subtitle="Browse all discovered automation templates."
        />
        <div className="spinner-container">Loading repository…</div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Automation Repository"
        subtitle="Automatically scanned and indexed n8n workflow templates. Add new workflow JSON files to the repository and re-run the scanner to include them."
      />

      <RepositoryStats stats={stats} />

      <div className="mb-4">
        <CategoryFilter
          categories={categoriesWithCounts}
          selected={category}
          onSelect={setCategory}
        />
      </div>

      <RepositoryToolbar
        search={search}
        onSearchChange={setSearch}
        sort={sort}
        sortDir={sortDir}
        onSortChange={setSort}
        onSortDirToggle={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
        view={view}
        onViewChange={setView}
        resultCount={automations.length}
      />

      {automations.length === 0 ? (
        <EmptyState
          icon={<Search size={28} />}
          title="No automations found"
          description="Try adjusting your search or selecting a different category."
        />
      ) : view === "grid" ? (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
            gap: 16,
          }}
        >
          {automations.map((a) => (
            <AutomationCard
              key={a.id}
              automation={a}
              onClick={() => navigate(`/automation/${a.id}`)}
            />
          ))}
        </div>
      ) : (
        <div className="list">
          {automations.map((a) => (
            <AutomationListItem
              key={a.id}
              automation={a}
              onClick={() => navigate(`/automation/${a.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
