// TanStack Query key factory. Feature chunks add their keys here so cache invalidation has one
// source of truth (R15). Per-user data is keyed by userId so the shared QueryClient never serves
// one tenant's cache entries to another after a sign-out/sign-in.
export const queryKeys = {
  brands: (userId: string) => ["brands", userId] as const,
} as const;
