import { useState, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";

import axiosClient from "@/lib/axiosClient";
import { getErrorMessage } from "@/utils/errors";
import { appColor } from "@/theme/theme.config";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/ui/icons";
import { getRegisterSchema } from "@/schemas/auth";

// Icono para el avatar fallback
export const CameraIcon = (props: any) => {
  return (
    <svg
      aria-hidden="true"
      fill="none"
      focusable="false"
      height="1em"
      role="presentation"
      viewBox="0 0 24 24"
      width="1em"
      {...props}
    >
      <path
        d="M20 5H16.85C16.5 5 16.2 4.85 16 4.6L15.35 3.3C15 2.55 14.35 2 13.55 2H10.45C9.65 2 9 2.55 8.65 3.3L8 4.6C7.8 4.85 7.5 5 7.15 5H4C2.35 5 1 6.35 1 8V17C1 18.65 2.35 20 4 20H20C21.65 20 23 18.65 23 17V8C23 6.35 21.65 5 20 5ZM12 16.5C9.5 16.5 7.5 14.5 7.5 12C7.5 9.5 9.5 7.5 12 7.5C14.5 7.5 16.5 9.5 16.5 12C16.5 14.5 14.5 16.5 12 16.5Z"
        fill="currentColor"
      />
    </svg>
  );
};


const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [generalError, setGeneralError] = useState<string | null>(null);

  // Image handling
  const [foto, setFoto] = useState<File | null>(null);
  const [fotoUrl, setFotoUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const toggleVisibility = () => setIsVisible(!isVisible);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setFoto(file);
      setFotoUrl(URL.createObjectURL(file));
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  // Helper types for Select options
  const documentTypes = [
    { key: "cedula", label: t("auth:document_types.cc") },
    { key: "tarjeta", label: t("auth:document_types.ti") },
    { key: "tarjeta de extranjeria", label: t("auth:document_types.tarjeta_extranjeria") },
    { key: "pasaporte", label: t("auth:document_types.pasaport") },
  ];

  const formik = useFormik({
    initialValues: {
      nombre: "",
      apellido: "",
      email: "", // mapeado a 'correo' en backend
      telefono: "",
      direccion: "",
      tipo_documento: "",
      documento_identidad: "",
      password: "",
      confirmPassword: ""
    },
    validationSchema: getRegisterSchema(t),
    onSubmit: async (values) => {
      setGeneralError(null);

      try {
        const payload = {
          tipoDocumento: values.tipo_documento,
          documento: values.documento_identidad,
          nombres: values.nombre,
          apellidos: values.apellido,
          correo: values.email,
          contrasena: values.password,
          foto: "" // Backend validation: z.string().url().optional().or(z.literal('')) - cannot be null
        };

        const response = await axiosClient.post("/auth/register", payload);

        if (response.status === 200 || response.status === 201) {
          navigate("/login");
        }

      } catch (error: any) {
        if (error.response?.status === 409) {
          setGeneralError(t("auth:errors.user_exists"));
        } else {
          setGeneralError(getErrorMessage(error, t));
        }
      }
    },
  });

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl w-full space-y-8 bg-content1 p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center">
          {/* Logo o Avatar Upload */}
          <div className="flex flex-col items-center mb-4 group cursor-pointer" onClick={handleAvatarClick}>
            <Avatar
              className="w-24 h-24 mb-2 transition-transform group-hover:scale-105"
              src={fotoUrl}
              showFallback
              fallback={<CameraIcon className="w-10 h-10 text-default-500" />}
            />
            <span className="text-xs text-primary font-medium">{t("auth:register.avatar_fallback")}</span>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <h2 className="text-center text-3xl font-extrabold text-foreground">
            {t("auth:register.title")}
          </h2>
        </div>

        {generalError && (
          <div className={`p-3 rounded-md bg-danger-50 text-danger text-sm text-center border border-danger-200`}>
            {generalError}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <Input
              errorMessage={formik.errors.nombre}
              isInvalid={formik.touched.nombre && !!formik.errors.nombre}
              label={t("auth:fields.name.label")}
              name="nombre"
              placeholder={t("auth:fields.name.placeholder")}
              value={formik.values.nombre}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            />
            {/* Apellidos */}
            <Input
              errorMessage={formik.errors.apellido}
              isInvalid={formik.touched.apellido && !!formik.errors.apellido}
              label={t("auth:fields.lastname.label")}
              name="apellido"
              placeholder={t("auth:fields.lastname.placeholder")}
              value={formik.values.apellido}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            />

            {/* Email */}
            <Input
              className="md:col-span-2"
              errorMessage={formik.errors.email}
              isInvalid={formik.touched.email && !!formik.errors.email}
              label={t("auth:fields.email.label")}
              name="email"
              type="email"
              placeholder={t("auth:fields.email.placeholder")}
              value={formik.values.email}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            />

            {/* Telefono */}
            <Input
              errorMessage={formik.errors.telefono}
              isInvalid={formik.touched.telefono && !!formik.errors.telefono}
              label={t("auth:fields.phone.label")}
              name="telefono"
              type="tel"
              placeholder={t("auth:fields.phone.placeholder")}
              value={formik.values.telefono}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            />

            {/* Direccion */}
            <Input
              errorMessage={formik.errors.direccion}
              isInvalid={formik.touched.direccion && !!formik.errors.direccion}
              label={t("auth:fields.address.label")}
              name="direccion"
              placeholder={t("auth:fields.address.placeholder")}
              value={formik.values.direccion}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            />

            {/* Tipo Documento */}
            <Select
              errorMessage={formik.errors.tipo_documento}
              isInvalid={formik.touched.tipo_documento && !!formik.errors.tipo_documento}
              label={t("auth:fields.document_type.label")}
              name="tipo_documento"
              placeholder={t("auth:fields.document_type.placeholder")}
              selectedKeys={formik.values.tipo_documento ? [formik.values.tipo_documento] : []}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            >
              {documentTypes.map((doc) => (
                <SelectItem key={doc.key}>
                  {doc.label}
                </SelectItem>
              ))}
            </Select>

            {/* Documento ID */}
            <Input
              errorMessage={formik.errors.documento_identidad}
              isInvalid={formik.touched.documento_identidad && !!formik.errors.documento_identidad}
              label={t("auth:fields.document_id.label")}
              name="documento_identidad"
              placeholder={t("auth:fields.document_id.placeholder")}
              value={formik.values.documento_identidad}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
              color={appColor}
            />

            {/* Password */}
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

            {/* Confirm Password */}
            <Input
              color={appColor}
              errorMessage={formik.errors.confirmPassword}
              isInvalid={formik.touched.confirmPassword && !!formik.errors.confirmPassword}
              label={t("auth:fields.confirm_password.label")}
              name="confirmPassword"
              placeholder={t("auth:fields.confirm_password.placeholder")}
              type="password"
              value={formik.values.confirmPassword}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </div>

          <div>
            <Button
              className="w-full font-semibold shadow-lg"
              color={appColor}
              isLoading={formik.isSubmitting}
              type="submit"
              variant="solid"
            >
              {t("auth:register.submit")}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-default-500">
              {t("auth:register.has_account")}{' '}
              <Link as={RouterLink} className="font-semibold" color={appColor === "default" ? "foreground" : (appColor as any)} to="/login">
                {t("auth:register.login_link")}
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RegisterPage;
