import { LogIn, PlusCircle, Pencil, Trash2, Activity } from 'lucide-react';
import type { AuditLogEntry } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';

function iconForAction(action: string) {
  if (action === 'LOGIN') return LogIn;
  if (action.startsWith('CREATE_')) return PlusCircle;
  if (action.startsWith('UPDATE_')) return Pencil;
  if (action.startsWith('DELETE_')) return Trash2;
  return Activity;
}

interface ActividadRecienteListProps {
  entries: AuditLogEntry[];
}

export function ActividadRecienteList({ entries }: ActividadRecienteListProps) {
  if (entries.length === 0) {
    return (
      <div className="flex h-full items-center justify-center py-10 text-center text-sm text-anthracite-soft">
        Todavía no hay actividad registrada.
      </div>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {entries.map((entry) => {
        const Icon = iconForAction(entry.action);
        return (
          <li key={entry.id} className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blush text-champagne-dark">
              <Icon className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm text-anthracite">{entry.details ?? entry.action}</p>
              <p className="mt-0.5 text-xs text-anthracite-soft">
                {entry.user.name} · {formatRelativeTime(entry.createdAt)}
              </p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
