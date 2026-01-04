import { Suspense, type ReactNode } from "react";
import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { useHref, useNavigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";

import { ThemeProvider } from "./contexts/theme-context";
import { SessionProvider } from "./contexts/session-context";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <SessionProvider>
        <ThemeProvider>
          <ToastProvider />
          <Suspense fallback={<div className="flex h-screen items-center justify-center"><Spinner size="lg" /></div>}>
            {children}
          </Suspense>
        </ThemeProvider>
      </SessionProvider>
    </HeroUIProvider>
  );
}
