import { CONSUMPTION_RATIO, type QuoteRecipe } from './quote-data';

export interface QuoteLine {
  recipe: QuoteRecipe;
  estimatedUnits: number;
  subtotal: number;
}

export interface QuoteResult {
  totalDrinks: number;
  totalAmount: number;
  lines: QuoteLine[];
}

export function computeQuote(
  guestsCount: number,
  serviceHours: number,
  selectedRecipeIds: string[],
  availableRecipes: QuoteRecipe[],
): QuoteResult {
  const selectedRecipes = availableRecipes.filter((recipe) =>
    selectedRecipeIds.includes(recipe.id),
  );

  const totalDrinks = Math.round(guestsCount * serviceHours * CONSUMPTION_RATIO);

  if (selectedRecipes.length === 0) {
    return { totalDrinks, totalAmount: 0, lines: [] };
  }

  const unitsPerRecipe = totalDrinks / selectedRecipes.length;

  const lines = selectedRecipes.map((recipe) => ({
    recipe,
    estimatedUnits: unitsPerRecipe,
    subtotal: unitsPerRecipe * recipe.price,
  }));

  const totalAmount = lines.reduce((sum, line) => sum + line.subtotal, 0);

  return { totalDrinks, totalAmount, lines };
}
