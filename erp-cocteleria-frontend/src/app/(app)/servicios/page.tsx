'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import {
  createServicio,
  deleteServicio,
  getServicios,
  updateServicio,
  type Servicio,
} from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary, buttonGhost, buttonDanger } from '@/components/ui/styles';

const DEFAULT_FORM = { name: '', description: '', category: '', unitPrice: 0 };

export default function ServiciosPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: servicios, isLoading } = useQuery({
    queryKey: ['servicios'],
    queryFn: () => getServicios(token!),
    enabled: !!token,
  });

  function closeModal() {
    setIsModalOpen(false);
    setEditingId(null);
    setForm(DEFAULT_FORM);
  }

  function openCreate() {
    setEditingId(null);
    setForm(DEFAULT_FORM);
    setIsModalOpen(true);
  }

  function openEdit(servicio: Servicio) {
    setEditingId(servicio.id);
    setForm({
      name: servicio.name,
      description: servicio.description ?? '',
      category: servicio.category ?? '',
      unitPrice: servicio.unitPrice,
    });
    setIsModalOpen(true);
  }

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = {
        name: form.name,
        description: form.description || undefined,
        category: form.category || undefined,
        unitPrice: form.unitPrice,
      };
      return editingId
        ? updateServicio(token!, editingId, payload)
        : createServicio(token!, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteServicio(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['servicios'] });
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    saveMutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-anthracite">Servicios</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Catálogo de staff extra, equipamiento y logística asignable a un evento.
          </p>
        </div>
        <button type="button" onClick={openCreate} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo servicio
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : servicios && servicios.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Nombre</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 text-right font-medium">Precio</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {servicios.map((servicio) => (
                  <tr key={servicio.id}>
                    <td className="px-5 py-3 font-medium text-anthracite">
                      {servicio.name}
                      {servicio.description && (
                        <p className="mt-0.5 text-xs font-normal text-anthracite-soft">
                          {servicio.description}
                        </p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {servicio.category ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-anthracite">
                      {formatGuaranies(servicio.unitPrice)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => openEdit(servicio)}
                          className={buttonGhost}
                        >
                          Editar
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            if (confirm(`¿Eliminar el servicio "${servicio.name}"?`)) {
                              deleteMutation.mutate(servicio.id);
                            }
                          }}
                          className={buttonDanger}
                        >
                          Eliminar
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Sparkles className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay servicios cargados.</p>
          </div>
        )}
      </div>

      <Modal
        title={editingId ? 'Editar servicio' : 'Nuevo servicio'}
        isOpen={isModalOpen}
        onClose={closeModal}
      >
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <Field label="Categoría">
            <input
              placeholder="Staff extra, Equipamiento, Logística…"
              className={inputClass}
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            />
          </Field>
          <Field label="Descripción">
            <input
              className={inputClass}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>
          <Field label="Precio unitario (₲)">
            <input
              type="number"
              min={0}
              className={inputClass}
              value={form.unitPrice}
              onChange={(e) => setForm({ ...form, unitPrice: Number(e.target.value) })}
            />
          </Field>
          {saveMutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo guardar el servicio.</p>
          )}
          <button type="submit" disabled={saveMutation.isPending} className={buttonPrimary}>
            {saveMutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
