import { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { addToast } from "@heroui/toast";

import { useForgotPasswordMutation } from "../hooks/useAuthMutations";

import { Logo } from "@/components/ui/icons";
import { useColorTheme } from "@/hooks/use-color-theme";
import { usePageMeta } from "@/hooks/usePageMeta";
import { getForgotPasswordSchema } from "@/schemas/auth";
import { getErrorMessage } from "@/utils/errors";

interface ForgotPasswordFormValues {
  email: string;
}

const ForgotPasswordPage = () => {
  const { t } = useTranslation(["auth", "validation"]);
  const { t: tMeta } = useTranslation("meta");
  const { appColor } = useColorTheme();
  const forgotPasswordMutation = useForgotPasswordMutation();
  const linkColor = appColor === "default" ? "foreground" : appColor;
  const [hasSubmitted, setHasSubmitted] = useState(false);

  usePageMeta({
    title: tMeta("forgotPassword.title", "Forgot Password | TrackMyExpenses"),
    description: tMeta(
      "forgotPassword.description",
      "Request a password reset link for your TrackMyExpenses account.",
    ),
  });

  const {
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm<ForgotPasswordFormValues>({
    defaultValues: {
      email: "",
    },
    resolver: yupResolver(getForgotPasswordSchema(t)),
    mode: "onTouched",
  });

  const onSubmit = async (values: ForgotPasswordFormValues) => {
    try {
      await forgotPasswordMutation.mutateAsync(values);
      setHasSubmitted(true);

      addToast({
        title: t("auth:forgot_password.success"),
        description: t("auth:forgot_password.success_message"),
        color: "success",
        variant: "flat",
        timeout: 4000,
      });
    } catch (error: unknown) {
      addToast({
        title: t("auth:forgot_password.error"),
        description: getErrorMessage(error, t),
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
            {t("auth:forgot_password.title")}
          </h2>
          <p className="mt-3 text-sm text-default-500">
            {t("auth:forgot_password.description")}
          </p>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <Input
            color={appColor}
            errorMessage={errors.email?.message}
            isInvalid={!!touchedFields.email && !!errors.email}
            label={t("auth:fields.email.label")}
            placeholder={t("auth:fields.email.placeholder")}
            type="email"
            variant="bordered"
            {...register("email")}
          />

          {hasSubmitted ? (
            <div className="rounded-xl border border-success/30 bg-success/10 px-4 py-3 text-sm text-success-700">
              {t("auth:forgot_password.success_message")}
            </div>
          ) : null}

          <Button
            className="w-full font-semibold shadow-lg"
            color={appColor}
            isLoading={forgotPasswordMutation.isPending}
            type="submit"
            variant="solid"
          >
            {t("auth:forgot_password.submit")}
          </Button>

          <div className="text-center">
            <Link
              as={RouterLink}
              className="font-semibold"
              color={linkColor}
              to="/login"
            >
              {t("auth:forgot_password.back_to_login")}
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
