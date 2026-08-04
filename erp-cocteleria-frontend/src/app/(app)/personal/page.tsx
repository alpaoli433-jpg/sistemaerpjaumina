'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { IdCard, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createEmpleado, getEmpleados } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

const DEFAULT_FORM = { name: '', position: '', phone: '', salary: 0 };

const ESTADO_LABEL: Record<string, string> = { ACTIVO: 'Activo', INACTIVO: 'Inactivo' };

export default function PersonalPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: empleados, isLoading } = useQuery({
    queryKey: ['personal'],
    queryFn: () => getEmpleados(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => createEmpleado(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['personal'] });
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
          <h1 className="font-display text-2xl font-semibold text-anthracite">Personal</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Legajos del equipo, adelantos y préstamos.
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo empleado
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : empleados && empleados.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Puesto</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Salario</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {empleados.map((empleado) => (
                  <tr key={empleado.id}>
                    <td className="px-5 py-3 font-medium text-anthracite">{empleado.name}</td>
                    <td className="px-5 py-3 text-anthracite-soft">{empleado.position}</td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {ESTADO_LABEL[empleado.status] ?? empleado.status}
                    </td>
                    <td className="px-5 py-3 text-right text-anthracite-soft">
                      {formatGuaranies(empleado.salary)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/personal/${empleado.id}`}
                        className="text-sm font-medium text-champagne-dark hover:underline"
                      >
                        Ver legajo
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <IdCard className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay empleados cargados.</p>
          </div>
        )}
      </div>

      <Modal title="Nuevo empleado" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Puesto">
            <input
              required
              className={inputClass}
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Salario (₲)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.salary}
              onChange={(e) => setForm({ ...form, salary: Number(e.target.value) })}
            />
          </Field>
          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo guardar el empleado.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
