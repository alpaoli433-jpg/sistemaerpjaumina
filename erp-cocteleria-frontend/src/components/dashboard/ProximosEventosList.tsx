import { CalendarDays } from 'lucide-react';
import type { EventRecord } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';

const STATUS_LABEL: Record<string, string> = {
  COTIZADO: 'Cotizado',
  CONFIRMADO: 'Confirmado',
  EN_CURSO: 'En curso',
};

interface ProximosEventosListProps {
  events: EventRecord[];
}

export function ProximosEventosList({ events }: ProximosEventosListProps) {
  if (events.length === 0) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-2 py-10 text-center">
        <CalendarDays className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
        <p className="text-sm text-anthracite-soft">No hay eventos próximos agendados.</p>
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-3">
      {events.map((event) => (
        <li key={event.id} className="flex items-center gap-3">
          <span className="flex h-9 w-9 shrink-0 flex-col items-center justify-center rounded-lg bg-champagne-gold/10 text-champagne-dark">
            <CalendarDays className="h-4 w-4" strokeWidth={1.75} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-2">
              <p className="truncate text-sm font-medium text-anthracite">{event.title}</p>
              <p className="shrink-0 text-xs text-anthracite-soft">
                {new Date(event.eventDate).toLocaleDateString('es-PY', {
                  day: '2-digit',
                  month: 'short',
                })}
              </p>
            </div>
            <p className="truncate text-xs text-anthracite-soft">
              {event.clientName} · {event.guestsCount} invitados ·{' '}
              {STATUS_LABEL[event.status] ?? event.status} ·{' '}
              {formatGuaranies(event.totalAmount)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  );
}
