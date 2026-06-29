"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal, X, ChevronDown } from "lucide-react";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDefinition {
  key: string;
  label: string;
  options: FilterOption[];
}

interface FilterBarProps {
  filters: FilterDefinition[];
  activeFilters: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  onClear: () => void;
}

export function FilterBar({ filters, activeFilters, onFilterChange, onClear }: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const hasActiveFilters = Object.values(activeFilters).some((v) => v && v !== "all");

  const handleSelect = useCallback(
    (key: string, value: string) => {
      onFilterChange(key, value);
      setOpenDropdown(null);
    },
    [onFilterChange]
  );

  const getActiveLabel = (key: string): string | null => {
    const val = activeFilters[key];
    if (!val || val === "all") return null;
    const def = filters.find((f) => f.key === key);
    const opt = def?.options.find((o) => o.value === val);
    return opt?.label || val;
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {filters.map((filter) => {
        const activeLabel = getActiveLabel(filter.key);
        return (
          <div key={filter.key} className="relative">
            <button
              onClick={() => setOpenDropdown(openDropdown === filter.key ? null : filter.key)}
              className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] text-xs font-medium transition-colors border ${
                activeLabel
                  ? "bg-brand-dim text-brand border-brand-30"
                  : "bg-bg-surface text-text-secondary border-border-default hover:border-[#444] hover:text-text-primary"
              }`}
            >
              {filter.label}
              {activeLabel && <span className="ml-0.5 text-[10px] opacity-70">({activeLabel})</span>}
              <ChevronDown className="h-3 w-3" />
            </button>

            {openDropdown === filter.key && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setOpenDropdown(null)} />
                <div className="absolute left-0 top-full mt-1 z-20 w-44 rounded-[6px] border border-border-default bg-bg-secondary shadow-xl py-1">
                  <button
                    onClick={() => handleSelect(filter.key, "all")}
                    className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                      !activeLabel ? "text-brand bg-brand-5" : "text-text-secondary hover:bg-bg-surface-hover"
                    }`}
                  >
                    Todos
                  </button>
                  {filter.options.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => handleSelect(filter.key, opt.value)}
                      className={`w-full text-left px-3 py-2 text-xs transition-colors ${
                        activeFilters[filter.key] === opt.value
                          ? "text-brand bg-brand-5"
                          : "text-text-secondary hover:bg-bg-surface-hover"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        );
      })}

      {hasActiveFilters && (
        <button
          onClick={onClear}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-[4px] text-xs text-text-muted hover:text-text-primary hover:bg-bg-surface-hover transition-colors"
        >
          <X className="h-3 w-3" />
          Limpar filtros
        </button>
      )}
    </div>
  );
}
