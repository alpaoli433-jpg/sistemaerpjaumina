import { Martini } from "lucide-react";

export function AppHeader() {
  return (
    <header className="glass-panel sticky top-0 z-40 border-x-0 border-t-0">
      <div className="mx-auto flex max-w-lg items-center gap-3 px-5 py-4">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/40 bg-champagne-gold/10 text-champagne-gold">
          <Martini className="h-4 w-4" strokeWidth={1.75} />
        </span>
        <div className="leading-tight">
          <p className="font-display text-[15px] font-semibold tracking-wide text-ivory">
            Sotto Vento
          </p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-smoke">
            Coctelería Premium
          </p>
        </div>
      </div>
    </header>
  );
}
