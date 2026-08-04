export type DrinkCategory = 'CLASICOS' | 'SIGNATURE' | 'SIN_ALCOHOL' | 'SHOTS';

export interface QuoteRecipe {
  id: string;
  name: string;
  category: DrinkCategory;
  glassware: string;
  price: number; // Precio sugerido por unidad, en Guaraníes (₲)
}

export const DRINK_CATEGORIES: { id: DrinkCategory; label: string }[] = [
  { id: 'SIGNATURE', label: 'Signature' },
  { id: 'CLASICOS', label: 'Clásicos' },
  { id: 'SIN_ALCOHOL', label: 'Sin Alcohol' },
  { id: 'SHOTS', label: 'Shots' },
];

// Tragos estimados por persona, por hora de servicio — ajustable según el tipo de evento.
export const CONSUMPTION_RATIO = 1.5;
