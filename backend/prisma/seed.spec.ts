import { assertSeedIsSafe, safeDbHost } from './seed';

describe('assertSeedIsSafe', () => {
  it('aborta si no se pasa la confirmación destructiva', () => {
    expect(() => assertSeedIsSafe({})).toThrow(/Seed abortado/);
  });

  it('aborta si la confirmación no coincide exactamente', () => {
    expect(() =>
      assertSeedIsSafe({ SEED_CONFIRM_DESTRUCTIVE: 'si, dale' }),
    ).toThrow(/Seed abortado/);
  });

  it('no lanza si se pasa la confirmación exacta', () => {
    expect(() =>
      assertSeedIsSafe({ SEED_CONFIRM_DESTRUCTIVE: 'wipe-this-database' }),
    ).not.toThrow();
  });

  it('incluye el host de la DB destino en el mensaje de error, sin credenciales', () => {
    expect(() =>
      assertSeedIsSafe({
        DATABASE_URL: 'postgresql://user:supersecret@ep-cool-name-123.neon.tech/dbname',
      }),
    ).toThrow(/ep-cool-name-123\.neon\.tech/);

    try {
      assertSeedIsSafe({
        DATABASE_URL: 'postgresql://user:supersecret@ep-cool-name-123.neon.tech/dbname',
      });
    } catch (error) {
      expect((error as Error).message).not.toContain('supersecret');
    }
  });
});

describe('safeDbHost', () => {
  it('devuelve un placeholder si DATABASE_URL no está definida', () => {
    expect(safeDbHost(undefined)).toBe('(DATABASE_URL no definida)');
  });

  it('devuelve solo el host, sin usuario ni contraseña', () => {
    expect(safeDbHost('postgresql://user:pass@example.neon.tech:5432/mydb')).toBe(
      'example.neon.tech:5432',
    );
  });

  it('devuelve un placeholder si el formato es inválido', () => {
    expect(safeDbHost('no-es-una-url')).toBe('(DATABASE_URL con formato inválido)');
  });
});
