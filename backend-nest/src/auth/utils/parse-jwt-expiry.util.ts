const UNIT_TO_MS: Record<string, number> = {
  ms: 1,
  s: 1000,
  m: 60_000,
  h: 3_600_000,
  d: 86_400_000,
  w: 604_800_000,
};

export function parseJwtExpiryToMs(expiresIn: string | number): number {
  if (typeof expiresIn === 'number') {
    return expiresIn * 1000;
  }

  const trimmed = expiresIn.trim();

  if (/^\d+$/.test(trimmed)) {
    return Number(trimmed) * 1000;
  }

  const match = trimmed.match(/^(\d+)\s*(ms|s|m|h|d|w)$/i);
  if (!match) {
    return 7 * 24 * 60 * 60 * 1000;
  }

  const value = Number(match[1]);
  const unit = match[2].toLowerCase();
  return value * UNIT_TO_MS[unit];
}
