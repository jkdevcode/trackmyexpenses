import type React from "react";
import type { NavigateOptions } from "react-router-dom";

import { HeroUIProvider } from "@heroui/system";
import { ToastProvider } from "@heroui/toast";
import { useHref, useNavigate } from "react-router-dom";

import { ThemeProvider } from "./contexts/theme-context";
import { SessionProvider } from "./contexts/session-context";

declare module "@react-types/shared" {
  interface RouterConfig {
    routerOptions: NavigateOptions;
  }
}

export function Provider({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  return (
    <HeroUIProvider navigate={navigate} useHref={useHref}>
      <SessionProvider>
        <ThemeProvider>
          <ToastProvider />
          {children}
        </ThemeProvider>
      </SessionProvider>
    </HeroUIProvider>
  );
}
