import {
  createContext,
  useState,
  useEffect,
  useMemo,
  useContext,
  useCallback,
} from "react";

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

  const isDark = theme === ThemeProps.dark;
  const isLight = theme === ThemeProps.light;

  const _setTheme = useCallback((newTheme: Theme) => {
    localStorage.setItem(ThemeProps.key, newTheme);
    const root = window.document.documentElement;

    root.classList.remove(ThemeProps.light, ThemeProps.dark);
    root.classList.add(newTheme);
    setTheme(newTheme);
  }, []);

  const setLightTheme = useCallback(
    () => _setTheme(ThemeProps.light),
    [_setTheme],
  );
  const setDarkTheme = useCallback(
    () => _setTheme(ThemeProps.dark),
    [_setTheme],
  );
  const toggleTheme = useCallback(
    () => (theme === ThemeProps.dark ? setLightTheme() : setDarkTheme()),
    [theme, setLightTheme, setDarkTheme],
  );

  useEffect(() => {
    _setTheme(theme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    [theme, isDark, isLight, setLightTheme, setDarkTheme, toggleTheme],
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
