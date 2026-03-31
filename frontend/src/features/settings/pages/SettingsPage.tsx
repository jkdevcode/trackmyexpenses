import React, { useEffect, useMemo, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Select, SelectItem } from "@heroui/select";
import { addToast } from "@heroui/toast";

import { useSession } from "@/contexts/session-context";
import { useColorTheme } from "@/hooks/use-color-theme";
import { HerouiColor } from "@/theme/theme.config";
import { usePageMeta } from "@/hooks/usePageMeta";
import { ThemeSwitch } from "@/components/ui/theme-switch";
import { LanguageSwitch } from "@/components/ui/language-switch";
import { useUpdateProfileMutation } from "@/features/user/hooks/useUserMutations";
import { getErrorMessage } from "@/utils/errors";
import { availableLanguages } from "@/i18n";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  normalizeCurrencyCode,
  type SupportedCurrency,
} from "@/constants/currency";

export const SettingsPage = () => {
  const { t } = useTranslation(["settings", "profile", "common"]);
  const { user, login } = useSession();
  const { appColor, setAppColor } = useColorTheme();
  const updateProfileMutation = useUpdateProfileMutation();
  const { t: tMeta } = useTranslation("meta");

  usePageMeta({
    title: tMeta("settings.title"),
    description: tMeta("settings.description")
  });

  const colors: HerouiColor[] = [
    "default",
    "primary",
    "secondary",
    "success",
    "warning",
  ];

  const defaultCurrency = useMemo(
    () => normalizeCurrencyCode(user?.monedaBase, DEFAULT_CURRENCY),
    [user],
  );

  const [selectedCurrency, setSelectedCurrency] =
    React.useState(defaultCurrency);
  const lastCurrencyToast = useRef<string | null>(null);

  useEffect(() => {
    setSelectedCurrency(defaultCurrency);
  }, [defaultCurrency]);

  useEffect(() => {
    if (!user?.monedaBase) return;

    if (
      selectedCurrency &&
      selectedCurrency !== user.monedaBase &&
      selectedCurrency !== lastCurrencyToast.current
    ) {
      addToast({
        title: t("profile:currency.alert_title"),
        description: t("profile:currency.alert_body"),
        color: "warning",
        timeout: 4000,
      });
      lastCurrencyToast.current = selectedCurrency;
    }
  }, [selectedCurrency, user?.monedaBase, t]);

  const handleSaveCurrency = async () => {
    try {
      if (!user?.id) return;

      const response = await updateProfileMutation.mutateAsync({
        userId: user.id,
        names: {
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          documento: user.documento,
          monedaBase: selectedCurrency,
        },
        currentUser: {
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          documento: user.documento,
          monedaBase: user.monedaBase,
        },
      });

      if (!response) {
        addToast({
          title: t("profile:success"),
          color: "success",
          timeout: 3000,
        });

        return;
      }

      addToast({
        title: t("profile:success"),
        color: "success",
        timeout: 3000,
      });
      login(response.user);
    } catch (error: unknown) {
      addToast({
        title: t("profile:error"),
        description: getErrorMessage(error, t),
        color: "danger",
        timeout: 5000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center p-4 bg-background min-h-full w-full gap-6">
      <div className="max-w-4xl w-full flex flex-col gap-6">
        <h1 className="text-2xl font-bold ml-2">{t("settings:title")}</h1>

        <Card className="w-full shadow-lg rounded-2xl p-2">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h2 className="text-xl font-semibold">
              {t("settings:sections.appearance.title")}
            </h2>
            <p className="text-default-500 text-sm">
              {t("settings:sections.appearance.description")}
            </p>
          </CardHeader>
          <CardBody className="mt-4 flex flex-col gap-4">
            <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg">
              <span className="font-medium">{t("common:theme")}</span>
              <ThemeSwitch />
            </div>
            <div className="flex items-center justify-between p-4 border border-default-200 rounded-lg">
              <span className="font-medium">{t("common:language")}</span>
              <LanguageSwitch availableLanguages={availableLanguages} />
            </div>
          </CardBody>
        </Card>

        <Card className="w-full shadow-lg rounded-2xl p-2">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h2 className="text-xl font-semibold">
              {t("settings:sections.app_color.title")}
            </h2>
            <p className="text-default-500 text-sm">
              {t("settings:sections.app_color.description")}
            </p>
          </CardHeader>
          <CardBody className="mt-4">
            <div className="flex flex-wrap gap-4 p-4 border border-default-200 rounded-lg">
              {colors.map((color) => (
                <Button
                  key={color}
                  color={color}
                  variant={appColor === color ? "solid" : "flat"}
                  onPress={() => setAppColor(color)}
                  className="capitalize font-semibold"
                >
                  <div
                    className={`w-3 h-3 rounded-full bg-${color === "default" ? "default-500" : "current"} mr-2`}
                  />
                  {t(`settings:colors.${color}`)}
                </Button>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card className="w-full shadow-lg rounded-2xl p-2">
          <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
            <h2 className="text-xl font-semibold">
              {t("settings:sections.financial.title")}
            </h2>
            <p className="text-default-500 text-sm">
              {t("settings:sections.financial.description")}
            </p>
          </CardHeader>
          <CardBody className="mt-4">
            <div className="flex flex-col gap-4 p-4 border border-default-200 rounded-lg">
              <Select
                color={appColor}
                label={t("profile:currency.label")}
                placeholder={t("profile:currency.placeholder")}
                selectedKeys={selectedCurrency ? [selectedCurrency] : []}
                variant="bordered"
                onChange={(event) =>
                  setSelectedCurrency(event.target.value as SupportedCurrency)
                }
              >
                {SUPPORTED_CURRENCIES.map((code) => (
                  <SelectItem key={code}>
                    {t(`common:currency.options.${code}`, code)}
                  </SelectItem>
                ))}
              </Select>

              {selectedCurrency !== user?.monedaBase && (
                <div className="rounded-medium border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
                  {t("profile:currency.alert_body")}
                </div>
              )}

              <Button
                className="mt-2 w-full sm:w-auto self-end font-semibold shadow-md"
                color={appColor}
                disabled={selectedCurrency === user?.monedaBase}
                isLoading={updateProfileMutation.isPending}
                onPress={handleSaveCurrency}
              >
                {t("profile:save")}
              </Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};
