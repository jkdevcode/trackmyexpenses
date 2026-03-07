import { appColor, type HerouiColor } from "./theme.config";

type AppColorVariantSet = {
  text: string;
  textStrong: string;
  softBg: string;
  softBgText: string;
  softBorder: string;
  navActive: string;
};

const APP_COLOR_VARIANTS: Record<HerouiColor, AppColorVariantSet> = {
  default: {
    text: "text-default-700",
    textStrong: "text-default-800",
    softBg: "bg-default-100",
    softBgText: "bg-default-100 text-default-700",
    softBorder: "border-default-300",
    navActive: "bg-default-200 text-default-800",
  },
  primary: {
    text: "text-primary",
    textStrong: "text-primary",
    softBg: "bg-primary/10",
    softBgText: "bg-primary/10 text-primary",
    softBorder: "border-primary/40",
    navActive: "bg-primary/10 text-primary",
  },
  secondary: {
    text: "text-secondary",
    textStrong: "text-secondary",
    softBg: "bg-secondary/10",
    softBgText: "bg-secondary/10 text-secondary",
    softBorder: "border-secondary/40",
    navActive: "bg-secondary/10 text-secondary",
  },
  success: {
    text: "text-success",
    textStrong: "text-success",
    softBg: "bg-success/10",
    softBgText: "bg-success/10 text-success",
    softBorder: "border-success/40",
    navActive: "bg-success/10 text-success",
  },
  warning: {
    text: "text-warning",
    textStrong: "text-warning",
    softBg: "bg-warning/10",
    softBgText: "bg-warning/10 text-warning",
    softBorder: "border-warning/40",
    navActive: "bg-warning/10 text-warning",
  },
};

export const appColorVariants = APP_COLOR_VARIANTS[appColor];

export const getAppColorVariant = <K extends keyof AppColorVariantSet>(
  key: K,
) => appColorVariants[key];
