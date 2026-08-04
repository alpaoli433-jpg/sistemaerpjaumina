'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { DashboardChartPoint } from '@/lib/api';
import { formatGuaranies, formatMonthLabel } from '@/lib/format';

interface IngresosGastosChartProps {
  data: DashboardChartPoint[];
}

export function IngresosGastosChart({ data }: IngresosGastosChartProps) {
  const chartData = data.map((point) => ({
    ...point,
    label: formatMonthLabel(point.month),
  }));

  if (chartData.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center text-sm text-anthracite-soft">
        Todavía no hay eventos registrados para graficar.
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} barGap={6} margin={{ left: -12, top: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(45,45,45,0.08)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b6b6b', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(45,45,45,0.12)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6b6b6b', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(value: number) =>
              value >= 1_000_000 ? `${Math.round(value / 1_000_000)}M` : `${value}`
            }
          />
          <Tooltip
            cursor={{ fill: 'rgba(212,175,55,0.08)' }}
            contentStyle={{
              background: '#ffffff',
              border: '1px solid rgba(212,175,55,0.25)',
              borderRadius: 12,
              fontSize: 13,
            }}
            formatter={(value) => formatGuaranies(Number(value))}
          />
          <Legend wrapperStyle={{ fontSize: 12, color: '#6b6b6b' }} />
          <Bar dataKey="ingresos" name="Ingresos" fill="#10b981" radius={[6, 6, 0, 0]} />
          <Bar dataKey="gastos" name="Gastos" fill="#e11d48" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
