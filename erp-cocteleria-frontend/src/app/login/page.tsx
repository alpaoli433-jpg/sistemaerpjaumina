'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Martini } from 'lucide-react';
import { useAuth, ApiError } from '@/lib/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@cocteleriapremium.com');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err) {
      setError(
        err instanceof ApiError && err.status === 401
          ? 'Email o contraseña incorrectos.'
          : 'No se pudo conectar con el servidor. Intentá de nuevo.',
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-full flex-1 items-center justify-center bg-paper-muted px-4 py-16">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-champagne-gold/40 bg-champagne-gold/10 text-champagne-dark">
            <Martini className="h-5 w-5" strokeWidth={1.75} />
          </span>
          <div>
            <h1 className="font-display text-xl font-semibold text-anthracite">
              Ja&apos;umina ERP
            </h1>
            <p className="mt-1 text-sm text-anthracite-soft">
              Iniciá sesión para continuar
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="surface-card flex flex-col gap-4 rounded-2xl p-6"
        >
          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-anthracite">Email</span>
            <input
              type="email"
              required
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="rounded-lg border border-anthracite/15 bg-paper px-3 py-2 text-anthracite outline-none transition focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/30"
              placeholder="tu@empresa.com"
            />
          </label>

          <label className="flex flex-col gap-1.5 text-sm">
            <span className="font-medium text-anthracite">Contraseña</span>
            <input
              type="password"
              required
              autoComplete="current-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="rounded-lg border border-anthracite/15 bg-paper px-3 py-2 text-anthracite outline-none transition focus:border-champagne-gold focus:ring-2 focus:ring-champagne-gold/30"
              placeholder="••••••••"
            />
          </label>

          {error && (
            <p className="rounded-lg bg-velvet-rose/10 px-3 py-2 text-sm text-velvet-rose">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="mt-2 rounded-lg bg-champagne-gold px-4 py-2.5 font-medium text-anthracite transition hover:bg-champagne-dark hover:text-paper disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? 'Ingresando…' : 'Ingresar'}
          </button>
        </form>

        <p className="mt-4 text-center text-xs text-anthracite-soft">
          Usuario de prueba: admin@cocteleriapremium.com / Admin123!
        </p>
      </div>
    </div>
  );
}
