// Clases Tailwind reutilizables para no repetir los mismos estilos de botón
// en cada página de módulo (regla "nunca duplicar lógica").
export const buttonPrimary =
  'rounded-lg bg-champagne-gold px-4 py-2 text-sm font-medium text-anthracite transition hover:bg-champagne-dark hover:text-paper disabled:cursor-not-allowed disabled:opacity-60';

export const buttonGhost =
  'rounded-lg border border-anthracite/15 px-4 py-2 text-sm font-medium text-anthracite-soft transition hover:bg-paper-muted disabled:cursor-not-allowed disabled:opacity-60';

export const buttonDanger =
  'rounded-lg border border-velvet-rose/30 px-3 py-1.5 text-xs font-medium text-velvet-rose transition hover:bg-velvet-rose/10 disabled:cursor-not-allowed disabled:opacity-60';
