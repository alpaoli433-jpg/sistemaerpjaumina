import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface KpiCardProps {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: 'gold' | 'emerald' | 'rose' | 'neutral';
}

const TONE_STYLES: Record<NonNullable<KpiCardProps['tone']>, string> = {
  gold: 'bg-champagne-gold/10 text-champagne-dark',
  emerald: 'bg-ice-emerald/10 text-ice-emerald',
  rose: 'bg-velvet-rose/10 text-velvet-rose',
  neutral: 'bg-blush text-anthracite',
};

export function KpiCard({ label, value, icon: Icon, tone = 'gold' }: KpiCardProps) {
  return (
    <div className="surface-card flex items-center gap-4 rounded-2xl p-5">
      <span
        className={cn(
          'flex h-11 w-11 shrink-0 items-center justify-center rounded-xl',
          TONE_STYLES[tone],
        )}
      >
        <Icon className="h-5 w-5" strokeWidth={1.75} />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-anthracite-soft">
          {label}
        </p>
        <p className="mt-0.5 truncate font-display text-xl font-semibold text-anthracite">
          {value}
        </p>
      </div>
    </div>
  );
}
