import { useContext } from "react";

import { ColorThemeContext } from "@/contexts/color-theme";

export const useColorTheme = () => {
  const context = useContext(ColorThemeContext);

  if (!context) {
    throw new Error("useColorTheme must be used within a ColorThemeProvider");
  }

  return context;
};
