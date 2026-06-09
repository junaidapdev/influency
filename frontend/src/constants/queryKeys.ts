import { type DealFilters } from "@/constants/deals";

// TanStack Query key factory. Feature chunks add their keys here so cache invalidation has one
// source of truth (R15). Per-user data is keyed by userId so the shared QueryClient never serves
// one tenant's cache entries to another after a sign-out/sign-in.
export const queryKeys = {
  brands: (userId: string) => ["brands", userId] as const,
  // Prefix used to invalidate every deals query for a user, regardless of active filters.
  dealsByUser: (userId: string) => ["deals", userId] as const,
  deals: (userId: string, filters: DealFilters) => ["deals", userId, filters] as const,
  payments: (userId: string) => ["payments", userId] as const,
  // Date-dependent rollups carry their date granularity in the key so a cached result can't
  // outlive the day/month it was computed for (TanStack: key every input the result depends on).
  dashboardSummary: (userId: string, month: string) =>
    ["dashboard-summary", userId, month] as const,
  overduePayments: (userId: string, today: string) =>
    ["overdue-payments", userId, today] as const,
} as const;
