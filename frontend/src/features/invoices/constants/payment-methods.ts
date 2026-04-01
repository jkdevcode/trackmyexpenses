import type { PaymentMethod } from "../types";

export const PAYMENT_METHOD_OPTIONS: ReadonlyArray<{
  key: PaymentMethod;
  labelKey: string;
  fallback: string;
}> = [
  { key: "EFECTIVO", labelKey: "common.cash", fallback: "Efectivo" },
  {
    key: "TARJETA_CREDITO",
    labelKey: "common.credit_card",
    fallback: "Tarjeta Credito",
  },
  {
    key: "TARJETA_DEBITO",
    labelKey: "common.debit_card",
    fallback: "Tarjeta Debito",
  },
  {
    key: "TRANSFERENCIA",
    labelKey: "common.transfer",
    fallback: "Transferencia",
  },
  { key: "OTRO", labelKey: "common.other", fallback: "Otro" },
];
