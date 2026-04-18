import type { InvoiceUnit } from "../../types";

import { Autocomplete, AutocompleteItem } from "@heroui/autocomplete";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "react-i18next";

import {
  getInvoiceQuantityMin,
  getInvoiceQuantityStep,
  INVOICE_UNITS,
} from "../../utils/invoice-quantity";

interface ManualInvoiceItemFormProps {
  appColor: any;
  appColorVariants: any;
  isLoadingProducts: boolean;
  productOptions: any[];
  selectedProductId: string;
  setSelectedProductId: (id: string) => void;
  setInputText: (text: string) => void;
  setIsCreateProductOpen: (open: boolean) => void;
  itemCantidad: string;
  setItemCantidad: (val: string) => void;
  itemUnidad: InvoiceUnit;
  setItemUnidad: (val: InvoiceUnit) => void;
  itemDescuento: string;
  setItemDescuento: (val: string) => void;
  handleAddItem: () => void;
  fieldErrors: Map<string, string>;
}

const CREATE_PRODUCT_KEY = "__create__";

export const ManualInvoiceItemForm = ({
  appColor,
  appColorVariants,
  isLoadingProducts,
  productOptions,
  selectedProductId,
  setSelectedProductId,
  setInputText,
  setIsCreateProductOpen,
  itemCantidad,
  setItemCantidad,
  itemUnidad,
  setItemUnidad,
  itemDescuento,
  setItemDescuento,
  handleAddItem,
  fieldErrors,
}: ManualInvoiceItemFormProps) => {
  const { t } = useTranslation(["invoices"]);

  return (
    <div
      className="space-y-3 rounded-medium border border-default-200 p-4"
      data-error-field={fieldErrors.has("items") ? "items" : undefined}
    >
      <h3 className="font-semibold">{t("manual.items.add_title")}</h3>

      <Autocomplete
        color={appColor}
        isLoading={isLoadingProducts}
        label={t("manual.items.producto")}
        selectedKey={selectedProductId || null}
        variant="bordered"
        items={productOptions}
        onInputChange={setInputText}
        onSelectionChange={(key) => {
          if (key === CREATE_PRODUCT_KEY) {
            setIsCreateProductOpen(true);

            return;
          }
          setSelectedProductId(key ? String(key) : "");
        }}
      >
        {(item: any) => (
          <AutocompleteItem
            key={item.key}
            textValue={item.textValue}
            className={
              item.isSpecial ? `font-semibold ${appColorVariants.text}` : ""
            }
          >
            {item.label}
          </AutocompleteItem>
        )}
      </Autocomplete>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Input
          color={appColor}
          label={t("manual.items.cantidad")}
          min={getInvoiceQuantityMin(itemUnidad)}
          step={getInvoiceQuantityStep(itemUnidad)}
          type="number"
          value={itemCantidad}
          variant="bordered"
          onValueChange={setItemCantidad}
        />
        <Select
          color={appColor}
          label={t("manual.items.unidad")}
          selectedKeys={[itemUnidad]}
          variant="bordered"
          onChange={(event) => setItemUnidad(event.target.value as InvoiceUnit)}
        >
          {INVOICE_UNITS.map((unit) => (
            <SelectItem key={unit}>{unit}</SelectItem>
          ))}
        </Select>
        <Input
          color={appColor}
          label={t("manual.items.descuento")}
          min={0}
          step="0.01"
          type="number"
          value={itemDescuento}
          variant="bordered"
          onValueChange={setItemDescuento}
        />
      </div>

      <Button color={appColor} type="button" onPress={handleAddItem}>
        {t("manual.items.add")}
      </Button>
    </div>
  );
};
