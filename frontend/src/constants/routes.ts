// All route paths live here (R15: no inline magic strings). Feature chunks add their routes.
export const ROUTES = {
  root: "/",
  login: "/login",
  verifyEmail: "/verify-email",
  dashboard: "/dashboard",
  brands: "/brands",
  brandDetail: "/brands/:brandId",
  deals: "/deals",
  payments: "/payments",
  meetings: "/meetings",
  snap: "/snap",
  reports: "/reports",
  settings: "/settings",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];

/** Build a concrete brand-detail path from a brand id. */
export function brandDetailPath(brandId: string): string {
  return `/brands/${brandId}`;
}
