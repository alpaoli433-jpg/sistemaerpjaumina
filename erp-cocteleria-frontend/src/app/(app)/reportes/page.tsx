'use client';

import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Download, FileBarChart, FileText } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getCompras, getGastos, getVentas } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { inputClass } from '@/components/ui/Field';
import { buttonGhost } from '@/components/ui/styles';

interface Movimiento {
  date: string;
  tipo: 'Venta' | 'Compra' | 'Gasto';
  detalle: string;
  monto: number;
  signo: 1 | -1;
}

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function downloadCsv(rows: Movimiento[]) {
  const header = ['Fecha', 'Tipo', 'Detalle', 'Monto (Gs)'];
  const lines = rows.map((row) =>
    [row.date, row.tipo, `"${row.detalle.replace(/"/g, '""')}"`, row.signo * row.monto].join(','),
  );
  const csv = [header.join(','), ...lines].join('\n');
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `reporte-${toInputDate(new Date())}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}

async function downloadPdf(rows: Movimiento[], from: string, to: string) {
  const [{ default: JsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new JsPDF();
  doc.setFontSize(14);
  doc.text('Reporte de movimientos — Ja’umina ERP', 14, 16);
  doc.setFontSize(10);
  doc.text(`Período: ${from} a ${to}`, 14, 23);

  autoTable(doc, {
    startY: 28,
    head: [['Fecha', 'Tipo', 'Detalle', 'Monto (Gs)']],
    body: rows.map((row) => [
      new Date(row.date).toLocaleDateString('es-PY'),
      row.tipo,
      row.detalle,
      formatGuaranies(row.signo * row.monto),
    ]),
    styles: { fontSize: 9 },
    headStyles: { fillColor: [40, 40, 40] },
  });

  doc.save(`reporte-${toInputDate(new Date())}.pdf`);
}

export default function ReportesPage() {
  const { token } = useAuth();
  const today = useMemo(() => new Date(), []);
  const monthAgo = useMemo(() => new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000), [today]);
  const [from, setFrom] = useState(toInputDate(monthAgo));
  const [to, setTo] = useState(toInputDate(today));

  const { data: ventas } = useQuery({
    queryKey: ['ventas'],
    queryFn: () => getVentas(token!),
    enabled: !!token,
  });
  const { data: compras } = useQuery({
    queryKey: ['compras'],
    queryFn: () => getCompras(token!),
    enabled: !!token,
  });
  const { data: gastos } = useQuery({
    queryKey: ['gastos'],
    queryFn: () => getGastos(token!),
    enabled: !!token,
  });

  const fromTime = new Date(from).getTime();
  const toTime = new Date(to).getTime() + 24 * 60 * 60 * 1000 - 1;

  const movimientos: Movimiento[] = useMemo(() => {
    const rows: Movimiento[] = [];
    for (const venta of ventas ?? []) {
      const time = new Date(venta.saleDate).getTime();
      if (time >= fromTime && time <= toTime && venta.status !== 'ANULADA') {
        rows.push({
          date: venta.saleDate,
          tipo: 'Venta',
          detalle: venta.cliente?.name ?? 'Consumidor final',
          monto: venta.totalAmount,
          signo: 1,
        });
      }
    }
    for (const gasto of gastos ?? []) {
      const time = new Date(gasto.expenseDate).getTime();
      if (time >= fromTime && time <= toTime) {
        rows.push({
          date: gasto.expenseDate,
          tipo: 'Gasto',
          detalle: gasto.description,
          monto: gasto.amount,
          signo: -1,
        });
      }
    }
    return rows.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [ventas, gastos, fromTime, toTime]);

  const totalVentas = movimientos
    .filter((m) => m.tipo === 'Venta')
    .reduce((sum, m) => sum + m.monto, 0);
  const totalGastos = movimientos
    .filter((m) => m.tipo === 'Gasto')
    .reduce((sum, m) => sum + m.monto, 0);
  const totalCompras = (compras ?? []).reduce(
    (sum, c) =>
      new Date(c.purchaseDate).getTime() >= fromTime && new Date(c.purchaseDate).getTime() <= toTime
        ? sum + c.totalAmount
        : sum,
    0,
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-anthracite">Reportes</h1>
          <p className="mt-1 text-sm text-anthracite-soft">
            Ventas y gastos por período, con exportación a CSV o PDF.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => downloadCsv(movimientos)}
            disabled={movimientos.length === 0}
            className={buttonGhost}
          >
            <span className="flex items-center gap-1.5">
              <Download className="h-4 w-4" /> Descargar CSV
            </span>
          </button>
          <button
            type="button"
            onClick={() => downloadPdf(movimientos, from, to)}
            disabled={movimientos.length === 0}
            className={buttonGhost}
          >
            <span className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" /> Descargar PDF
            </span>
          </button>
        </div>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-anthracite">Desde</span>
          <input
            type="date"
            className={inputClass}
            value={from}
            onChange={(e) => setFrom(e.target.value)}
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm">
          <span className="font-medium text-anthracite">Hasta</span>
          <input
            type="date"
            className={inputClass}
            value={to}
            onChange={(e) => setTo(e.target.value)}
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-anthracite-soft">
            Ventas del período
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-ice-emerald">
            {formatGuaranies(totalVentas)}
          </p>
        </div>
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-anthracite-soft">
            Compras del período
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-anthracite">
            {formatGuaranies(totalCompras)}
          </p>
        </div>
        <div className="surface-card rounded-2xl p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-anthracite-soft">
            Gastos del período
          </p>
          <p className="mt-1 font-display text-xl font-semibold text-velvet-rose">
            {formatGuaranies(totalGastos)}
          </p>
        </div>
      </div>

      <div className="surface-card overflow-hidden rounded-2xl">
        {movimientos.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-paper-muted text-xs uppercase tracking-wide text-anthracite-soft">
                <tr>
                  <th className="px-5 py-3 font-medium">Fecha</th>
                  <th className="px-5 py-3 font-medium">Tipo</th>
                  <th className="px-5 py-3 font-medium">Detalle</th>
                  <th className="px-5 py-3 text-right font-medium">Monto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-anthracite/8">
                {movimientos.map((mov, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3 text-anthracite-soft">
                      {new Date(mov.date).toLocaleDateString('es-PY')}
                    </td>
                    <td className="px-5 py-3 text-anthracite-soft">{mov.tipo}</td>
                    <td className="px-5 py-3 text-anthracite-soft">{mov.detalle}</td>
                    <td
                      className={`px-5 py-3 text-right font-medium ${
                        mov.signo > 0 ? 'text-ice-emerald' : 'text-velvet-rose'
                      }`}
                    >
                      {mov.signo > 0 ? '+' : '−'} {formatGuaranies(mov.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
            <FileBarChart className="h-6 w-6 text-anthracite-soft" strokeWidth={1.5} />
            <p className="text-sm text-anthracite-soft">
              No hay movimientos en el período seleccionado.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
