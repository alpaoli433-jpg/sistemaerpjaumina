'use client';

import { useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { addMovimientoEmpleado, getEmpleado, type EmpleadoMovimientoTipo } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

export default function EmpleadoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ tipo: 'ADELANTO' as EmpleadoMovimientoTipo, amount: 0, notes: '' });

  const { data: empleado, isLoading } = useQuery({
    queryKey: ['personal', id],
    queryFn: () => getEmpleado(token!, id),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => addMovimientoEmpleado(token!, id, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal', id] });
      setIsModalOpen(false);
      setForm({ tipo: 'ADELANTO', amount: 0, notes: '' });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <Link
        href="/personal"
        className="flex w-fit items-center gap-1.5 text-sm text-anthracite-soft hover:text-anthracite"
      >
        <ArrowLeft className="h-4 w-4" /> Volver a Personal
      </Link>

      {isLoading || !empleado ? (
        <div className="h-32 animate-pulse rounded-2xl bg-paper-muted" />
      ) : (
        <>
          <div className="flex items-center justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-semibold text-anthracite">
                {empleado.name}
              </h1>
              <p className="mt-1 text-sm text-anthracite-soft">
                {empleado.position} · {formatGuaranies(empleado.salary)}
              </p>
            </div>
            <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
              <span className="flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> Adelanto / Préstamo
              </span>
            </button>
          </div>

          <div className="surface-card overflow-hidden rounded-2xl">
            <h2 className="border-b border-anthracite/8 px-5 py-4 font-display text-sm font-semibold text-anthracite">
              Adelantos y préstamos
            </h2>
            {empleado.movimientos.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-anthracite-soft">
                Todavía no hay movimientos registrados.
              </p>
            ) : (
              <ul className="divide-y divide-anthracite/8">
                {empleado.movimientos.map((mov) => (
                  <li key={mov.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-anthracite">
                        {mov.tipo === 'ADELANTO' ? 'Adelanto' : 'Préstamo'}
                      </p>
                      <p className="text-xs text-anthracite-soft">
                        {new Date(mov.date).toLocaleDateString('es-PY')}
                        {mov.notes ? ` — ${mov.notes}` : ''}
                      </p>
                    </div>
                    <p className="font-medium text-anthracite">{formatGuaranies(mov.amount)}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}

      <Modal
        title="Registrar adelanto / préstamo"
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Tipo">
            <select
              className={inputClass}
              value={form.tipo}
              onChange={(e) =>
                setForm({ ...form, tipo: e.target.value as EmpleadoMovimientoTipo })
              }
            >
              <option value="ADELANTO">Adelanto</option>
              <option value="PRESTAMO">Préstamo</option>
            </select>
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
          <Field label="Notas">
            <input
              className={inputClass}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
            />
          </Field>
          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo registrar el movimiento.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
