'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { abrirCaja, cerrarCaja, getCajaActual, getSesionesCaja } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

export default function CajaPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isAbrirOpen, setIsAbrirOpen] = useState(false);
  const [isCerrarOpen, setIsCerrarOpen] = useState(false);
  const [openingAmount, setOpeningAmount] = useState(0);
  const [closingAmount, setClosingAmount] = useState(0);

  const { data: actual, isLoading: loadingActual } = useQuery({
    queryKey: ['caja-actual'],
    queryFn: () => getCajaActual(token!),
    enabled: !!token,
  });
  const { data: sesiones, isLoading: loadingSesiones } = useQuery({
    queryKey: ['caja-sesiones'],
    queryFn: () => getSesionesCaja(token!),
    enabled: !!token,
  });

  function invalidateCaja() {
    queryClient.invalidateQueries({ queryKey: ['caja-actual'] });
    queryClient.invalidateQueries({ queryKey: ['caja-sesiones'] });
  }

  const abrirMutation = useMutation({
    mutationFn: () => abrirCaja(token!, { openingAmount }),
    onSuccess: () => {
      invalidateCaja();
      setIsAbrirOpen(false);
      setOpeningAmount(0);
    },
  });

  const cerrarMutation = useMutation({
    mutationFn: () => cerrarCaja(token!, actual!.id, { closingAmount }),
    onSuccess: () => {
      invalidateCaja();
      setIsCerrarOpen(false);
      setClosingAmount(0);
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-anthracite">Caja</h1>
        <p className="mt-1 text-sm text-anthracite-soft">Apertura, cierre y arqueo diario.</p>
      </div>

      <div className="surface-card flex flex-col gap-4 rounded-2xl p-5 sm:flex-row sm:items-center sm:justify-between">
        {loadingActual ? (
          <div className="h-10 w-full animate-pulse rounded-lg bg-paper-muted" />
        ) : actual ? (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-ice-emerald/10 text-ice-emerald">
                <Wallet className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-medium text-anthracite">Caja abierta</p>
                <p className="text-xs text-anthracite-soft">
                  Desde {new Date(actual.openedAt).toLocaleString('es-PY')} · Apertura{' '}
                  {formatGuaranies(actual.openingAmount)}
                </p>
              </div>
            </div>
            <button type="button" onClick={() => setIsCerrarOpen(true)} className={buttonPrimary}>
              Cerrar caja
            </button>
          </>
        ) : (
          <>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blush text-anthracite">
                <Wallet className="h-5 w-5" strokeWidth={1.75} />
              </span>
              <div>
                <p className="text-sm font-medium text-anthracite">No hay caja abierta</p>
                <p className="text-xs text-anthracite-soft">Abrí una sesión para empezar a vender.</p>
              </div>
            </div>
            <button type="button" onClick={() => setIsAbrirOpen(true)} className={buttonPrimary}>
              Abrir caja
            </button>
          </>
        )}
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        <h2 className="border-b border-anthracite/8 px-5 py-4 font-display text-sm font-semibold text-anthracite">
          Historial de sesiones
        </h2>
        {loadingSesiones ? (
          <div className="space-y-3 p-5">
            <div className="h-8 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : sesiones && sesiones.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Apertura</th>
                  <th className="px-5 py-3 font-medium">Cierre</th>
                  <th className="px-5 py-3 text-right font-medium">Esperado</th>
                  <th className="px-5 py-3 text-right font-medium">Contado</th>
                  <th className="px-5 py-3 text-right font-medium">Diferencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {sesiones.map((sesion) => {
                  const diferencia =
                    sesion.closingAmount != null && sesion.expectedAmount != null
                      ? sesion.closingAmount - sesion.expectedAmount
                      : null;
                  return (
                    <tr key={sesion.id}>
                      <td className="px-5 py-3 text-anthracite-soft">
                        {new Date(sesion.openedAt).toLocaleString('es-PY')}
                      </td>
                      <td className="px-5 py-3 text-anthracite-soft">
                        {sesion.closedAt
                          ? new Date(sesion.closedAt).toLocaleString('es-PY')
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-anthracite-soft">
                        {sesion.expectedAmount != null
                          ? formatGuaranies(sesion.expectedAmount)
                          : '—'}
                      </td>
                      <td className="px-5 py-3 text-right text-anthracite-soft">
                        {sesion.closingAmount != null
                          ? formatGuaranies(sesion.closingAmount)
                          : '—'}
                      </td>
                      <td
                        className={`px-5 py-3 text-right font-medium ${
                          diferencia == null
                            ? 'text-anthracite-soft'
                            : diferencia < 0
                              ? 'text-velvet-rose'
                              : 'text-ice-emerald'
                        }`}
                      >
                        {diferencia != null ? formatGuaranies(diferencia) : '—'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="px-5 py-10 text-center text-sm text-anthracite-soft">
            Todavía no hay sesiones de caja.
          </p>
        )}
      </div>

      <Modal title="Abrir caja" isOpen={isAbrirOpen} onClose={() => setIsAbrirOpen(false)}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            abrirMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <Field label="Monto de apertura (₲)">
            <input
              type="number"
              min={0}
              required
              className={inputClass}
              value={openingAmount}
              onChange={(e) => setOpeningAmount(Number(e.target.value))}
            />
          </Field>
          {abrirMutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo abrir la caja.</p>
          )}
          <button type="submit" disabled={abrirMutation.isPending} className={buttonPrimary}>
            {abrirMutation.isPending ? 'Abriendo…' : 'Abrir caja'}
          </button>
        </form>
      </Modal>

      <Modal title="Cerrar caja (arqueo)" isOpen={isCerrarOpen} onClose={() => setIsCerrarOpen(false)}>
        <form
          onSubmit={(e: FormEvent) => {
            e.preventDefault();
            cerrarMutation.mutate();
          }}
          className="flex flex-col gap-4"
        >
          <Field label="Monto contado en caja (₲)">
            <input
              type="number"
              min={0}
              required
              className={inputClass}
              value={closingAmount}
              onChange={(e) => setClosingAmount(Number(e.target.value))}
            />
          </Field>
          {cerrarMutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo cerrar la caja.</p>
          )}
          <button type="submit" disabled={cerrarMutation.isPending} className={buttonPrimary}>
            {cerrarMutation.isPending ? 'Cerrando…' : 'Cerrar caja'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
