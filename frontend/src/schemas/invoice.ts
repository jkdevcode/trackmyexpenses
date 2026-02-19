import * as yup from "yup";

export const getInvoiceSchema = (t: (key: string, options?: any) => string) =>
  yup.object({
    lugarCompra: yup.string().trim().required(t("validation:required")),
    nitProveedor: yup.string().trim().ensure(),
    fechaHoraCompra: yup.string().required(t("validation:required")),
    metodoPago: yup.string().required(t("validation:required")),
  });
