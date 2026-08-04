'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Receipt } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createGasto, getGastos } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

const DEFAULT_FORM = { description: '', category: '', amount: 0 };

export default function GastosPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: gastos, isLoading } = useQuery({
    queryKey: ['gastos'],
    queryFn: () => getGastos(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => createGasto(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsModalOpen(false);
      setForm(DEFAULT_FORM);
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-anthracite">Gastos</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Manuales y automáticos (generados por Compras).
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo gasto
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : gastos && gastos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Descripción</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 font-medium">Origen</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {gastos.map((gasto) => (
                  <tr key={gasto.id}>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {new Date(gasto.expenseDate).toLocaleDateString('es-PY')}
                    </td>
                    <td className="px-5 py-3 font-medium text-anthracite">
                      {gasto.description}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">{gasto.category ?? '—'}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                          gasto.origin === 'MANUAL'
                            ? 'bg-blush text-anthracite'
                            : 'bg-champagne-gold/10 text-champagne-dark'
                        }`}
                      >
                        {gasto.origin === 'MANUAL' ? 'Manual' : 'Automático (compra)'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-anthracite">
                      {formatGuaranies(gasto.amount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Receipt className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay gastos registrados.</p>
          </div>
        )}
      </div>

      <Modal title="Nuevo gasto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Descripción">
            <input
              required
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Categoría">
            <input
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              placeholder="Ej: Alquiler, Servicios, Sueldos…"
            />
          </Field>
          <Field label="Monto (₲)">
            <input
              type="number"
              min={0}
              required
              className={inputClass}
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: Number(e.target.value) })}
            />
          </Field>
          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo guardar el gasto.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
