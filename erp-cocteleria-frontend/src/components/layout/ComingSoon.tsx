import type { LucideIcon } from 'lucide-react';

interface ComingSoonProps {
  title: string;
  icon: LucideIcon;
  description?: string;
}

export function ComingSoon({ title, icon: Icon, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="font-display text-2xl font-semibold text-anthracite">{title}</h1>
        <p className="mt-1 text-sm text-anthracite-soft">
          {description ?? 'Este módulo todavía no está disponible.'}
        </p>
      </div>

      <div className="surface-card flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-16 text-center">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-champagne-gold/10 text-champagne-dark">
          <Icon className="h-5 w-5" strokeWidth={1.75} />
        </span>
        <p className="font-display text-base font-semibold text-anthracite">
          Módulo en construcción
        </p>
        <p className="max-w-sm text-sm text-anthracite-soft">
          El módulo de {title.toLowerCase()} se va a habilitar en una próxima etapa,
          siguiendo la hoja de ruta de JAUMINA_WORKSPACE_RULES.md.
        </p>
      </div>
    </div>
  );
}
