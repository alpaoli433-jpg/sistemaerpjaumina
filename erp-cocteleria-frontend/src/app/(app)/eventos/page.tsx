'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { CalendarDays, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createEvent, getEvents, getRecipes, getStaff } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

const STATUS_LABEL: Record<string, string> = {
  COTIZADO: 'Cotizado',
  CONFIRMADO: 'Confirmado',
  EN_CURSO: 'En curso',
  FINALIZADO: 'Finalizado',
  CANCELADO: 'Cancelado',
};

const STATUS_TONE: Record<string, string> = {
  COTIZADO: 'bg-blush text-anthracite',
  CONFIRMADO: 'bg-champagne-gold/10 text-champagne-dark',
  EN_CURSO: 'bg-ice-emerald/10 text-ice-emerald',
  FINALIZADO: 'bg-paper-muted text-anthracite-soft',
  CANCELADO: 'bg-velvet-rose/10 text-velvet-rose',
};

const DEFAULT_FORM = {
  title: '',
  clientName: '',
  clientPhone: '',
  location: '',
  eventDate: '',
  guestsCount: 50,
  serviceHours: 4,
  totalAmount: 0,
  depositPaid: 0,
};

export default function EventosPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [recipeIds, setRecipeIds] = useState<string[]>([]);
  const [staffIds, setStaffIds] = useState<string[]>([]);

  const { data: eventos, isLoading } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(token!),
    enabled: !!token,
  });
  const { data: recetas } = useQuery({
    queryKey: ['recipes'],
    queryFn: getRecipes,
  });
  const { data: staff } = useQuery({
    queryKey: ['staff'],
    queryFn: () => getStaff(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createEvent(token!, {
        ...form,
        clientPhone: form.clientPhone || undefined,
        recipeIds: recipeIds.length > 0 ? recipeIds : undefined,
        staffIds: staffIds.length > 0 ? staffIds : undefined,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsModalOpen(false);
      setForm(DEFAULT_FORM);
      setRecipeIds([]);
      setStaffIds([]);
    },
  });

  function toggleRecipe(id: string) {
    setRecipeIds((prev) => (prev.includes(id) ? prev.filter((r) => r !== id) : [...prev, id]));
  }

  function toggleStaff(id: string) {
    setStaffIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-anthracite">Eventos</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Coctelería para eventos privados — cotizaciones, agenda y estado.
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo evento
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : eventos && eventos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Evento</th>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Invitados</th>
                  <th className="px-5 py-3 font-medium">Personal</th>
                  <th className="px-5 py-3 font-medium">Estado</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {eventos.map((evento) => (
                  <tr key={evento.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-anthracite">{evento.title}</p>
                      <p className="text-xs text-anthracite-soft">
                        {evento.clientName} · {evento.location}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {new Date(evento.eventDate).toLocaleDateString('es-PY', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">{evento.guestsCount}</td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {evento.staff.length > 0
                        ? evento.staff.map((s) => s.staff.name).join(', ')
                        : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-medium ${STATUS_TONE[evento.status] ?? 'bg-paper-muted text-anthracite-soft'}`}
                      >
                        {STATUS_LABEL[evento.status] ?? evento.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-anthracite">
                      {formatGuaranies(evento.totalAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <CalendarDays className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay eventos registrados.</p>
          </div>
        )}
      </div>

      <Modal title="Nuevo evento" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto">
          <Field label="Título">
            <input
              required
              className={inputClass}
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              placeholder="Ej: Casamiento Pérez - Salón Aurora"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Cliente">
              <input
                required
                className={inputClass}
                value={form.clientName}
                onChange={(e) => setForm({ ...form, clientName: e.target.value })}
              />
            </Field>
            <Field label="Teléfono">
              <input
                className={inputClass}
                value={form.clientPhone}
                onChange={(e) => setForm({ ...form, clientPhone: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Ubicación">
            <input
              required
              className={inputClass}
              value={form.location}
              onChange={(e) => setForm({ ...form, location: e.target.value })}
            />
          </Field>
          <Field label="Fecha y hora">
            <input
              type="datetime-local"
              required
              className={inputClass}
              value={form.eventDate}
              onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Invitados">
              <input
                type="number"
                min={1}
                required
                className={inputClass}
                value={form.guestsCount}
                onChange={(e) => setForm({ ...form, guestsCount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Horas de servicio">
              <input
                type="number"
                min={1}
                className={inputClass}
                value={form.serviceHours}
                onChange={(e) => setForm({ ...form, serviceHours: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Total cotizado (₲)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.totalAmount}
                onChange={(e) => setForm({ ...form, totalAmount: Number(e.target.value) })}
              />
            </Field>
            <Field label="Seña (₲)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.depositPaid}
                onChange={(e) => setForm({ ...form, depositPaid: Number(e.target.value) })}
              />
            </Field>
          </div>

          {recetas && recetas.length > 0 && (
            <div>
              <span className="text-sm font-medium text-anthracite">Menú (opcional)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {recetas.map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => toggleRecipe(r.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      recipeIds.includes(r.id)
                        ? 'border-champagne-gold bg-champagne-gold/10 text-champagne-dark'
                        : 'border-anthracite/15 text-anthracite-soft hover:text-anthracite'
                    }`}
                  >
                    {r.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {staff && staff.length > 0 && (
            <div>
              <span className="text-sm font-medium text-anthracite">Personal asignado (opcional)</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {staff.map((s) => (
                  <button
                    type="button"
                    key={s.id}
                    onClick={() => toggleStaff(s.id)}
                    className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
                      staffIds.includes(s.id)
                        ? 'border-champagne-gold bg-champagne-gold/10 text-champagne-dark'
                        : 'border-anthracite/15 text-anthracite-soft hover:text-anthracite'
                    }`}
                  >
                    {s.name} · {s.role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo guardar el evento.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
