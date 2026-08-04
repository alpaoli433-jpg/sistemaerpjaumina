import { AlertTriangle } from 'lucide-react';
import type { StockCriticoItem, Unit } from '@/lib/api';

const UNIT_LABEL: Record<Unit, string> = {
  ML: 'ml',
  GRAMOS: 'g',
  UNIDADES: 'u',
  KILOS: 'kg',
};

interface StockCriticoPanelProps {
  items: StockCriticoItem[];
}

export function StockCriticoPanel({ items }: StockCriticoPanelProps) {
  if (items.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
        <AlertTriangle className="h-6 w-6 text-ice-emerald" strokeWidth={1.5} />
        <p className="text-sm text-anthracite-soft">
          Todo el stock está por encima del mínimo. Sin alertas.
        </p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {items.map((item) => {
        const ratio = item.minStock > 0 ? item.stock / item.minStock : 0;
        return (
          <li key={`${item.source}-${item.id}`} className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-velvet-rose/10 text-velvet-rose">
              <AlertTriangle className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <p className="truncate text-sm font-medium text-anthracite">{item.name}</p>
                <p className="shrink-0 text-xs text-anthracite-soft">
                  {item.stock}
                  {UNIT_LABEL[item.unit]} / min {item.minStock}
                  {UNIT_LABEL[item.unit]}
                </p>
              </div>
              <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-paper-muted">
                <div
                  className="h-full rounded-full bg-velvet-rose"
                  style={{ width: `${Math.min(ratio, 1) * 100}%` }}
                />
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
