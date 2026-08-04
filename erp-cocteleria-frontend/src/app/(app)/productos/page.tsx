'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Package, Plus } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { createProducto, getProductos, type Unit } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { Modal } from '@/components/ui/Modal';
import { Field, inputClass } from '@/components/ui/Field';
import { buttonPrimary } from '@/components/ui/styles';

const UNITS: Unit[] = ['UNIDADES', 'ML', 'GRAMOS', 'KILOS'];

const DEFAULT_FORM = {
  name: '',
  code: '',
  category: '',
  unit: 'UNIDADES' as Unit,
  costPrice: 0,
  salePrice: 0,
  stock: 0,
  minStock: 0,
};

export default function ProductosPage() {
  const { token } = useAuth();
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState(DEFAULT_FORM);

  const { data: productos, isLoading } = useQuery({
    queryKey: ['productos'],
    queryFn: () => getProductos(token!),
    enabled: !!token,
  });

  const mutation = useMutation({
    mutationFn: () => createProducto(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['productos'] });
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
          <h1 className="font-display text-2xl font-semibold text-anthracite">Productos</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Catálogo, códigos, categorías, precios y stock.
          </p>
        </div>
        <button type="button" onClick={() => setIsModalOpen(true)} className={buttonPrimary}>
          <span className="flex items-center gap-1.5">
            <Plus className="h-4 w-4" /> Nuevo producto
          </span>
        </button>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {isLoading ? (
          <div className="space-y-3 p-5">
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
          </div>
        ) : productos && productos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Producto</th>
                  <th className="px-5 py-3 font-medium">Categoría</th>
                  <th className="px-5 py-3 text-right font-medium">Stock</th>
                  <th className="px-5 py-3 text-right font-medium">Costo</th>
                  <th className="px-5 py-3 text-right font-medium">Venta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {productos.map((producto) => (
                  <tr key={producto.id}>
                    <td className="px-5 py-3">
                      <p className="font-medium text-anthracite">{producto.name}</p>
                      {producto.code && (
                        <p className="text-xs text-anthracite-soft">{producto.code}</p>
                      )}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {producto.category ?? '—'}
                    </td>
                    <td
                      className={`px-5 py-3 text-right ${
                        producto.stock <= producto.minStock
                          ? 'font-medium text-velvet-rose'
                          : 'text-anthracite-soft'
                      }`}
                    >
                      {producto.stock}
                    </td>
                    <td className="px-5 py-3 text-right text-anthracite-soft">
                      {formatGuaranies(producto.costPrice)}
                    </td>
                    <td className="px-5 py-3 text-right font-medium text-anthracite">
                      {formatGuaranies(producto.salePrice)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <Package className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">Todavía no hay productos cargados.</p>
          </div>
        )}
      </div>

      <Modal title="Nuevo producto" isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Field label="Nombre">
            <input
              required
              className={inputClass}
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Código / SKU">
              <input
                className={inputClass}
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value })}
              />
            </Field>
            <Field label="Categoría">
              <input
                className={inputClass}
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Unidad">
            <select
              className={inputClass}
              value={form.unit}
              onChange={(e) => setForm({ ...form, unit: e.target.value as Unit })}
            >
              {UNITS.map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Precio de costo (₲)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.costPrice}
                onChange={(e) => setForm({ ...form, costPrice: Number(e.target.value) })}
              />
            </Field>
            <Field label="Precio de venta (₲)">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.salePrice}
                onChange={(e) => setForm({ ...form, salePrice: Number(e.target.value) })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Stock inicial">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.stock}
                onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
              />
            </Field>
            <Field label="Stock mínimo">
              <input
                type="number"
                min={0}
                className={inputClass}
                value={form.minStock}
                onChange={(e) => setForm({ ...form, minStock: Number(e.target.value) })}
              />
            </Field>
          </div>
          {mutation.isError && (
            <p className="text-sm text-velvet-rose">No se pudo guardar el producto.</p>
          )}
          <button type="submit" disabled={mutation.isPending} className={buttonPrimary}>
            {mutation.isPending ? 'Guardando…' : 'Guardar'}
          </button>
        </form>
      </Modal>
    </div>
  );
}
