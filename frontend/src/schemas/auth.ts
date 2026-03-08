import type { TFunction } from "i18next";

import * as yup from "yup";

export const getLoginSchema = (t: TFunction) => {
  return yup.object({
    documento: yup
      .string()
      .required(t("validation:required"))
      .min(6, t("validation:document_min"))
      .max(10, t("validation:document_max")),
    contrasena: yup
      .string()
      .min(5, t("validation:password_min"))
      .required(t("validation:required")),
  });
};

export const getRegisterSchema = (t: TFunction) => {
  return yup.object({
    nombre: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t("validation:only_letters"))
      .required(t("validation:required")),
    apellido: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t("validation:only_letters"))
      .required(t("validation:required")),
    email: yup
      .string()
      .email(t("validation:email_invalid"))
      .required(t("validation:required")),
    direccion: yup.string().required(t("validation:required")),
    telefono: yup
      .string()
      .matches(/^[0-9]{10}$/, t("validation:phone_invalid"))
      .required(t("validation:required")),
    tipo_documento: yup.string().required(t("validation:required")),
    documento_identidad: yup
      .string()
      .required(t("validation:required"))
      .matches(/^\d+$/, t("validation:numeric_only"))
      .min(6, t("validation:document_min"))
      .max(10, t("validation:document_max")),
    password: yup
      .string()
      .min(8, t("validation:password_min"))
      .max(16, t("validation:password_max"))
      .required(t("validation:required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("password")], t("validation:password_match"))
      .required(t("validation:required")),
  });
};
