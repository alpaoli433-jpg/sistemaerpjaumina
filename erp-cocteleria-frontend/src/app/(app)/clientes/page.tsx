'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createCliente, getClientes } from '@/lib/api';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

export default function ClientesPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', phone: '', email: '', documento: '', address: '' });

  const { data: clientes, isLoading } = useQuery({
    queryKey: ['clientes'],
    queryFn: () => getClientes(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => createCliente(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clientes'] });
      setIsModalOpen(false);
      setForm({ name: '', phone: '', email: '', documento: '', address: '' });
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
          <h1 className="font-display text-2xl font-semibold text-anthracite">Clientes</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Historial de compras, contacto y datos de facturación.
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo cliente
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : clientes && clientes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Contacto</th>
                  <th className="px-5 py-3 font-medium">Documento</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {clientes.map((cliente) => (
                  <tr key={cliente.id}>
                    <td className="px-5 py-3 font-medium text-anthracite">{cliente.name}</td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {cliente.phone ?? cliente.email ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">{cliente.documento ?? '—'}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/clientes/${cliente.id}`}
                        className="text-sm font-medium text-champagne-dark hover:underline"
                      >
                        Ver historial
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Users className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay clientes cargados.</p>
          </div>
        )}
      </div>

      <Modal title="Nuevo cliente" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Teléfono">
            <input
              className={inputClass}
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              className={inputClass}
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </Field>
          <Field label="RUC / CI">
            <input
              className={inputClass}
              value={form.documento}
              onChange={(e) => setForm({ ...form, documento: e.target.value })}
            />
          </Field>
          <Field label="Dirección">
            <input
              className={inputClass}
              value={form.address}
              onChange={(e) => setForm({ ...form, address: e.target.value })}
            />
          </Field>
          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo guardar el cliente.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
