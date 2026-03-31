import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { addToast } from "@heroui/toast";

import { useLoginMutation } from "../hooks/useAuthMutations";

import { getErrorMessage } from "@/utils/errors";
import { EyeFilledIcon, EyeSlashFilledIcon, Logo } from "@/components/ui/icons";
import { getLoginSchema } from "@/schemas/auth";
import { useSession } from "@/contexts/session-context";
import { useColorTheme } from "@/hooks/use-color-theme";
import { usePageMeta } from "@/hooks/usePageMeta";

interface LoginFormValues {
  documento: string;
  contrasena: string;
}

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { login } = useSession();
  const { appColor } = useColorTheme();

  const { t: tMeta } = useTranslation("meta");
  usePageMeta({
    title: tMeta("login.title", "Login | TrackMyExpenses"),
    description: tMeta("login.description", "Access your TrackMyExpenses account.")
  });

  const [isVisible, setIsVisible] = useState(false);
  const loginMutation = useLoginMutation();
  const linkColor = appColor === "default" ? "foreground" : appColor;

  const toggleVisibility = () => setIsVisible(!isVisible);

  const {
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm<LoginFormValues>({
    defaultValues: {
      documento: "",
      contrasena: "",
    },
    resolver: yupResolver(getLoginSchema(t)),
    mode: "onTouched",
  });

  const onSubmit = async (values: LoginFormValues) => {
    try {
      const data = await loginMutation.mutateAsync(values);

      login(data.user);

      addToast({
        title: t("auth:login.success"),
        description: t("auth:login.success_description"),
        color: "success",
        variant: "flat",
        timeout: 4000,
      });

      navigate("/dashboard");
    } catch (error: unknown) {
      addToast({
        title: t("auth:login.error"),
        description: getErrorMessage(error, t),
        color: "danger",
        variant: "flat",
        timeout: 5000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 bg-content1 p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center">
          <Logo size={60} />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t("auth:login.title")}
          </h2>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md space-y-4">
            <Input
              color={appColor}
              errorMessage={errors.documento?.message}
              isInvalid={!!touchedFields.documento && !!errors.documento}
              label={t("auth:fields.documento.label")}
              placeholder={t("auth:fields.documento.placeholder")}
              type="text"
              variant="bordered"
              {...register("documento")}
            />
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
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none mb-2" />
                  )}
                </button>
              }
              errorMessage={errors.contrasena?.message}
              isInvalid={!!touchedFields.contrasena && !!errors.contrasena}
              label={t("auth:fields.password.label")}
              placeholder={t("auth:fields.password.placeholder")}
              type={isVisible ? "text" : "password"}
              variant="bordered"
              {...register("contrasena")}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                as={RouterLink}
                color={linkColor}
                href="#"
                to="/forgot-contrasena"
              >
                {t("auth:login.forgot_password")}
              </Link>
            </div>
          </div>

          <div>
            <Button
              className="w-full font-semibold shadow-lg"
              color={appColor}
              isLoading={loginMutation.isPending}
              type="submit"
              variant="solid"
            >
              {t("auth:login.submit")}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-default-500">
              {t("auth:login.no_account")}{" "}
              <Link
                as={RouterLink}
                className="font-semibold"
                color={linkColor}
                to="/register"
              >
                {t("auth:login.register_link")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LoginPage;
