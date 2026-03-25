import React, { createContext, useState } from "react";

import { HerouiColor, THEME_CONFIG } from "@/theme/theme.config";

export interface ColorThemeContextProps {
  appColor: HerouiColor;
  setAppColor: (color: HerouiColor) => void;
}

export const ColorThemeContext = createContext<ColorThemeContextProps>({
  appColor: THEME_CONFIG.appColor,
  setAppColor: () => {},
});

export const ColorThemeProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [appColor, setAppColorState] = useState<HerouiColor>(() => {
    // Intentar leer de localStorage, fallback a configuración default
    if (typeof window !== "undefined") {
      const savedColor = localStorage.getItem("app-color") as HerouiColor;

      if (savedColor) return savedColor;
    }

    return THEME_CONFIG.appColor;
  });

  const setAppColor = (color: HerouiColor) => {
    setAppColorState(color);
    localStorage.setItem("app-color", color);
  };

  return (
    <ColorThemeContext.Provider value={{ appColor, setAppColor }}>
      {children}
    </ColorThemeContext.Provider>
  );
};
