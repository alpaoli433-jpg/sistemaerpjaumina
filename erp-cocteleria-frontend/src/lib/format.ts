const GUARANIES_FORMATTER = new Intl.NumberFormat('es-PY', {
  style: 'decimal',
  maximumFractionDigits: 0,
  minimumFractionDigits: 0,
});

export function formatGuaranies(amount: number): string {
  return `₲ ${GUARANIES_FORMATTER.format(Math.round(amount))}`;
}

const RELATIVE_TIME_FORMATTER = new Intl.RelativeTimeFormat('es', { numeric: 'auto' });
const MONTH_FORMATTER = new Intl.DateTimeFormat('es-PY', { month: 'short', year: '2-digit' });

export function formatRelativeTime(isoDate: string): string {
  const diffMs = new Date(isoDate).getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60_000);

  if (Math.abs(diffMinutes) < 60) {
    return RELATIVE_TIME_FORMATTER.format(diffMinutes, 'minute');
  }
  const diffHours = Math.round(diffMinutes / 60);
  if (Math.abs(diffHours) < 24) {
    return RELATIVE_TIME_FORMATTER.format(diffHours, 'hour');
  }
  const diffDays = Math.round(diffHours / 24);
  return RELATIVE_TIME_FORMATTER.format(diffDays, 'day');
}

export function formatMonthLabel(monthKey: string): string {
  const [year, month] = monthKey.split('-').map(Number);
  const label = MONTH_FORMATTER.format(new Date(year, month - 1, 1));
  return label.charAt(0).toUpperCase() + label.slice(1);
}
