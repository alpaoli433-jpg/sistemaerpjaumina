"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatGuaranies } from "@/lib/format";
import { DRINK_CATEGORIES, type DrinkCategory, type QuoteRecipe } from "@/lib/quote-data";

interface DrinkPickerProps {
  allRecipes: QuoteRecipe[];
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export function DrinkPicker({ allRecipes, selectedIds, onToggle }: DrinkPickerProps) {
  const [activeCategory, setActiveCategory] = useState<DrinkCategory>(
    DRINK_CATEGORIES[0].id,
  );

  const recipes = allRecipes.filter((r) => r.category === activeCategory);

  return (
    <div>
      <div className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-sm font-semibold text-ivory">
          Selecciona los tragos
        </h2>
        <span className="text-xs text-smoke">
          {selectedIds.length} seleccionado{selectedIds.length === 1 ? "" : "s"}
        </span>
      </div>

      <div className="no-scrollbar mb-4 flex gap-2 overflow-x-auto">
        {DRINK_CATEGORIES.map((category) => (
          <button
            key={category.id}
            type="button"
            onClick={() => setActiveCategory(category.id)}
            className={cn(
              "shrink-0 rounded-full border px-3.5 py-1.5 text-xs font-medium tracking-wide transition-colors",
              activeCategory === category.id
                ? "border-champagne-gold bg-champagne-gold/10 text-champagne-gold"
                : "border-glass-border text-smoke-light hover:text-ivory",
            )}
          >
            {category.label}
          </button>
        ))}
      </div>

      <ul className="flex flex-col gap-2">
        {recipes.map((recipe) => {
          const isSelected = selectedIds.includes(recipe.id);
          return (
            <li key={recipe.id}>
              <button
                type="button"
                onClick={() => onToggle(recipe.id)}
                aria-pressed={isSelected}
                className={cn(
                  "glass-panel flex w-full items-center justify-between rounded-2xl px-4 py-3 text-left transition-colors",
                  isSelected && "border-champagne-gold/50 bg-champagne-gold/[0.07]",
                )}
              >
                <span>
                  <span className="block text-sm font-medium text-ivory">
                    {recipe.name}
                  </span>
                  <span className="block text-xs text-smoke">
                    {recipe.glassware} · {formatGuaranies(recipe.price)}
                  </span>
                </span>
                <span
                  className={cn(
                    "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors",
                    isSelected
                      ? "border-champagne-gold bg-champagne-gold text-obsidian-deep"
                      : "border-glass-border text-transparent",
                  )}
                >
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
