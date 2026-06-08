// TanStack Query key factory. Feature chunks add their keys here so cache invalidation has one
// source of truth (R15). Example added by chunk 02: brands: () => ["brands"] as const.
export const queryKeys = {} as const;
