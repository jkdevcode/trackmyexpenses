import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Link as RouterLink } from "react-router-dom";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { ThemeSwitch } from "@/components/ui/theme-switch";
import { LanguageSwitch, I18nIcon } from "@/components/ui/language-switch";
import { availableLanguages } from "@/i18n";
import { useColorTheme } from "@/hooks/use-color-theme";

export const LandingHeader = () => {
  const { t } = useTranslation("");
  const { appColor } = useColorTheme();
  const linkColor = appColor === "default" ? "foreground" : appColor;

  return (
    <HeroNavbar maxWidth="xl" position="sticky">
      <NavbarBrand>
        <RouterLink to="/">
          <p className="font-bold text-inherit text-xl">{t("app-name")}</p>
        </RouterLink>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        <NavbarItem>
          <Link color="foreground" href="#features">
            {t("features")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Link color="foreground" href="#how-it-works">
            {t("how-it-works")}
          </Link>
        </NavbarItem>
      </NavbarContent>
      <NavbarContent justify="end">
        <NavbarItem className="hidden lg:flex">
          <Link color={linkColor} href="/login">
            {t("login")}
          </Link>
        </NavbarItem>
        <NavbarItem>
          <Button as={Link} color={appColor} href="/register" variant="flat">
            {t("create-account")}
          </Button>
        </NavbarItem>
        <NavbarItem className="flex gap-2">
          <ThemeSwitch />
          <LanguageSwitch
            availableLanguages={availableLanguages}
            icon={I18nIcon}
          />
        </NavbarItem>
      </NavbarContent>
    </HeroNavbar>
  );
};
