import { Suspense, type ReactNode } from "react";
import type { NavigateOptions } from "react-router-dom";

import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { useHref, useNavigate } from "react-router-dom";

import { ThemeProvider } from "./contexts/theme-context";
import { SessionProvider } from "./contexts/session-context";
import { queryClient } from "./lib/queryClient";
import { AppErrorBoundary } from "./components/error/AppErrorBoundary";
import { LoadingSpinner } from "./components/ui/LoadingSpinner";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider navigate={navigate} useHref={useHref}>
        <SessionProvider>
          <ThemeProvider>
            <ToastProvider />
            <AppErrorBoundary>
              <Suspense
                fallback={<LoadingSpinner />}
              >
                {children}
              </Suspense>
            </AppErrorBoundary>
          </ThemeProvider>
        </SessionProvider>
      </HeroUIProvider>
    </QueryClientProvider>
  );
}
