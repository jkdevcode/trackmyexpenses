import type { InvoiceDetailItem, OcrSource } from "../../types";

import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  useDisclosure,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/table";

import { InvoiceSearchInput } from "../../components/InvoiceSearchInput";
import { OcrSourceBadge } from "../../components/OcrSourceBadge";
import { PaginatedItems } from "../../components/PaginatedItems";
import { useInvoiceFilter } from "../../hooks/useInvoiceFilter";
import { useInvoiceDetailQuery } from "../../hooks/useInvoicesQuery";
import {
  getInvoiceBaseTotal,
  getInvoiceCurrencies,
} from "../../utils/currency";
import { formatCurrency, formatDate } from "../../utils/formatters";
import { getInvoiceItemUnitPrice } from "../../utils/invoice-item";

import { useAppColorVariants } from "@/theme/app-color-variants";
import { useColorTheme } from "@/hooks/use-color-theme";

const ASSETS_URL = import.meta.env.VITE_ASSETS_URL || "";

type InvoiceDetailModalProps = {
  invoiceId: number | null;
  isOpen: boolean;
  onClose: () => void;
};

export const InvoiceDetailModal = ({
  invoiceId,
  isOpen,
  onClose,
}: InvoiceDetailModalProps) => {
  const { t, i18n } = useTranslation("invoices");
  const detailQuery = useInvoiceDetailQuery(invoiceId, isOpen);
  const { appColor } = useColorTheme();
  const appColorVariants = useAppColorVariants();

  const {
    isOpen: isImageOpen,
    onOpen: onImageOpen,
    onClose: onImageClose,
  } = useDisclosure();

  const detail = detailQuery.data;
  const {
    filterValue,
    setFilterValue,
    filteredItems: filteredProductos,
  } = useInvoiceFilter({
    data: detail?.productos ?? [],
    searchFn: (item: InvoiceDetailItem, query) => {
      const productName = item.productoNombre ?? item.producto?.nombre ?? "";

      return (
        productName.toLowerCase().includes(query) ||
        String(item.precioTotal).includes(query)
      );
    },
  });

  useEffect(() => {
    if (!isOpen) {
      setFilterValue("");
    }
  }, [isOpen, setFilterValue]);

  const { currency, baseCurrency, showBase } = getInvoiceCurrencies(
    detail?.moneda,
    detail?.monedaBase,
  );
  const baseTotal = detail
    ? getInvoiceBaseTotal(detail.totalPagar, detail.totalPagarBase)
    : 0;

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("detail.title")}</ModalHeader>
        <ModalBody>
          {detailQuery.isLoading ? (
            <div className="flex justify-center py-10">
              <Spinner color={appColor} />
            </div>
          ) : null}

          {detailQuery.isError ? (
            <p className="text-danger">{t("detail.error")}</p>
          ) : null}

          {!detailQuery.isLoading && !detailQuery.isError && detail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-2 text-sm md:grid-cols-2">
                <p>
                  <span className="font-semibold">{t("detail.codigo")}:</span>{" "}
                  {detail.codigoFactura}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.fecha")}:</span>{" "}
                  {formatDate(detail.fechaHoraCompra, i18n.language)}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.metodo")}:</span>{" "}
                  {t(`list.payment.${detail.metodoPago}`)}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.lugar")}:</span>{" "}
                  {detail.lugarCompra}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.nit")}:</span>{" "}
                  {detail.nitProveedor || "-"}
                </p>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">
                    {t("detail.ocr_source")}:
                  </span>{" "}
                  <OcrSourceBadge source={detail.ocrSource as OcrSource} />
                </div>
                <p>
                  <span className="font-semibold">{t("detail.moneda")}:</span>{" "}
                  {currency}
                </p>
                <p>
                  <span className="font-semibold">
                    {t("detail.monedaBase")}:
                  </span>{" "}
                  {baseCurrency}
                </p>
                {detail.tasaCambio ? (
                  <p>
                    <span className="font-semibold">
                      {t("detail.tasaCambio")}:
                    </span>{" "}
                    {detail.tasaCambio}
                  </p>
                ) : null}
              </div>

              <div className="mt-6 flex items-center justify-between">
                <h3 className="text-md font-semibold">
                  {t("detail.table.title", { defaultValue: "Productos" })}
                </h3>
                <InvoiceSearchInput
                  value={filterValue}
                  onValueChange={setFilterValue}
                />
              </div>
              <PaginatedItems
                items={filteredProductos}
                itemsPerPage={10}
                resetKey={filterValue}
                renderList={(itemsContent, paginationContent) => (
                  <Table
                    removeWrapper
                    aria-label={t("detail.items_aria")}
                    bottomContent={paginationContent}
                  >
                    <TableHeader>
                      <TableColumn>{t("detail.table.producto")}</TableColumn>
                      <TableColumn>{t("detail.table.cantidad")}</TableColumn>
                      <TableColumn>
                        {t("detail.table.precioUnitario")}
                      </TableColumn>
                      <TableColumn>{t("detail.table.descuento")}</TableColumn>
                      <TableColumn>{t("detail.table.precioTotal")}</TableColumn>
                    </TableHeader>
                    <TableBody>{itemsContent as any}</TableBody>
                  </Table>
                )}
                renderItem={(item) => {
                  const key =
                    item.id ??
                    item.productoId ??
                    `${item.productoNombre}-${item.cantidad}-${item.precioTotal}`;
                  const productName =
                    item.productoNombre ?? item.producto?.nombre ?? "-";

                  return (
                    <TableRow key={String(key)}>
                      <TableCell>{productName}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          getInvoiceItemUnitPrice(item),
                          i18n.language,
                          currency,
                        )}
                      </TableCell>
                      <TableCell>{item.descuento ?? 0}%</TableCell>
                      <TableCell>
                        {formatCurrency(
                          item.precioTotal,
                          i18n.language,
                          currency,
                        )}
                      </TableCell>
                    </TableRow>
                  );
                }}
              />
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="justify-between">
          <div className="flex gap-2">
            <Button variant="light" onPress={onClose}>
              {t("detail.close")}
            </Button>
            {detail?.imagenUrl ? (
              <Button color={appColor} variant="flat" onPress={onImageOpen}>
                {t("detail.view_image")}
              </Button>
            ) : null}
          </div>
          {detail ? (
            <div className="flex flex-col items-end">
              <p className={`text-xl font-bold ${appColorVariants.textStrong}`}>
                {t("detail.total")}:{" "}
                {formatCurrency(detail.totalPagar, i18n.language, currency)}
              </p>
              {showBase ? (
                <p className="text-sm text-default-500">
                  {t("detail.total_base")}:{" "}
                  {formatCurrency(baseTotal, i18n.language, baseCurrency)}
                </p>
              ) : null}
            </div>
          ) : null}
        </ModalFooter>
      </ModalContent>
      {detail?.imagenUrl ? (
        <Modal
          backdrop="blur"
          isOpen={isImageOpen}
          size="5xl"
          onClose={onImageClose}
        >
          <ModalContent>
            <ModalHeader>{t("detail.view_image")}</ModalHeader>
            <ModalBody className="flex max-h-[80vh] items-center overflow-auto bg-black/5 p-1">
              <img
                alt="Invoice"
                className="h-auto max-w-full rounded-lg shadow-lg"
                src={`${ASSETS_URL}${detail.imagenUrl}`}
              />
            </ModalBody>
            <ModalFooter>
              <Button onPress={onImageClose}>{t("detail.close")}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      ) : null}
    </Modal>
  );
};
