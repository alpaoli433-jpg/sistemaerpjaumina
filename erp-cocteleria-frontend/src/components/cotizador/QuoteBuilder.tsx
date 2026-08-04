"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Stepper } from "./Stepper";
import { DrinkPicker } from "./DrinkPicker";
import { QuoteTicket } from "./QuoteTicket";
import { computeQuote } from "@/lib/quote";
import { CONSUMPTION_RATIO, type QuoteRecipe } from "@/lib/quote-data";
import { getRecipes } from "@/lib/api";

const DEFAULTS = { guestsCount: 60, serviceHours: 4 };

export function QuoteBuilder() {
  const [guestsCount, setGuestsCount] = useState(DEFAULTS.guestsCount);
  const [serviceHours, setServiceHours] = useState(DEFAULTS.serviceHours);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // GET /recipes es público — el recetario real de coctelería alimenta el
  // Cotizador sin necesidad de login.
  const { data: recipes, isLoading } = useQuery({
    queryKey: ["recipes"],
    queryFn: getRecipes,
  });

  const allRecipes: QuoteRecipe[] = useMemo(
    () =>
      (recipes ?? []).map((recipe) => ({
        id: recipe.id,
        name: recipe.name,
        category: recipe.category,
        glassware: recipe.glassware,
        price: recipe.price,
      })),
    [recipes],
  );

  const quote = useMemo(
    () => computeQuote(guestsCount, serviceHours, selectedIds, allRecipes),
    [guestsCount, serviceHours, selectedIds, allRecipes],
  );

  const toggleRecipe = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  };

  return (
    <>
      <div className="flex flex-col gap-6 px-5 pb-40 pt-6">
        <div>
          <h1 className="font-display text-2xl font-semibold text-ivory">
            Cotizador Inteligente
          </h1>
          <p className="mt-1 text-sm text-smoke">
            Armá una cotización en segundos según invitados, horas y menú.
          </p>
        </div>

        <section className="glass-panel flex flex-col gap-4 rounded-2xl px-4 py-4">
          <Stepper
            label="Invitados"
            unit="Cantidad de personas"
            value={guestsCount}
            min={10}
            max={500}
            step={5}
            onChange={setGuestsCount}
          />
          <div className="h-px bg-glass-border" />
          <Stepper
            label="Duración"
            unit="Horas de servicio"
            value={serviceHours}
            min={1}
            max={12}
            onChange={setServiceHours}
          />
          <p className="text-xs text-smoke">
            Estimado: {quote.totalDrinks} tragos totales · ratio de{" "}
            {CONSUMPTION_RATIO} tragos/persona/hora
          </p>
        </section>

        {isLoading ? (
          <div className="space-y-2">
            <div className="h-14 animate-pulse rounded-2xl bg-glass-bg" />
            <div className="h-14 animate-pulse rounded-2xl bg-glass-bg" />
            <div className="h-14 animate-pulse rounded-2xl bg-glass-bg" />
          </div>
        ) : (
          <DrinkPicker
            allRecipes={allRecipes}
            selectedIds={selectedIds}
            onToggle={toggleRecipe}
          />
        )}
      </div>

      <QuoteTicket quote={quote} guestsCount={guestsCount} />
    </>
  );
}
