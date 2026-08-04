import { AppHeader } from "@/components/layout/AppHeader";
import { QuoteBuilder } from "@/components/cotizador/QuoteBuilder";

// Experiencia legacy de Coctelería Premium (tema oscuro Dark Obsidian & Champagne
// Gold). Se fuerza el fondo/texto localmente porque el tema global de la app
// pasó a ser "White Bloom & Gold" (claro) con la adopción de Ja'umina ERP.
export default function CotizadorPage() {
  return (
    <div className="flex min-h-full flex-1 flex-col bg-obsidian-deep text-ivory">
      <AppHeader />
      <main className="mx-auto w-full max-w-lg flex-1">
        <QuoteBuilder />
      </main>
    </div>
  );
}
