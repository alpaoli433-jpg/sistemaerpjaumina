'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getAuditoria } from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { inputClass } from '@/components/ui/Field';
import { buttonGhost } from '@/components/ui/styles';

const PAGE_SIZE = 20;

export default function AuditoriaPage() {
  const { token } = useAuth();
  const [entity, setEntity] = useState('');
  const [page, setPage] = useState(0);

  const { data, isLoading } = useQuery({
    queryKey: ['auditoria', entity, page],
    queryFn: () =>
      getAuditoria(token!, {
        entity: entity || undefined,
        take: PAGE_SIZE,
        skip: page * PAGE_SIZE,
      }),
    enabled: !!token,
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / PAGE_SIZE)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-anthracite">Auditoría</h1>
        <p className="mt-1 text-sm text-anthracite-soft">
          Quién hizo qué, cuándo y sobre qué tabla.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <select
          className={`${inputClass} w-56`}
          value={entity}
          onChange={(e) => {
            setEntity(e.target.value);
            setPage(0);
          }}
        >
          <option value="">Todas las entidades</option>
          <option value="Cliente">Cliente</option>
          <option value="Proveedor">Proveedor</option>
          <option value="Producto">Producto</option>
          <option value="Compra">Compra</option>
          <option value="Venta">Venta</option>
          <option value="Gasto">Gasto</option>
          <option value="Empleado">Empleado</option>
          <option value="CajaSesion">CajaSesion</option>
          <option value="Event">Event</option>
          <option value="Recipe">Recipe</option>
        </select>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-8 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-8 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : data && data.data.length > 0 ? (
          <ul className="divide-y divide-anthracite/8">
            {data.data.map((entry) => (
              <li key={entry.id} className="flex items-start justify-between gap-4 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm text-anthracite">{entry.details ?? entry.action}</p>
                  <p className="mt-0.5 text-xs text-anthracite-soft">
                    {entry.user.name} · {entry.action} · {entry.entity}
                  </p>
                </div>
                <p className="shrink-0 text-xs text-anthracite-soft">
                  {formatRelativeTime(entry.createdAt)}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <ShieldCheck className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">No hay actividad para este filtro.</p>
          </div>
        )}
      </div>

      {data && data.total > PAGE_SIZE && (
        <div className="flex items-center justify-between text-sm text-anthracite-soft">
          <span>
            Página {page + 1} de {totalPages} · {data.total} registros
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page === 0}
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              className={buttonGhost}
            >
              Anterior
            </button>
            <button
              type="button"
              disabled={page + 1 >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={buttonGhost}
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
