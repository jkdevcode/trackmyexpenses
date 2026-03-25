import { useState, type KeyboardEvent } from "react";
import { useTranslation } from "react-i18next";
import {
  Navbar,
  NavbarBrand,
  NavbarContent,
  NavbarMenu,
  NavbarMenuToggle,
  NavbarMenuItem,
} from "@heroui/navbar";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";

import {
  HomeIcon,
  InvoiceIcon,
  SettingsIcon,
  LogoutIcon,
  Logo,
} from "./LayoutIcons";

import { useSession } from "@/contexts/session-context";
import { useAppColorVariants } from "@/theme/app-color-variants";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useColorTheme } from "@/hooks/use-color-theme";

export const MobileNavbar = () => {
  const { t } = useTranslation();
  const { user, logout } = useSession();
  const { appColor } = useColorTheme();
  const appColorVariants = useAppColorVariants();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

  const avatarUrl = user?.foto ? `${ASSETS_URL}${user.foto}` : undefined;

  const menuItems = [
    {
      label: t("navigation.dashboard"),
      href: "/dashboard",
      icon: <HomeIcon />,
    },
    {
      label: t("navigation.invoices"),
      href: "/invoices",
      icon: <InvoiceIcon />,
    },
    {
      label: t("navigation.settings"),
      href: "/settings",
      icon: <SettingsIcon />,
    },
  ];

  const handleProfileKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      setIsMenuOpen(false);
      navigate("/profile");
    }
  };

  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate("/login");
  };

  return (
    <Navbar
      className="md:hidden border-b border-divider"
      isMenuOpen={isMenuOpen}
      maxWidth="full"
      onMenuOpenChange={setIsMenuOpen}
    >
      <NavbarContent>
        <NavbarMenuToggle
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        />
        <NavbarBrand className="gap-2">
          <Logo size={24} />
          <p className="font-bold text-inherit">{t("app-name")}</p>
        </NavbarBrand>
      </NavbarContent>

      <NavbarContent justify="end">
        <Avatar
          isBordered
          aria-label={t("profile:title")}
          className="cursor-pointer"
          color={appColor}
          role="button"
          size="sm"
          src={avatarUrl}
          showFallback
          tabIndex={0}
          onClick={() => navigate("/profile")}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              navigate("/profile");
            }
          }}
        />
      </NavbarContent>

      <NavbarMenu className="pt-6 bg-background/90 backdrop-blur-md">
        <div className="flex flex-col gap-6 h-full">
          {/* Navigation Links */}
          <div className="flex flex-col gap-2 px-2">
            {menuItems.map((item) => {
              const isActive = location.pathname === item.href;

              return (
                <NavbarMenuItem key={item.href}>
                  <Link
                    as={RouterLink}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${
                      isActive
                        ? `${appColorVariants.navActive} font-medium`
                        : "text-foreground hover:bg-default-100"
                    }`}
                    size="lg"
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <span className="text-xl">{item.icon}</span>
                    {item.label}
                  </Link>
                </NavbarMenuItem>
              );
            })}
          </div>

          <div className="w-full h-px bg-divider" />

          {/* Settings Row: Language & Theme */}
          <NavbarMenuItem>
            <div className="flex items-center justify-between px-4 py-2">
              <span className="text-default-500 font-medium">
                {t("language")} / {t("theme")}
              </span>
              <div className="flex items-center gap-4">
                <LanguageSwitch
                  availableLanguages={[
                    { code: "es-ES", nativeName: "Español", isRTL: false },
                    {
                      code: "en-US",
                      nativeName: "English",
                      isRTL: false,
                      isDefault: true,
                    },
                  ]}
                />
                <ThemeSwitch />
              </div>
            </div>
          </NavbarMenuItem>

          {/* User Info Section */}
          <NavbarMenuItem>
            <div
              aria-label={t("profile:title")}
              className="flex items-center gap-4 px-4 py-3 rounded-2xl hover:bg-default-100 cursor-pointer transition-colors group"
              role="button"
              tabIndex={0}
              onClick={() => {
                setIsMenuOpen(false);
                navigate("/profile");
              }}
              onKeyDown={handleProfileKeyDown}
            >
              <Avatar
                isBordered
                alt="Avatar usuario"
                className="w-12 h-12 group-hover:scale-105 transition-transform"
                color={appColor}
                src={avatarUrl}
                showFallback
              />
              <div className="flex flex-col">
                <span className={`font-bold text-lg ${appColorVariants.text}`}>
                  {user?.nombres} {user?.apellidos}
                </span>
                <span className="text-default-500 font-medium text-sm">
                  {user?.correo}
                </span>
              </div>
            </div>
          </NavbarMenuItem>

          {/* Logout Button */}
          <NavbarMenuItem className="mt-auto pb-8 px-4">
            <Button
              className="w-full justify-start gap-3"
              color="danger"
              startContent={<LogoutIcon />}
              variant="light"
              onPress={() => {
                void handleLogout();
              }}
            >
              {t("auth.logout")}
            </Button>
          </NavbarMenuItem>
        </div>
      </NavbarMenu>
    </Navbar>
  );
};
