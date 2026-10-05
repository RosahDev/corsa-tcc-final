export const MAX_MONEY_CENTS = 99_999_999_99;

export function formatCentsAsMoney(cents: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(cents / 100);
}

export function digitsToCents(
  digits: string,
  {
    minCents = 0,
    maxCents = MAX_MONEY_CENTS,
  }: { minCents?: number; maxCents?: number } = {},
): number {
  const normalized = digits.replace(/\D/g, "");
  if (!normalized) return minCents;

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed)) return minCents;

  return Math.min(Math.max(parsed, minCents), maxCents);
}

export function appendMoneyDigit(
  currentCents: number,
  digit: number,
  maxCents = MAX_MONEY_CENTS,
): number {
  const next = currentCents * 10 + digit;
  return next > maxCents ? currentCents : next;
}

export function backspaceMoneyDigit(currentCents: number): number {
  return Math.floor(currentCents / 10);
}
