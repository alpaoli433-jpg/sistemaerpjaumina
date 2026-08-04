import { Sparkles } from 'lucide-react';
import { ComingSoon } from '@/components/layout/ComingSoon';

export default function ServiciosPage() {
  return (
    <ComingSoon
      title="Servicios"
      icon={Sparkles}
      description="Catálogo de servicios adicionales (staff extra, equipamiento, logística) — todavía sin modelo de datos en el backend."
    />
  );
}
