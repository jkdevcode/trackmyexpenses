import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Navbar, NavbarBrand, NavbarContent, NavbarMenu, NavbarMenuToggle, NavbarMenuItem } from "@heroui/navbar";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Link as RouterLink, useLocation } from "react-router-dom";

import { useSession } from "@/contexts/session-context";
import { appColor } from "@/theme/theme.config";
import { HomeIcon, InvoiceIcon, SettingsIcon, LogoutIcon, Logo } from "./LayoutIcons";

export const MobileNavbar = () => {
    const { t } = useTranslation();
    const { user, logout } = useSession();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const location = useLocation();

    const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

    const avatarUrl = user?.foto
        ? `${ASSETS_URL}${user.foto}`
        : "/default-avatar.png";

    const menuItems = [
        { label: t("navigation.dashboard"), href: "/dashboard", icon: <HomeIcon /> },
        { label: t("navigation.invoices"), href: "/invoices", icon: <InvoiceIcon /> },
        { label: t("navigation.settings"), href: "/settings", icon: <SettingsIcon /> },
    ];

    return (
        <Navbar
            isMenuOpen={isMenuOpen}
            onMenuOpenChange={setIsMenuOpen}
            className="md:hidden border-b border-divider"
            maxWidth="full"
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
                    color={appColor}
                    src={avatarUrl}
                    size="sm"
                />
            </NavbarContent>

            <NavbarMenu className="pt-6 bg-background/90 backdrop-blur-md">
                <div className="flex flex-col gap-6 h-full">
                    {/* User Info Section */}
                    <div className="flex items-center gap-4 px-2 pb-6 border-b border-divider">
                        <Avatar
                            isBordered
                            color={appColor}
                            className="w-14 h-14"
                            src={avatarUrl}
                            alt="Avatar usuario"
                        />
                        <div className="flex flex-col">
                            <span className={`font-bold text-${appColor} text-lg`}>{user?.nombres} {user?.apellidos}</span>
                            <span className="text-default-500 font-medium text-sm">{user?.correo}</span>
                        </div>
                    </div>

                    {/* Navigation Links */}
                    <div className="flex flex-col gap-2">
                        {menuItems.map((item, index) => {
                            const isActive = location.pathname === item.href;
                            return (
                                <NavbarMenuItem key={`${item.href}-${index}`}>
                                    <Link
                                        className={`w-full flex items-center gap-3 p-3 rounded-xl transition-colors ${isActive
                                            ? `bg-${appColor}/10 text-${appColor} font-medium`
                                            : "text-foreground hover:bg-default-100"
                                            }`}
                                        as={RouterLink}
                                        to={item.href}
                                        size="lg"
                                        onClick={() => setIsMenuOpen(false)}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        {item.label}
                                    </Link>
                                </NavbarMenuItem>
                            )
                        })}
                    </div>

                    {/* Logout Button */}
                    <div className="mt-auto pb-8">
                        <Button
                            className="w-full justify-start gap-3 px-4"
                            variant="light"
                            color="danger"
                            onClick={() => {
                                setIsMenuOpen(false);
                                logout();
                            }}
                            startContent={<LogoutIcon />}
                        >
                            {t("auth.logout")}
                        </Button>
                    </div>
                </div>
            </NavbarMenu>
        </Navbar>
    );
};
