import { useEffect, useMemo, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { addToast } from "@heroui/toast";
import { Select, SelectItem } from "@heroui/select";
import { isAxiosError } from "axios";

import ChangePasswordCard from "../components/ChangePasswordCard";
import { useUpdateProfileMutation } from "../hooks/useUserMutations";

import { useSession } from "@/contexts/session-context";
import { getErrorMessage } from "@/utils/errors";
import { appColor } from "@/theme/theme.config";
import { getProfileSchema } from "@/schemas/profile";
import { CameraIcon } from "@/components/ui/CameraIcon";
import {
  DEFAULT_CURRENCY,
  SUPPORTED_CURRENCIES,
  normalizeCurrencyCode,
} from "@/constants/currency";

interface ProfileFormValues {
  nombres: string;
  apellidos: string;
  correo: string;
  documento: string;
  monedaBase: string;
}

const ProfilePage = () => {
  const { t } = useTranslation(["profile", "auth", "validation", "common"]);
  const { user, login } = useSession();
  const updateProfileMutation = useUpdateProfileMutation();

  const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

  const [foto, setFoto] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>(
    user?.foto ? `${ASSETS_URL}${user.foto}` : "",
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const lastCurrencyToast = useRef<string | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];

      setFoto(file);
      setFotoPreview(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAvatarClick();
    }
  };

  const defaultValues = useMemo<ProfileFormValues>(
    () => ({
      nombres: user?.nombres || "",
      apellidos: user?.apellidos || "",
      correo: user?.correo || "",
      documento: user?.documento || "",
      monedaBase: normalizeCurrencyCode(user?.monedaBase, DEFAULT_CURRENCY),
    }),
    [user],
  );

  const {
    control,
    handleSubmit,
    register,
    reset,
    watch,
    formState: { errors, touchedFields, isDirty },
  } = useForm<ProfileFormValues>({
    defaultValues,
    resolver: yupResolver(getProfileSchema(t)),
    mode: "onTouched",
  });

  const selectedCurrency = watch("monedaBase");

  useEffect(() => {
    reset(defaultValues);
  }, [defaultValues, reset]);

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

  const onSubmit = async (values: ProfileFormValues) => {
    try {
      if (!user?.id) return;

      const response = await updateProfileMutation.mutateAsync({
        userId: user.id,
        names: values,
        currentUser: {
          nombres: user.nombres,
          apellidos: user.apellidos,
          correo: user.correo,
          documento: user.documento,
          monedaBase: user.monedaBase,
        },
        foto,
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
      const isConflict = isAxiosError(error) && error.response?.status === 409;

      addToast({
        title: t("profile:error"),
        description: isConflict
          ? t("auth:errors.user_exists")
          : getErrorMessage(error, t),
        color: "danger",
        timeout: 5000,
      });
    }
  };

  const handleReset = () => {
    reset(defaultValues);
    setFoto(null);
    setFotoPreview(user?.foto ? `${ASSETS_URL}${user.foto}` : "");
  };

  return (
    <div className="flex flex-col items-center p-4 bg-background min-h-full w-full gap-6">
      <Card className="max-w-4xl w-full shadow-lg rounded-2xl p-6">
        <CardHeader className="flex flex-col items-center pb-0 pt-4">
          <div
            aria-label={t("profile:avatar.change")}
            className="relative group cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={handleAvatarClick}
            onKeyDown={handleAvatarKeyDown}
          >
            <Avatar
              showFallback
              className="w-32 h-32 text-large transition-transform group-hover:scale-105"
              src={fotoPreview || "https://images.unsplash.com/broken"}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
              <CameraIcon className="w-8 h-8 text-white" />
            </div>
            <input
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              type="file"
              onChange={handleImageChange}
            />
          </div>
          <p className="text-primary text-sm mt-3 font-medium transition-opacity opacity-70 hover:opacity-100">
            {t("profile:avatar.change")}
          </p>
          <h1 className="text-2xl font-bold mt-4">{t("profile:title")}</h1>
        </CardHeader>

        <CardBody className="mt-8">
          <form className="space-y-8" onSubmit={handleSubmit(onSubmit)}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                color={appColor}
                errorMessage={errors.nombres?.message}
                isInvalid={!!touchedFields.nombres && !!errors.nombres}
                label={t("auth:fields.name.label")}
                placeholder={t("auth:fields.name.placeholder")}
                variant="bordered"
                {...register("nombres")}
              />
              <Input
                color={appColor}
                errorMessage={errors.apellidos?.message}
                isInvalid={!!touchedFields.apellidos && !!errors.apellidos}
                label={t("auth:fields.lastname.label")}
                placeholder={t("auth:fields.lastname.placeholder")}
                variant="bordered"
                {...register("apellidos")}
              />

              <Input
                color={appColor}
                errorMessage={errors.correo?.message}
                isInvalid={!!touchedFields.correo && !!errors.correo}
                label={t("auth:fields.email.label")}
                placeholder={t("auth:fields.email.placeholder")}
                type="email"
                variant="bordered"
                {...register("correo")}
              />

              <Input
                color={appColor}
                errorMessage={errors.documento?.message}
                isInvalid={!!touchedFields.documento && !!errors.documento}
                label={t("auth:fields.document_id.label")}
                placeholder={t("auth:fields.document_id.placeholder")}
                variant="bordered"
                {...register("documento")}
              />

              <Controller
                control={control}
                name="monedaBase"
                render={({ field }) => (
                  <Select
                    className="md:col-span-2"
                    color={appColor}
                    errorMessage={errors.monedaBase?.message}
                    isInvalid={!!touchedFields.monedaBase && !!errors.monedaBase}
                    label={t("profile:currency.label")}
                    placeholder={t("profile:currency.placeholder")}
                    selectedKeys={field.value ? [field.value] : []}
                    variant="bordered"
                    onChange={(event) => field.onChange(event.target.value)}
                  >
                    {SUPPORTED_CURRENCIES.map((code) => (
                      <SelectItem key={code}>
                        {t(`common:currency.options.${code}`, code)}
                      </SelectItem>
                    ))}
                  </Select>
                )}
              />
            </div>

            <div className="rounded-medium border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
              {t("profile:currency.alert_body")}
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                className="w-full font-semibold shadow-lg"
                color={appColor}
                disabled={!isDirty && !foto}
                isLoading={updateProfileMutation.isPending}
                type="submit"
                variant="solid"
              >
                {t("profile:save")}
              </Button>
              <Button
                className="w-full font-semibold shadow-lg"
                color="default"
                type="button"
                variant="flat"
                onClick={handleReset}
              >
                {t("profile:reset")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
      <ChangePasswordCard />
    </div>
  );
};

export default ProfilePage;
