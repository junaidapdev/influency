import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { BrandsPage } from "@/routes/BrandsPage";
import { DashboardPage } from "@/routes/DashboardPage";
import { RootLayout } from "@/routes/RootLayout";
import { LoginPage } from "@/routes/LoginPage";
import { VerifyEmailPage } from "@/routes/VerifyEmailPage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [
      { path: ROUTES.root, element: <LoginPage /> },
      { path: ROUTES.login, element: <LoginPage /> },
      { path: ROUTES.verifyEmail, element: <VerifyEmailPage /> },
      {
        element: <ProtectedRoute />,
        children: [
          { path: ROUTES.dashboard, element: <DashboardPage /> },
          { path: ROUTES.brands, element: <BrandsPage /> },
        ],
      },
    ],
  },
]);
