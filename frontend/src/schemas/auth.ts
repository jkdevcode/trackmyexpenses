import * as yup from 'yup';

export const getLoginSchema = (t: (key: string) => string) => {
  return yup.object({
    email: yup
      .string()
      .email(t('errors.email_invalid'))
      .required(t('errors.required')),
    password: yup
      .string()
      .min(8, t('errors.password_min'))
      .max(16, t('errors.password_max'))
      .required(t('errors.required')),
  });
};

export const getRegisterSchema = (t: (key: string) => string) => {
  return yup.object({
    nombre: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t('errors.only_letters'))
      .required(t('errors.required')),
    apellido: yup
      .string()
      .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t('errors.only_letters'))
      .required(t('errors.required')),
    correo: yup
      .string()
      .email(t('errors.email_invalid'))
      .required(t('errors.required')),
    direccion: yup.string().required(t('errors.required')),
    telefono: yup
      .string()
      .matches(/^[0-9]{10}$/, t('errors.phone_invalid'))
      .required(t('errors.required')),
    tipo_documento: yup.string().required(t('errors.required')),
    documento_identidad: yup
      .string()
      .required(t('errors.required'))
      .matches(/^\d+$/, t('errors.numeric_only'))
      .min(6, t('errors.document_min'))
      .max(10, t('errors.document_max')),
    password: yup
      .string()
      .min(8, t('errors.password_min'))
      .max(16, t('errors.password_max'))
      .required(t('errors.required')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password')], t('errors.password_match'))
      .required(t('errors.required')),
  });
};
