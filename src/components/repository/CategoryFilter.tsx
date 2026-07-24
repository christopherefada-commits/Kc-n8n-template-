import type { CategoryCount } from "@platform";

interface CategoryFilterProps {
  categories: CategoryCount[];
  selected: string;
  onSelect: (category: string) => void;
}

export function CategoryFilter({ categories, selected, onSelect }: CategoryFilterProps) {
  return (
    <div className="flex gap-2" style={{ flexWrap: "wrap" }}>
      <button
        className={`btn btn-sm ${!selected ? "btn-primary" : "btn-secondary"}`}
        onClick={() => onSelect("")}
      >
        All ({categories.reduce((sum, c) => sum + c.count, 0)})
      </button>
      {categories.map((c) => (
        <button
          key={c.category}
          className={`btn btn-sm ${selected === c.category ? "btn-primary" : "btn-secondary"}`}
          onClick={() => onSelect(c.category)}
        >
          {c.category} ({c.count})
        </button>
      ))}
    </div>
  );
}
