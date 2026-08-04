'use client';

import { Menu, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';

interface TopbarProps {
  onOpenMobileMenu: () => void;
}

const ROLE_LABEL: Record<string, string> = {
  ADMIN: 'Administrador',
  COORDINADOR: 'Coordinador',
  BARTENDER: 'Bartender',
};

export function Topbar({ onOpenMobileMenu }: TopbarProps) {
  const { user, logout } = useAuth();
  const router = useRouter();

  function handleLogout() {
    logout();
    router.push('/login');
  }

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-3 border-b border-anthracite/8 bg-paper/90 px-4 py-3 backdrop-blur md:px-6">
      <button
        type="button"
        onClick={onOpenMobileMenu}
        className="rounded-md p-2 text-anthracite-soft hover:bg-paper-muted md:hidden"
        aria-label="Abrir menú"
      >
        <Menu className="h-5 w-5" />
      </button>

      <div className="hidden md:block" />

      <div className="flex items-center gap-3">
        {user && (
          <div className="text-right leading-tight">
            <p className="text-sm font-medium text-anthracite">{user.name}</p>
            <p className="text-xs text-anthracite-soft">
              {ROLE_LABEL[user.role] ?? user.role}
            </p>
          </div>
        )}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-1.5 rounded-lg border border-anthracite/12 px-3 py-1.5 text-sm text-anthracite-soft transition hover:border-velvet-rose/40 hover:text-velvet-rose"
        >
          <LogOut className="h-3.5 w-3.5" />
          Salir
        </button>
      </div>
    </header>
  );
}
