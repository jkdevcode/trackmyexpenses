import type { ManualInvoiceItem } from "../types";

import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";

import { PaginatedItems } from "../../components/PaginatedItems";
import { formatCurrency } from "../../utils/formatters";
import {
  getInvoiceQuantityMin,
  getInvoiceQuantityStep,
  INVOICE_UNITS,
} from "../../utils/invoice-quantity";

interface ManualInvoiceItemsTableProps {
  items: ManualInvoiceItem[];
  itemErrors: Map<number, string>;
  fieldErrors: Map<string, string>;
  moneda: string;
  baseCurrency: string;
  totalCalculado: number;
  totalBase: number | null;
  showConversion: boolean;
  appColor: any;
  updateItemField: (
    productoId: number,
    field: "cantidad" | "descuento" | "unidad",
    value: string,
  ) => void;
  handleRemoveItem: (productoId: number) => void;
}

export const ManualInvoiceItemsTable = ({
  items,
  itemErrors,
  fieldErrors,
  moneda,
  baseCurrency,
  totalCalculado,
  totalBase,
  showConversion,
  appColor,
  updateItemField,
  handleRemoveItem,
}: ManualInvoiceItemsTableProps) => {
  const { t, i18n } = useTranslation(["invoices"]);

  return (
    <div
      className="space-y-3 rounded-medium border border-default-200 p-4"
      data-error-field={fieldErrors.has("items") ? "items" : undefined}
    >
      <h3 className="font-semibold">{t("manual.items.list_title")}</h3>

      {items.length === 0 ? (
        <p className="text-default-500 text-sm">{t("manual.items.empty")}</p>
      ) : (
        <PaginatedItems
          items={items}
          itemsPerPage={10}
          renderList={(itemsContent, paginationContent) => (
            <>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-default-200 text-left">
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.nombre")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.cantidad")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.unidad")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.precioUnitario")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.descuento")}
                      </th>
                      <th className="py-2 pr-2">
                        {t("manual.items.columns.subtotal")}
                      </th>
                      <th className="py-2">
                        {t("manual.items.columns.acciones")}
                      </th>
                    </tr>
                  </thead>
                  <tbody>{itemsContent}</tbody>
                </table>
              </div>
              {paginationContent}
            </>
          )}
          renderItem={(item) => {
            const originalIndex = items.indexOf(item);
            const rowError = itemErrors.get(item.productoId);

            return (
              <>
                <tr
                  key={item.productoId}
                  data-error-field={
                    rowError ? `items[${originalIndex}]` : undefined
                  }
                  className={`border-b border-default-100 transition-colors ${rowError ? "bg-danger-50" : ""}`}
                >
                  <td className="py-2 pr-2">{item.nombre}</td>
                  <td className="py-2 pr-2">
                    <Input
                      className="max-w-[120px]"
                      min={getInvoiceQuantityMin(item.unidad)}
                      size="sm"
                      step={getInvoiceQuantityStep(item.unidad)}
                      type="number"
                      value={String(item.cantidad)}
                      variant="bordered"
                      onValueChange={(value) =>
                        updateItemField(item.productoId, "cantidad", value)
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    <Select
                      className="max-w-[120px]"
                      selectedKeys={[item.unidad]}
                      size="sm"
                      variant="bordered"
                      onChange={(event) =>
                        updateItemField(
                          item.productoId,
                          "unidad",
                          event.target.value,
                        )
                      }
                    >
                      {INVOICE_UNITS.map((unit) => (
                        <SelectItem key={unit}>{unit}</SelectItem>
                      ))}
                    </Select>
                  </td>
                  <td className="py-2 pr-2">
                    {formatCurrency(item.precioUnitario, i18n.language, moneda)}
                  </td>
                  <td className="py-2 pr-2">
                    <Input
                      className="max-w-[120px]"
                      min={0}
                      size="sm"
                      type="number"
                      value={String(item.descuento ?? 0)}
                      variant="bordered"
                      onValueChange={(value) =>
                        updateItemField(item.productoId, "descuento", value)
                      }
                    />
                  </td>
                  <td className="py-2 pr-2">
                    {formatCurrency(item.subtotal, i18n.language, moneda)}
                  </td>
                  <td className="py-2">
                    <Button
                      color="danger"
                      size="sm"
                      type="button"
                      variant="light"
                      onPress={() => handleRemoveItem(item.productoId)}
                    >
                      {t("manual.items.remove")}
                    </Button>
                  </td>
                </tr>
                {rowError ? (
                  <tr key={`${item.productoId}-error`}>
                    <td className="text-danger text-xs pb-2 pl-1" colSpan={7}>
                      {rowError}
                    </td>
                  </tr>
                ) : null}
              </>
            );
          }}
        />
      )}

      <div className="grid grid-cols-1 gap-3">
        <Input
          color={appColor}
          isReadOnly
          label={t("manual.total")}
          value={formatCurrency(totalCalculado, i18n.language, moneda)}
          variant="bordered"
        />
        {showConversion ? (
          <Input
            color={appColor}
            isReadOnly
            label={t("manual.currency.total_base")}
            value={
              totalBase === null
                ? t("manual.currency.pending")
                : formatCurrency(totalBase, i18n.language, baseCurrency)
            }
            variant="bordered"
          />
        ) : null}
      </div>
    </div>
  );
};
