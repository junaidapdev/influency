import { Outlet } from "react-router-dom";
import { BottomNav } from "@/components/BottomNav";
import { useAuth } from "@/features/auth/auth.context";

/**
 * App shell: a mobile-first lavender canvas with a centered phone-width column. Authenticated
 * screens get the floating bottom tab bar + FAB; each page renders its own AppHeader.
 */
export function RootLayout() {
  const { status } = useAuth();
  const isAuthenticated = status === "authenticated";

  return (
    <div className="min-h-dvh bg-background text-foreground">
      <div className="mx-auto w-full max-w-md px-4 pt-4 pb-28">
        <Outlet />
      </div>
      {isAuthenticated && <BottomNav />}
    </div>
  );
}
