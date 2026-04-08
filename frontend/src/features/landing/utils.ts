export const LANDING_IMAGES = {
  es: {
    principal: "/imgs/landing-hero-es.webp",
    dashboard: "/imgs/landing-dashboard-es.webp",
  },
  en: {
    principal: "/imgs/landing-hero-en.webp",
    dashboard: "/imgs/landing-dashboard-en.webp",
  },
} as const;

export const getLandingImages = (language: string) => {
  if (language?.toLowerCase().startsWith("es")) {
    return LANDING_IMAGES.es;
  }

  return LANDING_IMAGES.en;
};
