const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

function plural(value: number, singular: string, pluralForm: string): string {
  return `hace ${value} ${value === 1 ? singular : pluralForm}`;
}

/** Relative time in Spanish: "ahora", "hace 5 min", "ayer", "hace 3 semanas"… (DESIGN.md › Components). */
export function formatRelativeTime(value: string | Date, now: Date = new Date()): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  const diff = Math.max(0, now.getTime() - date.getTime());

  if (diff < MINUTE) return 'ahora';
  if (diff < HOUR) return `hace ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `hace ${Math.floor(diff / HOUR)} h`;

  const days = Math.floor(diff / DAY);
  if (days === 1) return 'ayer';
  if (days < 7) return plural(days, 'día', 'días');
  if (days < 30) return plural(Math.floor(days / 7), 'semana', 'semanas');
  if (days < 365) return plural(Math.max(1, Math.floor(days / 30)), 'mes', 'meses');
  return plural(Math.floor(days / 365), 'año', 'años');
}
