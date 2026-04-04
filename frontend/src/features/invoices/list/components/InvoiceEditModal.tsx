import type { InvoiceUnit, PaymentMethod } from "../../types";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
import { Spinner } from "@heroui/spinner";

import { InvoiceSearchInput } from "../../components/InvoiceSearchInput";
import { PaginatedItems } from "../../components/PaginatedItems";
import { PAYMENT_METHOD_OPTIONS } from "../../constants/payment-methods";
import { useInvoiceFilter } from "../../hooks/useInvoiceFilter";
import {
  formatCurrency,
  formatInvoiceQuantity,
  formatPercent,
} from "../../utils/formatters";
import {
  getInvoiceQuantityMin,
  getInvoiceQuantityStep,
  INVOICE_UNITS,
} from "../../utils/invoice-quantity";
import { useInvoiceEditForm } from "../hooks/useInvoiceEditForm";

import { useColorTheme } from "@/hooks/use-color-theme";

type InvoiceEditModalProps = {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
  onSaved: () => void;
};

export const InvoiceEditModal = ({
  invoiceId,
  isOpen,
  onClose,
  onSaved,
}: InvoiceEditModalProps) => {
  const { t, i18n } = useTranslation(["invoices", "validation"]);
  const { appColor } = useColorTheme();
  const {
    detailQuery,
    currency,
    form,
    items,
    formError,
    fieldErrors,
    itemErrors,
    isSaving,
    canSave,
    itemsTotal,
    updateField,
    updateItemField,
    handleSave,
  } = useInvoiceEditForm({
    invoiceId,
    isOpen,
    onClose,
    onSaved,
  });

  const { filterValue, setFilterValue, filteredItems } = useInvoiceFilter({
    data: items,
    searchFn: (item, query) => item.nombre.toLowerCase().includes(query),
  });

  useEffect(() => {
    if (!isOpen) {
      setFilterValue("");
    }
  }, [isOpen, setFilterValue]);

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("actions.edit")}</ModalHeader>
        <ModalBody>
          {detailQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner color={appColor} />
            </div>
          ) : null}

          {detailQuery.isError ? (
            <p className="text-danger">{t("detail.error")}</p>
          ) : null}

          {!detailQuery.isLoading &&
          !detailQuery.isError &&
          detailQuery.data ? (
            <div className="space-y-4">
              <div className="rounded-medium border border-warning-200 bg-warning-50 p-3 text-sm text-warning-700">
                {t("detail.edit_warning")}
              </div>

              <div
                data-error-field={
                  fieldErrors.has("fechaHoraCompra")
                    ? "fechaHoraCompra"
                    : undefined
                }
              >
                <Input
                  color={appColor}
                  errorMessage={fieldErrors.get("fechaHoraCompra")}
                  isInvalid={fieldErrors.has("fechaHoraCompra")}
                  label={t("manual.fecha")}
                  type="date"
                  value={form.fechaHoraCompra}
                  variant="bordered"
                  onValueChange={(value) =>
                    updateField("fechaHoraCompra", value)
                  }
                />
              </div>

              <div
                data-error-field={
                  fieldErrors.has("metodoPago") ? "metodoPago" : undefined
                }
              >
                <Select
                  color={appColor}
                  errorMessage={fieldErrors.get("metodoPago")}
                  isInvalid={fieldErrors.has("metodoPago")}
                  label={t("manual.metodoPago")}
                  selectedKeys={[form.metodoPago]}
                  variant="bordered"
                  onChange={(event) =>
                    updateField(
                      "metodoPago",
                      event.target.value as PaymentMethod,
                    )
                  }
                >
                  {PAYMENT_METHOD_OPTIONS.map((option) => (
                    <SelectItem key={option.key}>
                      {t(option.labelKey, option.fallback)}
                    </SelectItem>
                  ))}
                </Select>
              </div>

              <div
                data-error-field={
                  fieldErrors.has("lugarCompra") ? "lugarCompra" : undefined
                }
              >
                <Input
                  color={appColor}
                  errorMessage={fieldErrors.get("lugarCompra")}
                  isInvalid={fieldErrors.has("lugarCompra")}
                  label={t("manual.lugarCompra")}
                  value={form.lugarCompra}
                  variant="bordered"
                  onValueChange={(value) => updateField("lugarCompra", value)}
                />
              </div>

              <div
                data-error-field={
                  fieldErrors.has("nitProveedor") ? "nitProveedor" : undefined
                }
              >
                <Input
                  color={appColor}
                  errorMessage={fieldErrors.get("nitProveedor")}
                  isInvalid={fieldErrors.has("nitProveedor")}
                  label={t("manual.nitProveedor")}
                  value={form.nitProveedor}
                  variant="bordered"
                  onValueChange={(value) => updateField("nitProveedor", value)}
                />
              </div>

              <div
                className="space-y-3 rounded-medium border border-default-200 p-4"
                data-error-field={
                  fieldErrors.has("items") ? "items" : undefined
                }
              >
                <div className="mb-4 flex items-center justify-between">
                  <h3 className="font-semibold">{t("detail.items_aria")}</h3>
                  <InvoiceSearchInput
                    value={filterValue}
                    onValueChange={setFilterValue}
                  />
                </div>
                <PaginatedItems
                  items={filteredItems}
                  itemsPerPage={10}
                  resetKey={filterValue}
                  renderList={(itemsContent, paginationContent) => (
                    <>
                      <div className="space-y-3">{itemsContent}</div>
                      {paginationContent}
                    </>
                  )}
                  renderItem={(item) => {
                    const originalIndex = items.indexOf(item);
                    const rowError = itemErrors.get(item.productoId);

                    return (
                      <div
                        key={item.productoId}
                        className={`flex flex-col gap-3 rounded-medium border p-3 ${rowError ? "border-danger-200 bg-danger-50" : "border-default-100"}`}
                        data-error-field={
                          rowError ? `items[${originalIndex}]` : undefined
                        }
                      >
                        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                          <div>
                            <p className="text-sm font-semibold">
                              {item.nombre}
                            </p>
                            <p className="text-xs text-default-500">
                              {t("detail.table.cantidad")}:{" "}
                              {formatInvoiceQuantity(
                                item.cantidad,
                                item.unidad,
                                i18n.language,
                              )}{" "}
                              {item.unidad} {t("detail.table.descuento")}:{" "}
                              {formatPercent(item.descuento, i18n.language)}
                            </p>
                          </div>
                          <p className="text-sm font-semibold">
                            {formatCurrency(
                              item.precioTotal,
                              i18n.language,
                              currency,
                            )}
                          </p>
                        </div>
                        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
                          <Input
                            color={appColor}
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
                            label={t("detail.table.cantidad")}
                            min={getInvoiceQuantityMin(item.unidad)}
                            step={getInvoiceQuantityStep(item.unidad)}
                            type="number"
                            value={String(item.cantidad)}
                            variant="bordered"
                            onValueChange={(value) =>
                              updateItemField(
                                item.productoId,
                                "cantidad",
                                value,
                              )
                            }
                          />
                          <Select
                            color={appColor}
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
                            label={t("detail.table.unidad", {
                              defaultValue: "Unidad",
                            })}
                            selectedKeys={[item.unidad]}
                            variant="bordered"
                            onChange={(event) =>
                              updateItemField(
                                item.productoId,
                                "unidad",
                                event.target.value as InvoiceUnit,
                              )
                            }
                          >
                            {INVOICE_UNITS.map((unit) => (
                              <SelectItem key={unit}>{unit}</SelectItem>
                            ))}
                          </Select>
                          <Input
                            color={appColor}
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
                            label={t("detail.table.descuento")}
                            min={0}
                            step="0.01"
                            type="number"
                            value={String(item.descuento)}
                            variant="bordered"
                            onValueChange={(value) =>
                              updateItemField(
                                item.productoId,
                                "descuento",
                                value,
                              )
                            }
                          />
                          <Input
                            color={appColor}
                            errorMessage={rowError}
                            isInvalid={Boolean(rowError)}
                            label={t("detail.table.precioUnitario")}
                            min={0.01}
                            step="0.01"
                            type="number"
                            value={item.precioUnitario}
                            variant="bordered"
                            onValueChange={(value) =>
                              updateItemField(
                                item.productoId,
                                "precioUnitario",
                                value,
                              )
                            }
                          />
                        </div>
                        {rowError ? (
                          <p className="text-xs text-danger">{rowError}</p>
                        ) : null}
                      </div>
                    );
                  }}
                />
                <div className="flex justify-end">
                  <p className="text-sm font-semibold">
                    {t("detail.total")}:{" "}
                    {formatCurrency(itemsTotal, i18n.language, currency)}
                  </p>
                </div>
              </div>

              {formError ? (
                <p
                  className="text-sm text-danger"
                  data-error-field={
                    fieldErrors.size === 0 && itemErrors.size === 0
                      ? "form-error"
                      : undefined
                  }
                >
                  {formError}
                </p>
              ) : null}
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={onClose}>
            {t("detail.close")}
          </Button>
          <Button
            color={appColor}
            isDisabled={!canSave}
            isLoading={isSaving}
            onPress={handleSave}
          >
            {t("actions.edit")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
