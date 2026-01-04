import * as yup from 'yup';

export const getProfileSchema = (t: (key: string, options?: any) => string) => {
    return yup.object({
        nombres: yup
            .string()
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t('validation:only_letters'))
            .optional(),
        apellidos: yup
            .string()
            .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, t('validation:only_letters'))
            .optional(),
        correo: yup
            .string()
            .email(t('validation:email_invalid'))
            .optional(),
        documento: yup
            .string()
            .matches(/^\d+$/, t('validation:numeric_only'))
            .min(6, t('validation:document_min'))
            .max(10, t('validation:document_max'))
            .optional(),
    });
};
