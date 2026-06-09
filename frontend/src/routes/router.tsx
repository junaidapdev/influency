import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { ProtectedRoute } from "@/features/auth/ProtectedRoute";
import { BrandsPage } from "@/routes/BrandsPage";
import { BrandDetailPage } from "@/routes/BrandDetailPage";
import { DashboardPage } from "@/routes/DashboardPage";
import { DealsPage } from "@/routes/DealsPage";
import { PaymentsPage } from "@/routes/PaymentsPage";
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
          { path: ROUTES.brandDetail, element: <BrandDetailPage /> },
          { path: ROUTES.deals, element: <DealsPage /> },
          { path: ROUTES.payments, element: <PaymentsPage /> },
        ],
      },
    ],
  },
]);
