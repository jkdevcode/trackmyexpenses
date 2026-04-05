import type { ProductSuggestion } from "../types";

import { useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import { useTranslation } from "react-i18next";

import { formatCurrency } from "../utils/formatters";
import { useInvoiceFilter } from "../hooks/useInvoiceFilter";
import {
  getInvoiceQuantityMin,
  getInvoiceQuantityStep,
  INVOICE_UNITS,
} from "../utils/invoice-quantity";

import { InvoiceSearchInput } from "./InvoiceSearchInput";
import { PaginatedItems } from "./PaginatedItems";

import { DeleteIcon } from "@/components/ui/icons";
import { useColorTheme } from "@/hooks/use-color-theme";

interface InvoiceItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductSuggestion[];
  onProductsChange: (products: ProductSuggestion[]) => void;
  currencyCode?: string;
  /** Map<originalIndex, translatedErrorMessage> from backend details[] */
  itemErrors?: Map<number, string>;
}

export const InvoiceItemsModal = ({
  isOpen,
  onClose,
  products,
  onProductsChange,
  currencyCode,
  itemErrors = new Map(),
}: InvoiceItemsModalProps) => {
  const { t, i18n } = useTranslation(["invoices", "common"]);
  const { appColor } = useColorTheme();

  const rowsPerPage = 10;
  const { filterValue, setFilterValue, filteredItems } = useInvoiceFilter({
    data: products,
    searchFn: (item, query) =>
      item.nombreDetected.toLowerCase().includes(query),
  });

  useEffect(() => {
    if (!isOpen) {
      setFilterValue("");
    }
  }, [isOpen, setFilterValue]);

  const handleUpdate = (
    itemToUpdate: ProductSuggestion,
    field: keyof ProductSuggestion,
    value: string | number,
  ) => {
    const originalIndex = products.indexOf(itemToUpdate);

    if (originalIndex === -1) return;

    let newValue = value;

    if (field === "cantidad" || field === "precioUnitario") {
      newValue = Number(value);
    }

    const updatedItem = { ...products[originalIndex], [field]: newValue };

    if (field === "cantidad" || field === "precioUnitario") {
      updatedItem.precioTotal =
        updatedItem.cantidad * updatedItem.precioUnitario;
    }

    const newProdList = [...products];

    newProdList[originalIndex] = updatedItem;
    onProductsChange(newProdList);
  };

  const handleDelete = (item: ProductSuggestion) => {
    const newProducts = products.filter((p) => p !== item);

    onProductsChange(newProducts);
  };

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="5xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("modal.title")}
          <span className="text-sm font-normal text-default-500">
            {products.length} {t("modal.items_count")}
          </span>
          {itemErrors.size > 0 && (
            <span className="text-danger text-xs font-normal">
              ⚠{" "}
              {t("errors:ITEMS_HAS_ERRORS", {
                count: itemErrors.size,
                defaultValue: `${itemErrors.size} item(s) have errors`,
              })}
            </span>
          )}
        </ModalHeader>
        <ModalBody>
          <div className="flex justify-between items-center mb-4">
            <InvoiceSearchInput
              value={filterValue}
              onValueChange={setFilterValue}
            />
          </div>

          <PaginatedItems
            items={filteredItems}
            itemsPerPage={rowsPerPage}
            resetKey={filterValue}
            renderList={(itemsContent, paginationContent) => (
              <Table
                aria-label="Tabla de productos OCR"
                bottomContent={paginationContent}
              >
                <TableHeader>
                  <TableColumn>{t("modal.columns.product")}</TableColumn>
                  <TableColumn>{t("modal.columns.qty")}</TableColumn>
                  <TableColumn>{t("modal.columns.unit")}</TableColumn>
                  <TableColumn>{t("modal.columns.price")}</TableColumn>
                  <TableColumn>{t("modal.columns.total")}</TableColumn>
                  <TableColumn>{t("modal.columns.actions")}</TableColumn>
                </TableHeader>
                <TableBody>{itemsContent as any}</TableBody>
              </Table>
            )}
            renderItem={(item: ProductSuggestion, localIndex: number) => {
              const originalIndex = products.indexOf(item);
              const rowError = itemErrors.get(originalIndex);

              return (
                <TableRow
                  key={localIndex}
                  data-error-field={
                    rowError ? `items[${originalIndex}]` : undefined
                  }
                  className={rowError ? "bg-danger-50" : ""}
                >
                  <TableCell>
                    <div>
                      <Input
                        size="sm"
                        value={item.nombreDetected}
                        variant={rowError ? "bordered" : "underlined"}
                        color={rowError ? "danger" : "default"}
                        onChange={(e) =>
                          handleUpdate(item, "nombreDetected", e.target.value)
                        }
                      />
                      {rowError && (
                        <p className="text-danger text-xs mt-1">
                          ⚠ {rowError}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-20"
                      min={getInvoiceQuantityMin(item.unidad)}
                      size="sm"
                      step={getInvoiceQuantityStep(item.unidad)}
                      type="number"
                      value={item.cantidad.toString()}
                      variant="underlined"
                      onChange={(e) =>
                        handleUpdate(item, "cantidad", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Select
                      className="w-20"
                      selectedKeys={[item.unidad]}
                      size="sm"
                      variant="underlined"
                      onChange={(event) =>
                        handleUpdate(item, "unidad", event.target.value)
                      }
                    >
                      {INVOICE_UNITS.map((unit) => (
                        <SelectItem key={unit}>{unit}</SelectItem>
                      ))}
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Input
                      className="w-28"
                      size="md"
                      startContent={currencyCode ? `${currencyCode} ` : "$"}
                      type="number"
                      value={item.precioUnitario.toString()}
                      variant="underlined"
                      onChange={(e) =>
                        handleUpdate(item, "precioUnitario", e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <span className="font-semibold">
                      {formatCurrency(
                        item.precioTotal,
                        i18n.language,
                        currencyCode,
                      )}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Button
                      isIconOnly
                      aria-label={`Delete ${item.nombreDetected}`}
                      color="danger"
                      size="sm"
                      variant="light"
                      onPress={() => handleDelete(item)}
                    >
                      <DeleteIcon className="text-lg pointer-events-none" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            }}
          />
        </ModalBody>
        <ModalFooter>
          <Button color={appColor} onPress={onClose}>
            {t("modal.close")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
