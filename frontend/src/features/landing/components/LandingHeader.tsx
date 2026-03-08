import {
  Navbar as HeroNavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
} from "@heroui/navbar";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { appColor } from "@/theme/theme.config";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { LanguageSwitch, I18nIcon } from "@/components/ui/language-switch";
import { availableLanguages } from "@/i18n";

export const LandingHeader = () => {
  const { t } = useTranslation();
  const linkColor = appColor === "default" ? "foreground" : "primary";

  return (
    <HeroNavbar maxWidth="xl" position="sticky">
      <NavbarBrand>
        <p className="font-bold text-inherit text-xl">{t("app-name")}</p>
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
