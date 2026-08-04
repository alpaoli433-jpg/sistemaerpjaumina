'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Plus, ShoppingCart, Trash2 } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { anularCompra, createCompra, getCompras, getProductos, getProveedores } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary, buttonGhost, buttonDanger } from '@/components/ui/styles';

interface ItemForm {
  productoId: string;
  quantity: number;
  unitCost: number;
}

const EMPTY_ITEM: ItemForm = { productoId: '', quantity: 1, unitCost: 0 };

export default function ComprasPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [proveedorId, setProveedorId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [items, setItems] = useState<ItemForm[]>([{ ...EMPTY_ITEM }]);

  const { data: compras, isLoading } = useQuery({
    queryKey: ['compras'],
    queryFn: () => getCompras(token!),
    enabled: !!token,
  });
  const { data: proveedores } = useQuery({
    queryKey: ['proveedores'],
    queryFn: () => getProveedores(token!),
    enabled: !!token,
  });
  const { data: productos } = useQuery({
    queryKey: ['productos'],
    queryFn: () => getProductos(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () =>
      createCompra(token!, {
        proveedorId,
        invoiceNumber: invoiceNumber || undefined,
        items,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
      setIsModalOpen(false);
      setProveedorId('');
      setInvoiceNumber('');
      setItems([{ ...EMPTY_ITEM }]);
    },
  });

  const anularMutation = useMutation({
    mutationFn: (id: string) => anularCompra(token!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['compras'] });
      queryClient.invalidateQueries({ queryKey: ['productos'] });
      queryClient.invalidateQueries({ queryKey: ['gastos'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard-summary'] });
    },
  });

  function updateItem(index: number, patch: Partial<ItemForm>) {
    setItems((prev) => prev.map((item, i) => (i === index ? { ...item, ...patch } : item)));
  }

  function handleProductoChange(index: number, productoId: string) {
    const producto = productos?.find((p) => p.id === productoId);
    updateItem(index, { productoId, unitCost: producto?.costPrice ?? 0 });
  }

  const total = items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    mutation.mutate();
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-anthracite">Compras</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Registrá compras a proveedores — el stock y el gasto se actualizan solos.
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nueva compra
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : compras && compras.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Proveedor</th>
                  <th className="px-5 py-3 font-medium">Factura</th>
                  <th className="px-5 py-3 font-medium">Items</th>
                  <th className="px-5 py-3 text-right font-medium">Total</th>
                  <th className="px-5 py-3 font-medium" />
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {compras.map((compra) => (
                  <tr key={compra.id}>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {new Date(compra.purchaseDate).toLocaleDateString('es-PY')}
                    </td>
                    <td className="px-5 py-3 font-medium text-anthracite">
                      {compra.proveedor.name}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {compra.invoiceNumber ?? '—'}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {compra.items.map((item) => item.producto.name).join(', ')}
                    </td>
                    <td
                      className={`px-5 py-3 text-right font-medium ${
                        compra.status === 'ANULADA'
                          ? 'text-anthracite-soft line-through'
                          : 'text-anthracite'
                      }`}
                    >
                      {formatGuaranies(compra.totalAmount)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {compra.status !== 'ANULADA' && (
                        <button
                          type="button"
                          onClick={() => {
                            if (
                              confirm(
                                '¿Anular esta compra? Se revertirá el stock y el gasto asociado.',
                              )
                            ) {
                              anularMutation.mutate(compra.id);
                            }
                          }}
                          className={buttonDanger}
                        >
                          Anular
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <ShoppingCart className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay compras registradas.</p>
          </div>
        )}
      </div>

      <Modal title="Nueva compra" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Proveedor">
            <select
              required
              className={inputClass}
              value={proveedorId}
              onChange={(e) => setProveedorId(e.target.value)}
            >
              <option value="">Seleccioná un proveedor…</option>
              {proveedores?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </Field>
          <Field label="N° de factura (opcional)">
            <input
              className={inputClass}
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
            />
          </Field>

          <div className="flex flex-col gap-3">
            <span className="text-sm font-medium text-anthracite">Items</span>
            {items.map((item, index) => (
              <div key={index} className="flex items-end gap-2 rounded-lg bg-paper-muted p-3">
                <div className="flex-1">
                  <Field label="Producto">
                    <select
                      required
                      className={inputClass}
                      value={item.productoId}
                      onChange={(e) => handleProductoChange(index, e.target.value)}
                    >
                      <option value="">Seleccioná…</option>
                      {productos?.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
                <div className="w-20">
                  <Field label="Cant.">
                    <input
                      type="number"
                      min={0.01}
                      step="any"
                      required
                      className={inputClass}
                      value={item.quantity}
                      onChange={(e) => updateItem(index, { quantity: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <div className="w-28">
                  <Field label="Costo unit.">
                    <input
                      type="number"
                      min={0}
                      required
                      className={inputClass}
                      value={item.unitCost}
                      onChange={(e) => updateItem(index, { unitCost: Number(e.target.value) })}
                    />
                  </Field>
                </div>
                <button
                  type="button"
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  disabled={items.length === 1}
                  className={buttonDanger}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => setItems((prev) => [...prev, { ...EMPTY_ITEM }])}
              className={buttonGhost}
            >
              + Agregar item
            </button>
          </div>

          <div className="flex items-center justify-between border-t border-anthracite/10 pt-3">
            <span className="text-sm font-medium text-anthracite">Total</span>
            <span className="font-display text-lg font-semibold text-anthracite">
              {formatGuaranies(total)}
            </span>
          </div>

          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo registrar la compra.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Registrar compra'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
