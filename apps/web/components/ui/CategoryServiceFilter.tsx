'use client';

import { useState } from 'react';

export interface TaxonomyCategory {
  id: string;
  name: string;
}

export interface TaxonomyService {
  id: string;
  name: string;
  categoryId: string;
}

interface CategoryRowProps {
  category: TaxonomyCategory;
  services: TaxonomyService[];
  selectedServiceIds: Set<string>;
  onToggleCategory: (categoryId: string, serviceIds: string[]) => void;
  onToggleService: (serviceId: string) => void;
}

function CategoryRow({
  category,
  services,
  selectedServiceIds,
  onToggleCategory,
  onToggleService,
}: CategoryRowProps) {
  const [expanded, setExpanded] = useState(false);

  const selectedCount = services.filter((s) => selectedServiceIds.has(s.id)).length;
  const allSelected = services.length > 0 && selectedCount === services.length;
  const someSelected = selectedCount > 0 && !allSelected;

  function handleCategoryCheckbox() {
    onToggleCategory(
      category.id,
      services.map((s) => s.id),
    );
  }

  return (
    <div>
      {/* Category row */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id={`cat-${category.id}`}
          checked={allSelected}
          ref={(el) => {
            if (el) el.indeterminate = someSelected;
          }}
          onChange={handleCategoryCheckbox}
          className="h-4 w-4 accent-brand-blue cursor-pointer rounded flex-shrink-0"
        />
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex items-center gap-1.5 flex-1 min-w-0 text-left group"
          aria-expanded={expanded}
        >
          <label
            htmlFor={`cat-${category.id}`}
            onClick={(e) => e.preventDefault()}
            className="text-sm font-semibold text-brand-navy cursor-pointer group-hover:text-brand-blue transition-colors flex-1 min-w-0 truncate"
          >
            {category.name}
            {someSelected && (
              <span className="ml-1.5 text-xs font-medium text-brand-blue">
                ({selectedCount})
              </span>
            )}
          </label>
          <svg
            className={`h-3.5 w-3.5 text-brand-text-muted flex-shrink-0 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Services list */}
      {expanded && services.length > 0 && (
        <div className="ml-6 mt-2 space-y-2 border-l border-gray-100 pl-3">
          {services.map((service) => (
            <label
              key={service.id}
              className="flex items-center gap-2.5 cursor-pointer group"
            >
              <input
                type="checkbox"
                checked={selectedServiceIds.has(service.id)}
                onChange={() => onToggleService(service.id)}
                className="h-3.5 w-3.5 accent-brand-blue cursor-pointer rounded flex-shrink-0"
              />
              <span className="text-sm text-brand-text group-hover:text-brand-navy transition-colors">
                {service.name}
              </span>
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

interface CategoryServiceFilterProps {
  categories: TaxonomyCategory[];
  services: TaxonomyService[];
  selectedServiceIds: Set<string>;
  onToggleCategory: (categoryId: string, serviceIds: string[]) => void;
  onToggleService: (serviceId: string) => void;
}

export function CategoryServiceFilter({
  categories,
  services,
  selectedServiceIds,
  onToggleCategory,
  onToggleService,
}: CategoryServiceFilterProps) {
  if (categories.length === 0) {
    return (
      <div className="space-y-2.5">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-4 bg-gray-100 rounded animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {categories.map((cat) => {
        const catServices = services.filter((s) => s.categoryId === cat.id);
        if (catServices.length === 0) return null;
        return (
          <CategoryRow
            key={cat.id}
            category={cat}
            services={catServices}
            selectedServiceIds={selectedServiceIds}
            onToggleCategory={onToggleCategory}
            onToggleService={onToggleService}
          />
        );
      })}
    </div>
  );
}
