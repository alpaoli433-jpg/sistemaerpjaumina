'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getCliente } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';

const VENTA_STATUS_LABEL: Record<string, string> = {
  PAGADA: 'Pagada',
  PENDIENTE: 'Pendiente',
  ANULADA: 'Anulada',
};

export default function ClienteDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();

  const { data: cliente, isLoading } = useQuery({
    queryKey: ['clientes', id],
    queryFn: () => getCliente(token!, id),
    enabled: !!token,
  });

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/clientes"
        className="flex w-fit items-center gap-1.5 text-sm text-anthracite-soft hover:text-anthracite"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Clientes
      </Link>

      {isLoading || !cliente ? (
        <div className="h-32 animate-pulse rounded-2xl bg-paper-muted" />
      ) : (
        <>
          <div>
            <h1 className="font-display text-2xl font-semibold text-anthracite">
              {cliente.name}
            </h1>
            <p className="mt-1 text-sm text-anthracite-soft">
              {[cliente.phone, cliente.email, cliente.documento].filter(Boolean).join(' · ') ||
                'Sin datos de contacto'}
            </p>
          </div>

          <div className="surface-card overflow-hidden rounded-2xl">
            <h2 className="border-b border-anthracite/8 px-5 py-4 font-display text-sm font-semibold text-anthracite">
              Historial de ventas
            </h2>
            {cliente.ventas.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-anthracite-soft">
                Este cliente todavía no tiene ventas registradas.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                    <tr>
                      <th className="px-5 py-3 font-medium">Fecha</th>
                      <th className="px-5 py-3 font-medium">Items</th>
                      <th className="px-5 py-3 font-medium">Estado</th>
                      <th className="px-5 py-3 text-right font-medium">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-anthracite/8">
                    {cliente.ventas.map((venta) => (
                      <tr key={venta.id}>
                        <td className="px-5 py-3 text-anthracite-soft">
                          {new Date(venta.saleDate).toLocaleDateString('es-PY')}
                        </td>
                        <td className="px-5 py-3 text-anthracite-soft">
                          {venta.items.map((item) => item.producto.name).join(', ')}
                        </td>
                        <td className="px-5 py-3 text-anthracite-soft">
                          {VENTA_STATUS_LABEL[venta.status] ?? venta.status}
                        </td>
                        <td className="px-5 py-3 text-right font-medium text-anthracite">
                          {formatGuaranies(venta.totalAmount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
