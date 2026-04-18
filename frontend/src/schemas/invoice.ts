import type { TFunction } from "i18next";

import * as yup from "yup";

export const getInvoiceSchema = (t: TFunction) =>
  yup.object({
    lugarCompra: yup.string().trim().required(t("validation:required")),
    nitProveedor: yup.string().trim().ensure(),
    fechaHoraCompra: yup.string().required(t("validation:required")),
    metodoPago: yup.string().required(t("validation:required")),
    moneda: yup
      .string()
      .required(t("validation:required"))
      .length(3, t("validation:currency_invalid")),
  });
