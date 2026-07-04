/**
 * Utilidades de fecha para inputs de tipo date en Ionic.
 */

/** Formatea un Date como YYYY-MM-DD para inputs type="date". */
export function toDateInput(date: Date): string {
  return date.toISOString().split('T')[0];
}

/** Convierte string YYYY-MM-DD a Date local. */
export function fromDateInput(value: string): Date {
  const [y, m, d] = value.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** Fecha actual como string para input. */
export function today(): string {
  return toDateInput(new Date());
}

/** Fecha futura a N días desde hoy. */
export function daysFromNow(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return toDateInput(d);
}

/** Fecha pasada a N días desde hoy. */
export function daysAgo(days: number): string {
  return daysFromNow(-days);
}

/** Primer día del mes actual. */
export function firstOfMonth(): string {
  const d = new Date();
  d.setDate(1);
  return toDateInput(d);
}

/** Último día del mes actual. */
export function lastOfMonth(): string {
  const d = new Date();
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  return toDateInput(d);
}
