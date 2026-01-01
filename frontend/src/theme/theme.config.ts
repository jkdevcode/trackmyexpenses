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
  appColor: "success" as HerouiColor,
};

export const appColor = THEME_CONFIG.appColor;
