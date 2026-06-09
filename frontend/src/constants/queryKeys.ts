// TanStack Query key factory. Feature chunks add their keys here so cache invalidation has one
// source of truth (R15).
export const queryKeys = {
  brands: () => ["brands"] as const,
} as const;
