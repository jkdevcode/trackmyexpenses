import { useTheme as useThemeContext } from "../contexts/theme-context";

export const useTheme = () => {
  return useThemeContext();
};
