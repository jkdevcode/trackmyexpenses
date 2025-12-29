import { useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";

import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/utils/errors";
import { appColor } from "@/theme/theme.config";
import { EyeFilledIcon, EyeSlashFilledIcon, Logo } from "@/components/ui/icons";
import { getLoginSchema } from "@/schemas/auth";

const LoginPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
    },
    validationSchema: getLoginSchema(t),
    onSubmit: async (values) => {
      setGeneralError(null);
      try {
        const response = await axiosClient.post("/validacion", {
          correo: values.email, // Ajustado para coincidir con backend legacy
          password: values.password,
        });

        if (response.status === 200) {
          const { token, user } = response.data;
          // Manejo robusto del usuario (array o objeto) según el código legacy
          const userInfo = Array.isArray(user) ? user[0] : user;
          
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(userInfo));

          // const userRol = userInfo.rol;

          // Redirección basada en rol (adaptada del código legacy)
          // Asumiremos dashboard para todos por ahora, o mantendremos la lógica si las rutas existen
          // En este caso, redirigiremos a /dashboard que es la nueva ruta principal
          navigate("/dashboard");
          
          // Opcional: Mostrar toast de éxito si tuviéramos una librería de toast
        }
      } catch (error: any) {
        setGeneralError(getErrorMessage(error, t));
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-md w-full space-y-8 bg-content1 p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center">
          <Logo size={60} />
          <h2 className="mt-6 text-center text-3xl font-extrabold text-foreground">
            {t("auth:login.title")}
          </h2>
        </div>
        
        {generalError && (
            <div className={`p-3 rounded-md bg-danger-50 text-danger text-sm text-center border border-danger-200`}>
                {generalError}
            </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="rounded-md space-y-4">
            <Input
              errorMessage={formik.errors.email}
              isInvalid={formik.touched.email && !!formik.errors.email}
              label={t("auth:fields.email.label")}
              name="email"
              placeholder={t("auth:fields.email.placeholder")}
              type="email"
              value={formik.values.email}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor} 
            />
            <Input
              color={appColor}
              endContent={
                <button
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
              errorMessage={formik.errors.password}
              isInvalid={formik.touched.password && !!formik.errors.password}
              label={t("auth:fields.password.label")}
              name="password"
              placeholder={t("auth:fields.password.placeholder")}
              type={isVisible ? "text" : "password"}
              value={formik.values.password}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link as={RouterLink} color={appColor === "default" ? "foreground" : (appColor as any)} href="#" to="/forgot-password">
                {t("auth:login.forgot_password")}
              </Link>
            </div>
          </div>

          <div>
            <Button
              className="w-full font-semibold shadow-lg"
              color={appColor}
              isLoading={formik.isSubmitting}
              type="submit"
              variant="solid"
            >
              {t("auth:login.submit")}
            </Button>
          </div>
          
          <div className="text-center mt-4">
             <p className="text-sm text-default-500">
                {t("auth:login.no_account")}{' '}
                <Link as={RouterLink} className="font-semibold" color={appColor === "default" ? "foreground" : (appColor as any)} to="/register">
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
