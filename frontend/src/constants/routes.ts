// All route paths live here (R15: no inline magic strings). Feature chunks add their routes.
export const ROUTES = {
  home: "/",
} as const;

export type RoutePath = (typeof ROUTES)[keyof typeof ROUTES];
