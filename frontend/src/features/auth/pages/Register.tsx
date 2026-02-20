import { useState, useRef } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Link } from "@heroui/link";
import { Select, SelectItem } from "@heroui/select";
import { Avatar } from "@heroui/avatar";
import { addToast } from "@heroui/toast";

import { getErrorMessage } from "@/utils/errors";
import { appColor } from "@/theme/theme.config";
import { EyeFilledIcon, EyeSlashFilledIcon } from "@/components/ui/icons";
import { getRegisterSchema } from "@/schemas/auth";
import { useRegisterMutation } from "../hooks/useAuthMutations";
import { CameraIcon } from "@/components/ui/CameraIcon";

interface RegisterFormValues {
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  direccion: string;
  tipo_documento: string;
  documento_identidad: string;
  password: string;
  confirmPassword: string;
}

const RegisterPage = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const registerMutation = useRegisterMutation();

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

  const handleAvatarKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      handleAvatarClick();
    }
  };

  // Helper types for Select options
  const documentTypes = [
    { key: "cedula", label: t("auth:document_types.cc") },
    { key: "tarjeta", label: t("auth:document_types.ti") },
    {
      key: "tarjeta de extranjeria",
      label: t("auth:document_types.tarjeta_extranjeria"),
    },
    { key: "pasaporte", label: t("auth:document_types.pasaport") },
  ];

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm<RegisterFormValues>({
    defaultValues: {
      nombre: "",
      apellido: "",
      email: "",
      telefono: "",
      direccion: "",
      tipo_documento: "",
      documento_identidad: "",
      password: "",
      confirmPassword: "",
    },
    resolver: yupResolver(getRegisterSchema(t)),
    mode: "onTouched",
  });

  const onSubmit = async (values: RegisterFormValues) => {
    try {
      await registerMutation.mutateAsync({ ...values, foto });

      addToast({
        title: t("auth:register.success"),
        description: t("auth:register.success_description"),
        color: "success",
        timeout: 3000,
      });
      navigate("/login");
    } catch (error: any) {
      addToast({
        title: t("auth:register.error"),
        description:
          error.response?.status === 409
            ? t("auth:errors.user_exists")
            : getErrorMessage(error, t),
        color: "danger",
        timeout: 5000,
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl w-full space-y-8 bg-content1 p-8 rounded-2xl shadow-lg">
        <div className="flex flex-col items-center">
          {/* Logo o Avatar Upload */}
          <div
            className="flex flex-col items-center mb-4 group cursor-pointer"
            onClick={handleAvatarClick}
            onKeyDown={handleAvatarKeyDown}
            tabIndex={0}
            role="button"
            aria-label={t("auth:register.avatar_fallback")}
          >
            <Avatar
              className="w-24 h-24 mb-2 transition-transform group-hover:scale-105"
              src={fotoUrl}
              showFallback
              fallback={<CameraIcon className="w-10 h-10 text-default-500" />}
            />
            <span className="text-xs text-primary font-medium">
              {t("auth:register.avatar_fallback")}
            </span>
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

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombres */}
            <Input
              errorMessage={errors.nombre?.message}
              isInvalid={!!touchedFields.nombre && !!errors.nombre}
              label={t("auth:fields.name.label")}
              placeholder={t("auth:fields.name.placeholder")}
              variant="bordered"
              color={appColor}
              {...register("nombre")}
            />
            {/* Apellidos */}
            <Input
              errorMessage={errors.apellido?.message}
              isInvalid={!!touchedFields.apellido && !!errors.apellido}
              label={t("auth:fields.lastname.label")}
              placeholder={t("auth:fields.lastname.placeholder")}
              variant="bordered"
              color={appColor}
              {...register("apellido")}
            />

            {/* Email */}
            <Input
              className="md:col-span-2"
              errorMessage={errors.email?.message}
              isInvalid={!!touchedFields.email && !!errors.email}
              label={t("auth:fields.email.label")}
              type="email"
              placeholder={t("auth:fields.email.placeholder")}
              variant="bordered"
              color={appColor}
              {...register("email")}
            />

            {/* Telefono */}
            <Input
              errorMessage={errors.telefono?.message}
              isInvalid={!!touchedFields.telefono && !!errors.telefono}
              label={t("auth:fields.phone.label")}
              type="tel"
              placeholder={t("auth:fields.phone.placeholder")}
              variant="bordered"
              color={appColor}
              {...register("telefono")}
            />

            {/* Direccion */}
            <Input
              errorMessage={errors.direccion?.message}
              isInvalid={!!touchedFields.direccion && !!errors.direccion}
              label={t("auth:fields.address.label")}
              placeholder={t("auth:fields.address.placeholder")}
              variant="bordered"
              color={appColor}
              {...register("direccion")}
            />

            {/* Tipo Documento */}
            <Controller
              control={control}
              name="tipo_documento"
              render={({ field }) => (
                <Select
                  errorMessage={errors.tipo_documento?.message}
                  isInvalid={
                    !!touchedFields.tipo_documento && !!errors.tipo_documento
                  }
                  label={t("auth:fields.document_type.label")}
                  name={field.name}
                  placeholder={t("auth:fields.document_type.placeholder")}
                  selectedKeys={field.value ? [field.value] : []}
                  variant="bordered"
                  onBlur={field.onBlur}
                  onChange={(e) => field.onChange(e.target.value)}
                  color={appColor}
                >
                  {documentTypes.map((doc) => (
                    <SelectItem key={doc.key}>{doc.label}</SelectItem>
                  ))}
                </Select>
              )}
            />

            {/* Documento ID */}
            <Input
              errorMessage={errors.documento_identidad?.message}
              isInvalid={
                !!touchedFields.documento_identidad &&
                !!errors.documento_identidad
              }
              label={t("auth:fields.document_id.label")}
              placeholder={t("auth:fields.document_id.placeholder")}
              variant="bordered"
              color={appColor}
              {...register("documento_identidad")}
            />

            {/* Password */}
            <Input
              color={appColor}
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={toggleVisibility}
                  aria-label={isVisible ? "Hide password" : "Show password"}
                >
                  {isVisible ? (
                    <EyeSlashFilledIcon className="text-2xl text-default-400 pointer-events-none" />
                  ) : (
                    <EyeFilledIcon className="text-2xl text-default-400 pointer-events-none mb-2" />
                  )}
                </button>
              }
              errorMessage={errors.password?.message}
              isInvalid={!!touchedFields.password && !!errors.password}
              label={t("auth:fields.password.label")}
              placeholder={t("auth:fields.password.placeholder")}
              type={isVisible ? "text" : "password"}
              variant="bordered"
              {...register("password")}
            />

            {/* Confirm Password */}
            <Input
              color={appColor}
              errorMessage={errors.confirmPassword?.message}
              isInvalid={
                !!touchedFields.confirmPassword && !!errors.confirmPassword
              }
              label={t("auth:fields.confirm_password.label")}
              placeholder={t("auth:fields.confirm_password.placeholder")}
              type="password"
              variant="bordered"
              {...register("confirmPassword")}
            />
          </div>

          <div>
            <Button
              className="w-full font-semibold shadow-lg"
              color={appColor}
              isLoading={registerMutation.isPending}
              type="submit"
              variant="solid"
            >
              {t("auth:register.submit")}
            </Button>
          </div>

          <div className="text-center mt-4">
            <p className="text-sm text-default-500">
              {t("auth:register.has_account")}{" "}
              <Link
                as={RouterLink}
                className="font-semibold"
                color={
                  appColor === "default" ? "foreground" : (appColor as any)
                }
                to="/login"
              >
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
