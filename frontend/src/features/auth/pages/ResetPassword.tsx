import { useState } from "react";
import {
  Link as RouterLink,
  useNavigate,
  useSearchParams,
} from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { addToast } from "@heroui/toast";

import { useResetPasswordMutation } from "../hooks/useAuthMutations";

import { EyeFilledIcon, EyeSlashFilledIcon, Logo } from "@/components/ui/icons";
import { useColorTheme } from "@/hooks/use-color-theme";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getResetPasswordSchema } from "@/schemas/auth";
import { getErrorMessage } from "@/utils/errors";

interface ResetPasswordFormValues {
  newPassword: string;
  confirmPassword: string;
}

const ResetPasswordPage = () => {
  const { t } = useTranslation(["auth", "validation", "errors"]);
  const { t: tMeta } = useTranslation("meta");
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { appColor } = useColorTheme();
  const resetPasswordMutation = useResetPasswordMutation();
  const linkColor = appColor === "default" ? "foreground" : appColor;
  const token = searchParams.get("token")?.trim() ?? "";
  const [isVisible, setIsVisible] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  usePageMeta({
    title: tMeta("resetPassword.title", "Reset Password | TrackMyExpenses"),
    description: tMeta(
      "resetPassword.description",
      "Set a new password for your TrackMyExpenses account.",
    ),
  });

  const {
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm<ResetPasswordFormValues>({
    defaultValues: {
      newPassword: "",
      confirmPassword: "",
    },
    resolver: yupResolver(getResetPasswordSchema(t)),
    mode: "onTouched",
  });

  const tokenError = token ? null : t("auth:reset_password.missing_token");

  const toggleVisibility = () => setIsVisible((currentValue) => !currentValue);

  const onSubmit = async (values: ResetPasswordFormValues) => {
    if (!token) {
      setSubmitError(t("auth:reset_password.missing_token"));

      return;
    }

    try {
      setSubmitError(null);
      await resetPasswordMutation.mutateAsync({
        token,
        newPassword: values.newPassword,
      });

      addToast({
        title: t("auth:reset_password.success"),
        description: t("auth:reset_password.success_description"),
        color: "success",
        variant: "flat",
        timeout: 4000,
      });

      navigate("/login");
    } catch (error: unknown) {
      const errorMessage = getErrorMessage(error, t);

      setSubmitError(errorMessage);
      addToast({
        title: t("auth:reset_password.error"),
        description: errorMessage,
        color: "danger",
        variant: "flat",
        timeout: 5000,
      });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-content1 p-8 shadow-lg">
        <div className="flex flex-col items-center text-center">
          <Logo size={60} />
          <h2 className="mt-6 text-3xl font-extrabold text-foreground">
            {t("auth:reset_password.title")}
          </h2>
          <p className="mt-3 text-sm text-default-500">
            {t("auth:reset_password.description")}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {tokenError || submitError ? (
            <div className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-3 text-sm text-danger-700">
              {submitError ?? tokenError}
            </div>
          ) : null}

          <Input
            color={appColor}
            endContent={
              <button
                aria-label={isVisible ? "Hide password" : "Show password"}
                className="focus:outline-none"
                type="button"
                onClick={toggleVisibility}
              >
                {isVisible ? (
                  <EyeSlashFilledIcon className="pointer-events-none text-2xl text-default-400" />
                ) : (
                  <EyeFilledIcon className="pointer-events-none mb-2 text-2xl text-default-400" />
                )}
              </button>
            }
            errorMessage={errors.newPassword?.message}
            isInvalid={!!touchedFields.newPassword && !!errors.newPassword}
            label={t("auth:fields.password.label")}
            placeholder={t("auth:fields.password.placeholder")}
            type={isVisible ? "text" : "password"}
            variant="bordered"
            {...register("newPassword")}
          />

          <Input
            color={appColor}
            errorMessage={errors.confirmPassword?.message}
            isInvalid={
              !!touchedFields.confirmPassword && !!errors.confirmPassword
            }
            label={t("auth:fields.confirm_password.label")}
            placeholder={t("auth:fields.confirm_password.placeholder")}
            type={isVisible ? "text" : "password"}
            variant="bordered"
            {...register("confirmPassword")}
          />

          <Button
            className="w-full font-semibold shadow-lg"
            color={appColor}
            isDisabled={!token}
            isLoading={resetPasswordMutation.isPending}
            type="submit"
            variant="solid"
          >
            {t("auth:reset_password.submit")}
          </Button>

          <div className="flex justify-center">
            <Link
              as={RouterLink}
              className="font-semibold"
              color={linkColor}
              to="/forgot-password"
            >
              {t("auth:reset_password.request_new_link")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
