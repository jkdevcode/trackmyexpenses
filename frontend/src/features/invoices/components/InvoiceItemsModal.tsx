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
import { Pagination } from "@heroui/pagination";
import { useTranslation } from "react-i18next";
import { appColor } from "@/theme/theme.config";
import { useState, useMemo } from "react";
import { DeleteIcon, SearchIcon } from "@/components/ui/icons";
import type { ProductSuggestion } from "../types";

interface InvoiceItemsModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: ProductSuggestion[];
  onProductsChange: (products: ProductSuggestion[]) => void;
}

export const InvoiceItemsModal = ({
  isOpen,
  onClose,
  products,
  onProductsChange,
}: InvoiceItemsModalProps) => {
  const { t } = useTranslation("invoices");
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const [filterValue, setFilterValue] = useState("");

  const filteredItems = useMemo(() => {
    let items = [...products];
    if (filterValue) {
      items = items.filter((p) =>
        p.nombreDetected.toLowerCase().includes(filterValue.toLowerCase()),
      );
    }
    return items;
  }, [products, filterValue]);

  const pages = Math.ceil(filteredItems.length / rowsPerPage);

  const items = useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;
    return filteredItems.slice(start, end);
  }, [page, filteredItems, rowsPerPage]);

  const handleUpdate = (
    index: number,
    field: keyof ProductSuggestion,
    value: any,
  ) => {
    const itemToUpdate = items[index];
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
    <Modal isOpen={isOpen} onClose={onClose} size="5xl" scrollBehavior="inside">
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">
          {t("modal.title")}
          <span className="text-sm font-normal text-default-500">
            {products.length} {t("modal.items_count")}
          </span>
        </ModalHeader>
        <ModalBody>
          <div className="flex justify-between items-center mb-4">
            <Input
              placeholder={t("modal.search")}
              value={filterValue}
              onValueChange={setFilterValue}
              className="max-w-xs"
              size="sm"
              startContent={<SearchIcon className="text-default-400" />}
            />
          </div>

          <Table
            aria-label="Tabla de productos OCR"
            bottomContent={
              pages > 1 ? (
                <div className="flex w-full justify-center">
                  <Pagination
                    isCompact
                    showControls
                    showShadow
                    color={appColor}
                    page={page}
                    total={pages}
                    onChange={(page) => setPage(page)}
                  />
                </div>
              ) : null
            }
          >
            <TableHeader>
              <TableColumn>{t("modal.columns.product")}</TableColumn>
              <TableColumn>{t("modal.columns.qty")}</TableColumn>
              <TableColumn>{t("modal.columns.unit")}</TableColumn>
              <TableColumn>{t("modal.columns.price")}</TableColumn>
              <TableColumn>{t("modal.columns.total")}</TableColumn>
              <TableColumn>{t("modal.columns.actions")}</TableColumn>
            </TableHeader>
            <TableBody items={items}>
              {(item: ProductSuggestion) => {
                const localIndex = items.indexOf(item);
                return (
                  <TableRow key={localIndex}>
                    <TableCell>
                      <Input
                        size="sm"
                        value={item.nombreDetected}
                        onChange={(e) =>
                          handleUpdate(
                            localIndex,
                            "nombreDetected",
                            e.target.value,
                          )
                        }
                        variant="underlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        size="sm"
                        value={item.cantidad.toString()}
                        onChange={(e) =>
                          handleUpdate(localIndex, "cantidad", e.target.value)
                        }
                        variant="underlined"
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        size="sm"
                        value={item.unidad}
                        onChange={(e) =>
                          handleUpdate(localIndex, "unidad", e.target.value)
                        }
                        variant="underlined"
                        className="w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        size="sm"
                        value={item.precioUnitario.toString()}
                        onChange={(e) =>
                          handleUpdate(
                            localIndex,
                            "precioUnitario",
                            e.target.value,
                          )
                        }
                        variant="underlined"
                        startContent="$"
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold">
                        $
                        {new Intl.NumberFormat("es-CO").format(
                          item.precioTotal,
                        )}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Button
                        isIconOnly
                        size="sm"
                        color="danger"
                        variant="light"
                        onPress={() => handleDelete(item)}
                      >
                        <DeleteIcon />
                      </Button>
                    </TableCell>
                  </TableRow>
                );
              }}
            </TableBody>
          </Table>
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
