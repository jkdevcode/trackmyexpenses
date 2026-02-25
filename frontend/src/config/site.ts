export type SiteConfig = typeof siteConfig;
import i18next from "../i18n";

export const siteConfig = () => ({
  needCookieConsent: true, // Set to false if you don't need cookie consent
  name: i18next.t("vite-heroui"),
  description: i18next.t(
    "make-beautiful-websites-regardless-of-your-design-experience",
  ),
  navItems: [
    {
      label: i18next.t("home"),
      href: "/",
    },
    {
      label: i18next.t("docs"),
      href: "/docs",
    },
    {
      label: i18next.t("pricing"),
      href: "/pricing",
    },
    {
      label: i18next.t("blog"),
      href: "/blog",
    },
    {
      label: i18next.t("about"),
      href: "/about",
    },
  ],
  navMenuItems: [
    {
      label: i18next.t("profile"),
      href: "/profile",
    },
    {
      label: i18next.t("dashboard"),
      href: "/dashboard",
    },
    {
      label: i18next.t("projects"),
      href: "/projects",
    },
    {
      label: i18next.t("team"),
      href: "/team",
    },
    {
      label: i18next.t("calendar"),
      href: "/calendar",
    },
    {
      label: i18next.t("settings"),
      href: "/settings",
    },
    {
      label: i18next.t("help-and-feedback"),
      href: "/help-feedback",
    },
    {
      label: i18next.t("logout"),
      href: "/logout",
    },
  ],
  links: {
    github: "https://github.com/heroui-inc/heroui",
    twitter: "https://twitter.com/hero_ui",
    docs: "https://heroui.com",
    discord: "https://discord.gg/9b6yyZKmH4",
    sponsor: "https://github.com/sponsors/sctg-development",
  },
});
