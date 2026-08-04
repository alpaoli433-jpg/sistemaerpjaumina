'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowDownCircle, ArrowUpCircle, SlidersHorizontal } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  getMovimientosInventario,
  getProductos,
  registrarMovimientoInventario,
  type MovimientoTipo,
} from '@/lib/api';
import { formatRelativeTime } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary, buttonGhost } from '@/components/ui/styles';

const TIPO_ICON: Record<MovimientoTipo, typeof ArrowUpCircle> = {
  ENTRADA: ArrowUpCircle,
  SALIDA: ArrowDownCircle,
  AJUSTE: SlidersHorizontal,
};

const TIPO_COLOR: Record<MovimientoTipo, string> = {
  ENTRADA: 'text-ice-emerald bg-ice-emerald/10',
  SALIDA: 'text-velvet-rose bg-velvet-rose/10',
  AJUSTE: 'text-champagne-dark bg-champagne-gold/10',
};

export default function InventarioPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({
    productoId: '',
    tipo: 'AJUSTE' as MovimientoTipo,
    quantity: 0,
    reason: '',
  });

  const { data: productos } = useQuery({
    queryKey: ['productos'],
    queryFn: () => getProductos(token!),
    enabled: !!token,
  });

  const { data: movimientos, isLoading } = useQuery({
    queryKey: ['inventario-movimientos'],
    queryFn: () => getMovimientosInventario(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => registrarMovimientoInventario(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['inventario-movimientos'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsModalOpen(false);
      setForm({ productoId: '', tipo: 'AJUSTE', quantity: 0, reason: '' });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  const stockCritico = productos?.filter((p) => p.stock <= p.minStock) ?? [];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-anthracite">Inventario</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Stock actual, alertas y movimientos (entradas, salidas y ajustes).
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          Registrar movimiento
        </button>
      </div>

      {stockCritico.length > 0 && (
        <div className="surface-card rounded-2xl border-velvet-rose/25 p-5">
          <h2 className="font-display text-sm font-semibold text-velvet-rose">
            Stock crítico ({stockCritico.length})
          </h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {stockCritico.map((p) => (
              <span
                key={p.id}
                className="rounded-full bg-velvet-rose/10 px-3 py-1 text-xs font-medium text-velvet-rose"
              >
                {p.name}: {p.stock} / min {p.minStock}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="surface-card overflow-hidden rounded-2xl">
        <h2 className="border-b border-anthracite/8 px-5 py-4 font-display text-sm font-semibold text-anthracite">
          Historial de movimientos
        </h2>
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-8 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-8 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : movimientos && movimientos.length > 0 ? (
          <ul className="divide-y divide-anthracite/8">
            {movimientos.map((mov) => {
              const Icon = TIPO_ICON[mov.tipo];
              return (
                <li key={mov.id} className="flex items-center gap-3 px-5 py-3">
                  <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${TIPO_COLOR[mov.tipo]}`}>
                    <Icon className="h-4 w-4" strokeWidth={1.75} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-anthracite">
                      <span className="font-medium">{mov.producto.name}</span> · {mov.tipo}{' '}
                      {mov.quantity} · {mov.origen}
                      {mov.reason ? ` — ${mov.reason}` : ''}
                    </p>
                    <p className="text-xs text-anthracite-soft">
                      {formatRelativeTime(mov.createdAt)}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-anthracite-soft">
            Todavía no hay movimientos registrados.
          </p>
        )}
      </div>

      <Modal
        title="Registrar movimiento de inventario"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Producto">
            <select
              required
              className={inputClass}
              value={form.productoId}
              onChange={(e) => setForm({ ...form, productoId: e.target.value })}
            >
              <option value="">Seleccioná un producto…</option>
              {productos?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (stock: {p.stock})
                </option>
              ))}
            </select>
          </Field>
          <Field label="Tipo de movimiento">
            <select
              className={inputClass}
              value={form.tipo}
              onChange={(e) => setForm({ ...form, tipo: e.target.value as MovimientoTipo })}
            >
              <option value="ENTRADA">Entrada</option>
              <option value="SALIDA">Salida</option>
              <option value="AJUSTE">Ajuste (fijar stock absoluto)</option>
            </select>
          </Field>
          <Field label={form.tipo === 'AJUSTE' ? 'Nuevo stock absoluto' : 'Cantidad'}>
            <input
              type="number"
              min={0}
              step="any"
              required
              className={inputClass}
              value={form.quantity}
              onChange={(e) => setForm({ ...form, quantity: Number(e.target.value) })}
            />
          </Field>
          <Field label="Motivo">
            <input
              className={inputClass}
              value={form.reason}
              onChange={(e) => setForm({ ...form, reason: e.target.value })}
              placeholder="Ej: conteo físico, merma, rotura…"
            />
          </Field>
          {mutation.isError && (
            <p className="text-sm text-velvet-rose">
              No se pudo registrar el movimiento (revisá el stock disponible).
            </p>
          )}
          <div className="flex gap-2">
            <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
              {mutation.isPending ? 'Guardando…' : 'Registrar'}
            </button>
            <button type="button" onClick={() => setIsModalOpen(false)} className={buttonGhost}>
              Cancelar
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
