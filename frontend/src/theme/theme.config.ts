// theme.config.ts

/**
 * Los colores disponibles en HeroUI son:
 * "default" | "primary" | "secondary" | "success" | "warning" | "danger"
 */
export type HerouiColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export const THEME_CONFIG = {
  appColor: "dangdefaulter" as HerouiColor,
};

export const appColor = THEME_CONFIG.appColor;

// Mapeo de colores a valores RGB/Hex aproximados para uso en canvas o donde no llegue Tailwind
// Estos valores coinciden aproximadamente con los defaults de Tailwind/HeroUI
export const THEME_COLOR_MAP: Record<
  HerouiColor,
  { light: string; dark: string }
> = {
  default: { light: "113, 113, 122", dark: "161, 161, 170" }, // zinc-500 / zinc-400
  primary: { light: "0, 111, 238", dark: "0, 111, 238" }, // blue-600
  secondary: { light: "147, 51, 234", dark: "147, 51, 234" }, // purple-600
  success: { light: "23, 201, 100", dark: "23, 201, 100" }, // green-500
  warning: { light: "245, 165, 36", dark: "245, 165, 36" }, // yellow-500
  danger: { light: "243, 18, 96", dark: "243, 18, 96" }, // red-500
};
