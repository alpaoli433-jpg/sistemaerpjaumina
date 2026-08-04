import type { ReactNode } from 'react';

interface FieldProps {
  label: string;
  children: ReactNode;
}

// Wrapper de label consistente para inputs de formularios (evita repetir las
// mismas clases de label en cada página de módulo).
export function Field({ label, children }: FieldProps) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-anthracite">{label}</span>
      {children}
    </label>
  );
}

export const inputClass =
  'rounded-lg border border-anthracite/15 bg-paper px-3 py-2 text-sm text-anthracite outline-none transition focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/30';
