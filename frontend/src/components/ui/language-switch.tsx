/**
 * @copyright Copyright (c) 2024-2025 Ronan LE MEILLAT
 * @license AGPL-3.0-or-later
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Affero General Public License as
 * published by the Free Software Foundation, either version 3 of the
 * License, or (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Affero General Public License for more details.
 *
 * You should have received a copy of the GNU Affero General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */
import { type FC, useState, useEffect, useCallback } from "react";
import { useTranslation } from "react-i18next";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Tooltip } from "@heroui/tooltip";

import { type AvailableLanguage } from "@/i18n";
import { type IconSvgProps } from "@/types";

interface LanguageSwitchProps {
  /**
   * The available languages
   * @see i18n.ts
   */
  availableLanguages?: AvailableLanguage[];
  /**
   * Custom icon component to display instead of the default I18nIcon
   * @default I18nIcon
   */
  icon?: FC<IconSvgProps>;
}

export const I18nIcon: FC<IconSvgProps> = ({
  size = 24,
  width,
  height,
  ...props
}) => {
  return (
    <svg
      height={size || height}
      viewBox="0 0 1024 1024"
      width={size || width}
      {...props}
    >
      <path
        d="M547.797333 638.208l-104.405333-103.168 1.237333-1.28a720.170667 720.170667 0 0 0 152.490667-268.373333h120.448V183.082667h-287.744V100.906667H347.605333v82.218666H59.818667V265.386667h459.178666a648.234667 648.234667 0 0 1-130.304 219.946666 643.242667 643.242667 0 0 1-94.976-137.728H211.541333a722.048 722.048 0 0 0 122.453334 187.434667l-209.194667 206.378667 58.368 58.368 205.525333-205.525334 127.872 127.829334 31.232-83.84m231.424-208.426667h-82.218666l-184.96 493.312h82.218666l46.037334-123.306667h195.242666l46.464 123.306667h82.218667l-185.002667-493.312m-107.690666 287.744l66.56-178.005333 66.602666 178.005333z"
        fill="currentColor"
      />
    </svg>
  );
};

/**
 * Language switch component
 * @description
 * A language switch component that allows users to change the language of the application
 * It uses the i18n instance to change the language and update the document metadata
 * Available languages are defined in the i18n configuration (src/i18n.ts)
 * @param availableLanguages Optional The available languages default [{ code: "en-US", nativeName: "English", isRTL: false, isDefault: true }]
 * @param icon Optional custom icon to use instead of the default I18nIcon
 * @example
 * ```tsx
 * <LanguageSwitch  availableLanguages={[{ code: "en-US", nativeName: "English", isRTL: false, isDefault: true },{ code: "fr-FR", nativeName: "Français", isRTL: false }]} />
 * ```
 * @example
 * ```tsx
 * import { availableLanguages } from "@/i18n";
 * <LanguageSwitch availableLanguages={availableLanguages} />
 * ```
 */
export const LanguageSwitch: FC<LanguageSwitchProps> = ({
  availableLanguages: availableLanguages = [
    { code: "en-US", nativeName: "English", isRTL: false, isDefault: true },
  ],
  icon: Icon = I18nIcon,
}) => {
  const { i18n, t } = useTranslation();
  const [language, setLanguage] = useState<string>(
    localStorage.getItem("preferredLanguage") || i18n.language,
  );

  /**
   * Update document direction based on language
   * @description
   * This effect updates the document direction based on the language
   * It uses the availableLanguages array to determine the language direction
   * @see availableLanguages
   */
  useEffect(() => {
    const isRTL =
      availableLanguages.find((lang) => lang.code === language)?.isRTL || false;

    document.documentElement.dir = isRTL ? "rtl" : "ltr";
  }, [language]);

  // Sync state with i18n when language changes externally
  useEffect(() => {
    setLanguage(i18n.language);
  }, [i18n.language]);

  /**
   * Change the language and update document metadata
   * @param lng The language code
   * @example changeLanguage("fr-FR")
   */
  const changeLanguage = useCallback(
    (lng: string) => {
      i18n.changeLanguage(lng);
      setLanguage(lng);
      localStorage.setItem("preferredLanguage", lng);
      document.documentElement.lang = lng;

      // Update metadata
      document.title = t("vite-heroui");
      const metaTags = [
        document.head.querySelector("meta[key='title']"),
        document.head.querySelector("meta[name='title']"),
        document.head.querySelector("meta[property='og:title']"),
      ];

      metaTags.forEach((tag) => {
        tag?.setAttribute("content", t("vite-heroui"));
      });
    },
    [i18n, t],
  );

  /**
   * Get the short language code from the language code
   * erases the region part of the language code
   * @param lng
   * @returns The short language code
   * @example getShortLanguage("fr-FR") => "FR"
   */
  const getShortLanguage = (lng: string) => {
    // use the last part of the language code or the whole code
    return lng.split("-")[1] || lng;
  };

  return (
    <Tooltip content={t("language")} delay={750}>
      <div className="flex gap-1">
        <Dropdown>
          <DropdownTrigger>
            <Button aria-label={t("language")} variant="light">
              <Icon className="text-default-500" size={24} />
            </Button>
          </DropdownTrigger>
          <DropdownMenu aria-label={t("language")}>
            {availableLanguages.map((languageIdentifier) => {
              // Construct the language switch component with the language code
              const isSelected = language === languageIdentifier.code;

              return (
                <DropdownItem
                  key={languageIdentifier.code}
                  aria-label={`${t("language")}: ${languageIdentifier}`}
                  aria-selected={isSelected}
                >
                  <button
                    key={languageIdentifier.code}
                    className={`${isSelected ? "text-primary" : "text-default-600"} w-full flex items-center justify-between`}
                    type="button"
                    onClick={() => changeLanguage(languageIdentifier.code)}
                  >
                    <span>{languageIdentifier.nativeName}</span>
                    <span>
                      {getShortLanguage(
                        languageIdentifier.code,
                      ).toLocaleUpperCase()}
                    </span>
                  </button>
                </DropdownItem>
              );
            })}
          </DropdownMenu>
        </Dropdown>
      </div>
    </Tooltip>
  );
};
