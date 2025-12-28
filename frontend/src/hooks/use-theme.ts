import { useTheme as useThemeContext } from "../context/theme-context";

export const useTheme = () => {
  return useThemeContext();
};
