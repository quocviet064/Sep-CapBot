export const safeSrc = (s?: string | null): string | undefined =>
  s && s.length > 0 ? s : undefined;
