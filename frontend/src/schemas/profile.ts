import type { TFunction } from "i18next";

import * as yup from "yup";

export const getProfileSchema = (t: TFunction) => {
  return yup.object({
    nombres: yup
      .string()
      .required(t("validation:required"))
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t("validation:only_letters")),
    apellidos: yup
      .string()
      .required(t("validation:required"))
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t("validation:only_letters")),
    correo: yup
      .string()
      .required(t("validation:required"))
      .email(t("validation:email_invalid")),
    documento: yup
      .string()
      .required(t("validation:required"))
      .matches(/^\d+$/, t("validation:numeric_only"))
      .min(6, t("validation:document_min"))
      .max(10, t("validation:document_max")),
  });
};

export const getChangePasswordSchema = (t: TFunction) => {
  return yup.object({
    currentPassword: yup.string().required(t("validation:required")),
    newPassword: yup
      .string()
      .min(8, t("validation:password_min"))
      .max(16, t("validation:password_max"))
      .required(t("validation:required")),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref("newPassword")], t("validation:password_match"))
      .required(t("validation:required")),
  });
};
