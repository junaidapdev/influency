import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "@/constants/routes";
import { RootLayout } from "@/routes/RootLayout";
import { HomePage } from "@/routes/HomePage";

export const router = createBrowserRouter([
  {
    element: <RootLayout />,
    children: [{ path: ROUTES.home, element: <HomePage /> }],
  },
]);
