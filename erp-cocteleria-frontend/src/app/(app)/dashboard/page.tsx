'use client';

import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TrendingUp, TrendingDown, PiggyBank, HandCoins } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getDashboardSummary, getIngredients, getEvents, type StockCriticoItem } from '@/lib/api';
import { formatGuaranies } from '@/lib/format';
import { KpiCard } from '@/components/dashboard/KpiCard';
import { IngresosGastosChart } from '@/components/dashboard/IngresosGastosChart';
import { StockCriticoPanel } from '@/components/dashboard/StockCriticoPanel';
import { ActividadRecienteList } from '@/components/dashboard/ActividadRecienteList';
import { ProximosEventosList } from '@/components/dashboard/ProximosEventosList';

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="surface-card flex flex-col gap-4 rounded-2xl p-5">
      <h2 className="font-display text-sm font-semibold text-anthracite">{title}</h2>
      {children}
    </section>
  );
}

function KpiSkeleton() {
  return (
    <div className="surface-card flex items-center gap-4 rounded-2xl p-5">
      <div className="h-11 w-11 shrink-0 animate-pulse rounded-xl bg-paper-muted" />
      <div className="flex-1 space-y-2">
        <div className="h-3 w-20 animate-pulse rounded bg-paper-muted" />
        <div className="h-5 w-28 animate-pulse rounded bg-paper-muted" />
      </div>
    </div>
  );
}

const PANEL_SKELETON = (
  <div className="space-y-3">
    <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
    <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
    <div className="h-10 animate-pulse rounded-lg bg-paper-muted" />
  </div>
);

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-velvet-rose/30 bg-velvet-rose/5 p-4 text-sm text-velvet-rose">
      {message}
    </div>
  );
}

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4001';
const CONNECTION_ERROR_MESSAGE = `No se pudo conectar con el backend en ${API_URL}. Verificá que el servidor esté corriendo y que la sesión siga siendo válida.`;

const ACTIVE_EVENT_STATUSES = new Set(['COTIZADO', 'CONFIRMADO', 'EN_CURSO']);
const PROXIMOS_EVENTOS_LIMIT = 5;

export default function DashboardPage() {
  const { token } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: () => getDashboardSummary(token!),
    enabled: !!token,
  });

  // Stock Crítico se pide directo a GET /ingredients (no vía /dashboard/summary)
  // para reflejar en tiempo real el recetario de coctelería.
  const {
    data: ingredients,
    isLoading: isLoadingIngredients,
    isError: isErrorIngredients,
  } = useQuery({
    queryKey: ['ingredients'],
    queryFn: () => getIngredients(token!),
    enabled: !!token,
  });

  const stockCritico: StockCriticoItem[] = useMemo(
    () =>
      (ingredients ?? [])
        .filter((i) => i.stock <= i.minStock)
        .map((i) => ({
          id: i.id,
          name: i.name,
          unit: i.unit,
          stock: i.stock,
          minStock: i.minStock,
          source: 'ingredient' as const,
        }))
        .sort((a, b) => a.stock / (a.minStock || 1) - b.stock / (b.minStock || 1)),
    [ingredients],
  );

  // Próximos Eventos se pide directo a GET /events.
  const {
    data: events,
    isLoading: isLoadingEvents,
    isError: isErrorEvents,
  } = useQuery({
    queryKey: ['events'],
    queryFn: () => getEvents(token!),
    enabled: !!token,
  });

  // `now` se calcula una sola vez (no en cada render) para que el filtro de
  // abajo siga siendo una función pura desde el punto de vista de React.
  const now = useMemo(() => new Date(), []);

  const proximosEventos = useMemo(() => {
    const nowTime = now.getTime();
    return (events ?? [])
      .filter(
        (e) => ACTIVE_EVENT_STATUSES.has(e.status) && new Date(e.eventDate).getTime() >= nowTime,
      )
      .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime())
      .slice(0, PROXIMOS_EVENTOS_LIMIT);
  }, [events, now]);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-anthracite">
          Resumen
        </h1>
        <p className="mt-1 text-sm text-anthracite-soft">
          Vista general del negocio — ingresos, gastos y actividad reciente.
        </p>
      </div>

      {isError && <ErrorBanner message={CONNECTION_ERROR_MESSAGE} />}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {isLoading || !data ? (
          <>
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
            <KpiSkeleton />
          </>
        ) : (
          <>
            <KpiCard
              label="Ingresos"
              value={formatGuaranies(data.kpis.ingresos)}
              icon={TrendingUp}
              tone="emerald"
            />
            <KpiCard
              label="Gastos"
              value={formatGuaranies(data.kpis.gastos)}
              icon={TrendingDown}
              tone="rose"
            />
            <KpiCard
              label="Margen de ganancia"
              value={formatGuaranies(data.kpis.margen)}
              icon={PiggyBank}
              tone="gold"
            />
            <KpiCard
              label="Cobrado (depósitos)"
              value={formatGuaranies(data.kpis.cobrado)}
              icon={HandCoins}
              tone="neutral"
            />
          </>
        )}
      </div>

      <SectionCard title="Ingresos vs Gastos">
        {isLoading || !data ? (
          <div className="h-64 animate-pulse rounded-xl bg-paper-muted" />
        ) : (
          <IngresosGastosChart data={data.chart} />
        )}
      </SectionCard>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Stock Crítico">
          {isLoadingIngredients ? (
            PANEL_SKELETON
          ) : isErrorIngredients ? (
            <ErrorBanner message={CONNECTION_ERROR_MESSAGE} />
          ) : (
            <StockCriticoPanel items={stockCritico} />
          )}
        </SectionCard>

        <SectionCard title="Próximos Eventos">
          {isLoadingEvents ? (
            PANEL_SKELETON
          ) : isErrorEvents ? (
            <ErrorBanner message={CONNECTION_ERROR_MESSAGE} />
          ) : (
            <ProximosEventosList events={proximosEventos} />
          )}
        </SectionCard>
      </div>

      <SectionCard title="Actividad Reciente">
        {isLoading ? (
          PANEL_SKELETON
        ) : isError || !data ? (
          <ErrorBanner message={CONNECTION_ERROR_MESSAGE} />
        ) : (
          <ActividadRecienteList entries={data.actividadReciente} />
        )}
      </SectionCard>
    </div>
  );
}
