'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Martini, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_GROUPS } from './nav-items';

interface SidebarProps {
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export function Sidebar({ mobileOpen, onCloseMobile }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-anthracite/30 md:hidden"
          onClick={onCloseMobile}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 -translate-x-full flex-col border-r border-anthracite/8 bg-paper transition-transform duration-200 md:static md:translate-x-0',
          mobileOpen && 'translate-x-0',
        )}
      >
        <div className="flex items-center justify-between gap-3 px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-champagne-gold/40 bg-champagne-gold/10 text-champagne-dark">
              <Martini className="h-4 w-4" strokeWidth={1.75} />
            </span>
            <div className="leading-tight">
              <p className="font-display text-[15px] font-semibold text-anthracite">
                Ja&apos;umina
              </p>
              <p className="text-[11px] uppercase tracking-[0.14em] text-anthracite-soft">
                ERP
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-anthracite-soft hover:bg-blush md:hidden"
            aria-label="Cerrar menú"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 pb-4">
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="mb-4">
              <p className="px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-anthracite-soft/70">
                {group.label}
              </p>
              <ul className="flex flex-col gap-1">
                {group.items.map((item) => {
                  const isActive =
                    pathname === item.href || pathname?.startsWith(`${item.href}/`);
                  const Icon = item.icon;
                  return (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        onClick={onCloseMobile}
                        className={cn(
                          'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                          isActive
                            ? 'border-l-2 border-champagne-gold bg-blush pl-[10px] text-anthracite'
                            : 'text-anthracite-soft hover:bg-paper-muted hover:text-anthracite',
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0" strokeWidth={1.75} />
                        {item.label}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>
    </>
  );
}
