import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { DatePicker } from "@heroui/date-picker";
import { parseDate, getLocalTimeZone, today } from "@internationalized/date";
import { useTranslation } from "react-i18next";
import { appColor } from "@/theme/theme.config";
import { ParsedInvoice, ProductSuggestion } from "./types";
import { InvoiceSummary } from "./InvoiceSummary";
import { InvoiceItemsModal } from "./InvoiceItemsModal";
import { getInvoiceSchema } from "@/schemas/invoice";

interface InvoiceFormProps {
  initialData: ParsedInvoice;
  onSave: (data: InvoiceFormValues & { totalPagar: number }, products: ProductSuggestion[]) => void;
  onCancel: () => void;
  saving: boolean;
}

export interface InvoiceFormValues {
  lugarCompra: string;
  nitProveedor: string;
  fechaHoraCompra: string;
  metodoPago: string;
}

export const InvoiceForm = ({
  initialData,
  onSave,
  onCancel,
  saving,
}: InvoiceFormProps) => {
  const { t } = useTranslation("invoices");
  const { isOpen, onOpen, onClose } = useDisclosure();

  const [products, setProducts] = useState<ProductSuggestion[]>(
    initialData.productos || [],
  );

  const totalPagar = useMemo(() => {
    return products.reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
  }, [products]);

  const {
    control,
    handleSubmit,
    register,
    formState: { errors, touchedFields },
  } = useForm<InvoiceFormValues>({
    defaultValues: {
      lugarCompra: initialData.empresa?.nombre || "",
      nitProveedor: initialData.empresa?.nit || "",
      fechaHoraCompra: initialData.fecha || new Date().toISOString().split("T")[0],
      metodoPago: "EFECTIVO",
    },
    resolver: yupResolver(getInvoiceSchema(t)),
    mode: "onTouched",
  });

  const submitForm = (values: InvoiceFormValues) => {
    onSave({ ...values, totalPagar }, products);
  };

  return (
    <form className="space-y-6 max-w-4xl mx-auto" onSubmit={handleSubmit(submitForm)}>
      <Card>
        <CardHeader className="flex flex-col items-start gap-1 pb-0">
          <h2 className="text-xl font-bold">{t("form.title")}</h2>
          <p className="text-sm text-default-500">{t("form.subtitle")}</p>
        </CardHeader>
        <CardBody className="gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              errorMessage={errors.lugarCompra?.message}
              isInvalid={!!touchedFields.lugarCompra && !!errors.lugarCompra}
              label={t("form.provider")}
              variant="bordered"
              isRequired
              {...register("lugarCompra")}
            />
            <Input
              errorMessage={errors.nitProveedor?.message}
              isInvalid={!!touchedFields.nitProveedor && !!errors.nitProveedor}
              label={t("form.nit")}
              variant="bordered"
              {...register("nitProveedor")}
            />
            <Controller
              control={control}
              name="fechaHoraCompra"
              render={({ field }) => (
                <DatePicker
                  label={t("form.date")}
                  value={field.value ? parseDate(field.value.split("T")[0]) : today(getLocalTimeZone())}
                  onChange={(date: any) => field.onChange(date ? date.toString() : "")}
                  variant="bordered"
                  isRequired
                  maxValue={today(getLocalTimeZone())}
                  isInvalid={!!touchedFields.fechaHoraCompra && !!errors.fechaHoraCompra}
                  errorMessage={errors.fechaHoraCompra?.message}
                />
              )}
            />
            <Controller
              control={control}
              name="metodoPago"
              render={({ field }) => (
                <Select
                  label={t("form.payment_method")}
                  selectedKeys={[field.value]}
                  onChange={(e) => field.onChange(e.target.value)}
                  variant="bordered"
                  isRequired
                  isInvalid={!!touchedFields.metodoPago && !!errors.metodoPago}
                  errorMessage={errors.metodoPago?.message}
                >
                  <SelectItem key="EFECTIVO">
                    {t("common.cash", "Efectivo")}
                  </SelectItem>
                  <SelectItem key="TARJETA_CREDITO">
                    {t("common.credit_card", "Tarjeta Credito")}
                  </SelectItem>
                  <SelectItem key="TARJETA_DEBITO">
                    {t("common.debit_card", "Tarjeta Debito")}
                  </SelectItem>
                  <SelectItem key="TRANSFERENCIA">
                    {t("common.transfer", "Transferencia")}
                  </SelectItem>
                  <SelectItem key="OTRO">{t("common.other", "Otro")}</SelectItem>
                </Select>
              )}
            />
          </div>

          <div className="border-t border-default-200 pt-4 mt-2">
            <Input
              label={t("form.total")}
              value={`$ ${new Intl.NumberFormat("es-CO").format(totalPagar)}`}
              readOnly
              description={t("form.total_desc")}
              className="font-bold text-lg"
              color={appColor}
            />
          </div>
        </CardBody>
      </Card>

      <div>
        <h3 className="text-lg font-semibold mb-2 ml-1">
          {t("form.products_title")}
        </h3>

        {products.length > 10 ? (
          <InvoiceSummary
            totalItems={products.length}
            totalAmount={totalPagar}
            onViewProducts={onOpen}
          />
        ) : (
          <Card className="p-4">
            <div className="flex justify-between items-center mb-4">
              <span className="font-semibold">
                {products.length} {t("form.items")}
              </span>
              <Button size="sm" variant="flat" onPress={onOpen}>
                {t("form.edit")}
              </Button>
            </div>
            <ul className="space-y-2">
              {products.map((p, idx) => (
                <li
                  key={idx}
                  className="flex justify-between text-sm border-b border-default-100 pb-1"
                >
                  <span>
                    {p.cantidad} x {p.nombreDetected}
                  </span>
                  <span>
                    ${new Intl.NumberFormat("es-CO").format(p.precioTotal)}
                  </span>
                </li>
              ))}
            </ul>
          </Card>
        )}
      </div>

      <div className="flex gap-4 justify-end pt-4">
        <Button color="danger" variant="flat" onPress={onCancel}>
          {t("form.cancel")}
        </Button>
        <Button color={appColor} type="submit" isLoading={saving}>
          {t("form.save")}
        </Button>
      </div>

      <InvoiceItemsModal
        isOpen={isOpen}
        onClose={onClose}
        products={products}
        onProductsChange={setProducts}
      />
    </form>
  );
};
