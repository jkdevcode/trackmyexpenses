import type { KeyboardEvent } from "react";

import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

import { NavItem } from "./NavItem";
import {
  HomeIcon,
  InvoiceIcon,
  SettingsIcon,
  LogoutIcon,
  Logo,
} from "./LayoutIcons";

import { useSession } from "@/contexts/session-context";
import { appColor } from "@/theme/theme.config";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { LanguageSwitch } from "@/components/ui/language-switch";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

export const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const { t } = useTranslation();
  const { user, logout } = useSession();
  const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

  const navigate = useNavigate();

  const avatarUrl = user?.foto
    ? `${ASSETS_URL}${user.foto}`
    : "/default-avatar.png";

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
      navigate("/profile");
    }
  };

  return (
    <aside
      className={`hidden md:flex flex-col h-screen border-r border-divider bg-background transition-all duration-300 ease-in-out sticky top-0
            ${isCollapsed ? "w-20" : "w-64"}
        `}
    >
      {/* Header */}
      <div className="h-20 flex items-center justify-center p-4">
        <div
          aria-label="Toggle sidebar"
          className={`flex items-center gap-3 cursor-pointer ${isCollapsed ? "justify-center" : ""}`}
          role="button"
          tabIndex={0}
          onClick={onToggle}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onToggle();
            }
          }}
        >
          <Logo size={isCollapsed ? 32 : 40} />
          {!isCollapsed && (
            <span
              className={`font-bold text-xl text-${appColor} whitespace-nowrap overflow-hidden`}
            >
              {t("app-name")}
            </span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto py-4 px-3 flex flex-col gap-2">
        {menuItems.map((item) => (
          <NavItem key={item.href} {...item} isCollapsed={isCollapsed} />
        ))}
      </div>

      {/* Footer / User */}
      <div className="p-4 border-t border-divider">
        <div
          className={`flex flex-col gap-4 ${isCollapsed ? "items-center" : ""}`}
        >
          {/* Settings Row */}
          <div
            className={`flex items-center ${isCollapsed ? "flex-col gap-4" : "justify-between px-1"}`}
          >
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

          <div
            aria-label={t("profile:title")}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-default-100 cursor-pointer transition-colors overflow-hidden group"
            role="button"
            tabIndex={0}
            onClick={() => navigate("/profile")}
            onKeyDown={handleProfileKeyDown}
          >
            <Avatar
              isBordered
              alt="Avatar usuario"
              className="group-hover:scale-105 transition-transform"
              color={appColor}
              size={isCollapsed ? "sm" : "md"}
              src={avatarUrl}
            />
            {!isCollapsed && (
              <div className="flex flex-col min-w-0">
                <span className={`font-bold text-${appColor} text-sm truncate`}>
                  {user?.nombres} {user?.apellidos}
                </span>
                <span className="text-default-500 font-medium text-xs truncate">
                  {user?.correo}
                </span>
              </div>
            )}
          </div>

          <Tooltip
            color="default"
            content={t("auth.logout")}
            isDisabled={!isCollapsed}
            placement="right"
          >
            <Button
              className={`w-full ${isCollapsed ? "" : "justify-start gap-2"}`}
              color="danger"
              isIconOnly={isCollapsed}
              size="sm"
              variant="flat"
              onClick={logout}
            >
              <LogoutIcon />
              {!isCollapsed && <span>{t("auth.logout")}</span>}
            </Button>
          </Tooltip>
        </div>
      </div>
    </aside>
  );
};
