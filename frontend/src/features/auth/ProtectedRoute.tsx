import { Navigate, Outlet, useLocation } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { useAuth } from "@/features/auth/auth.context";

export function ProtectedRoute() {
  const { status } = useAuth();
  const location = useLocation();

  if (status === "loading") {
    return (
      <section className="space-y-3" aria-busy="true">
        <div className="h-7 w-40 rounded-md bg-muted" />
        <div className="h-24 rounded-md bg-muted" />
        <div className="h-24 rounded-md bg-muted" />
      </section>
    );
  }

  if (status === "unauthenticated") {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />;
  }

  return <Outlet />;
}
