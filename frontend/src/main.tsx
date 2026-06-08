import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import i18n, { applyHtmlLangDir } from "@/lib/i18n";
import { type Locale } from "@/constants/i18n";
import { router } from "@/routes/router";
import "@/styles/index.css";

// Set <html lang dir> for the initial locale (languageChanged covers subsequent toggles).
applyHtmlLangDir(i18n.language as Locale);

const queryClient = new QueryClient();

const rootElement = document.getElementById("root");
if (!rootElement) {
  throw new Error("Root element #root not found");
}

createRoot(rootElement).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  </StrictMode>,
);
