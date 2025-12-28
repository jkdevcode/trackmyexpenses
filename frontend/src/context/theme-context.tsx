import { createContext, useState, useEffect, useMemo, useContext } from "react";

export const ThemeProps = {
  key: "theme",
  light: "light",
  dark: "dark",
} as const;

export type Theme = typeof ThemeProps.light | typeof ThemeProps.dark;

interface ThemeContextProps {
  theme: Theme;
  isDark: boolean;
  isLight: boolean;
  setLightTheme: () => void;
  setDarkTheme: () => void;
  toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps>({
  theme: ThemeProps.light,
  isDark: false,
  isLight: true,
  setLightTheme: () => {},
  setDarkTheme: () => {},
  toggleTheme: () => {},
});

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const storedTheme = localStorage.getItem(ThemeProps.key) as Theme | null;
    return storedTheme || ThemeProps.light;
  });

  const isDark = useMemo(() => theme === ThemeProps.dark, [theme]);
  const isLight = useMemo(() => theme === ThemeProps.light, [theme]);

  const _setTheme = (newTheme: Theme) => {
    localStorage.setItem(ThemeProps.key, newTheme);
    const root = window.document.documentElement;
    root.classList.remove(ThemeProps.light, ThemeProps.dark);
    root.classList.add(newTheme);
    setTheme(newTheme);
  };

  const setLightTheme = () => _setTheme(ThemeProps.light);
  const setDarkTheme = () => _setTheme(ThemeProps.dark);
  const toggleTheme = () =>
    theme === ThemeProps.dark ? setLightTheme() : setDarkTheme();

  useEffect(() => {
    _setTheme(theme);
  }, []);

  const value = useMemo(
    () => ({
      theme,
      isDark,
      isLight,
      setLightTheme,
      setDarkTheme,
      toggleTheme,
    }),
    [theme, isDark, isLight]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
};
