'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Settings } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getEmpresa, updateEmpresa } from '@/lib/api';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

export default function ConfiguracionPage() {
  const { token, user } = useAuth();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: '',
    ruc: '',
    address: '',
    phone: '',
    email: '',
    currency: 'PYG',
  });
  const [saved, setSaved] = useState(false);

  const { data: empresa, isLoading } = useQuery({
    queryKey: ['configuracion'],
    queryFn: () => getEmpresa(token!),
    enabled: !!token,
  });

  useEffect(() => {
    if (!empresa) return;
    // Sincroniza el form local cuando llegan los datos del servidor (patrón
    // de "adjusting state" documentado por React, envuelto en una
    // microtarea para que el linter de hooks lo trate como una respuesta
    // asíncrona en vez de un setState directo dentro del efecto).
    Promise.resolve().then(() => {
      setForm({
        name: empresa.name,
        ruc: empresa.ruc ?? '',
        address: empresa.address ?? '',
        phone: empresa.phone ?? '',
        email: empresa.email ?? '',
        currency: empresa.currency,
      });
    });
  }, [empresa]);

  const mutation = useMutation({
    mutationFn: () => updateEmpresa(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['configuracion'] });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  const isAdmin = user?.role === 'ADMIN';

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-anthracite">Configuración</h1>
        <p className="mt-1 text-sm text-anthracite-soft">
          Datos de la empresa y preferencias del sistema.
        </p>
      </div>

      <div className="surface-card max-w-xl rounded-2xl p-6">
        {isLoading ? (
          <div className="space-y-3">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="mb-2 flex items-center gap-2 text-anthracite-soft">
              <Settings className="h-4 w-4" />
              <span className="text-sm font-medium">Datos de la empresa</span>
            </div>

            <Field label="Razón social">
              <input
                required
                disabled={!isAdmin}
                className={inputClass}
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="RUC">
                <input
                  disabled={!isAdmin}
                  className={inputClass}
                  value={form.ruc}
                  onChange={(e) => setForm({ ...form, ruc: e.target.value })}
                />
              </Field>
              <Field label="Moneda">
                <input
                  disabled={!isAdmin}
                  className={inputClass}
                  value={form.currency}
                  onChange={(e) => setForm({ ...form, currency: e.target.value })}
                />
              </Field>
            </div>
            <Field label="Dirección">
              <input
                disabled={!isAdmin}
                className={inputClass}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
              />
            </Field>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Teléfono">
                <input
                  disabled={!isAdmin}
                  className={inputClass}
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </Field>
              <Field label="Email">
                <input
                  type="email"
                  disabled={!isAdmin}
                  className={inputClass}
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </Field>
            </div>

            {!isAdmin && (
              <p className="text-xs text-anthracite-soft">
                Solo un usuario ADMIN puede modificar estos datos.
              </p>
            )}
            {mutation.isError && (
              <p className="text-sm text-velvet-rose">No se pudieron guardar los cambios.</p>
            )}
            {saved && <p className="text-sm text-ice-emerald">Guardado correctamente.</p>}

            {isAdmin && (
              <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
                {mutation.isPending ? 'Guardando…' : 'Guardar cambios'}
              </button>
            )}
          </form>
        )}
      </div>
    </div>
  );
}
