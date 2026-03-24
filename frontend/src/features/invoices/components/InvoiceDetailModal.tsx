import type { InvoiceDetailItem, OcrSource } from "../types";

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
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";

import { useInvoiceDetailQuery } from "../hooks/useInvoicesQuery";
import { formatCurrency, formatDate } from "../utils/formatters";
import { getInvoiceItemUnitPrice } from "../utils/invoice-item";

import { OcrSourceBadge } from "./OcrSourceBadge";

import { useAppColorVariants } from "@/theme/app-color-variants";
import { DEFAULT_CURRENCY, normalizeCurrencyCode } from "@/constants/currency";
import { useColorTheme } from "@/hooks/use-color-theme";

const resolveCurrency = (value?: string | null) =>
  normalizeCurrencyCode(value, DEFAULT_CURRENCY);

const API_BASE_URL = import.meta.env.VITE_API_URL || "";

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
  const currency = resolveCurrency(detail?.moneda ?? detail?.monedaBase);
  const baseCurrency = resolveCurrency(detail?.monedaBase ?? currency);
  const showBase = currency !== baseCurrency;
  const baseTotal =
    detail?.totalPagarBase !== null && detail?.totalPagarBase !== undefined
      ? detail?.totalPagarBase
      : detail?.totalPagar;

  return (
    <Modal isOpen={isOpen} scrollBehavior="inside" size="4xl" onClose={onClose}>
      <ModalContent>
        <ModalHeader>{t("detail.title")}</ModalHeader>
        <ModalBody>
          {detailQuery.isLoading ? (
            <div className="py-10 flex justify-center">
              <Spinner color={appColor} />
            </div>
          ) : null}

          {detailQuery.isError ? (
            <p className="text-danger">{t("detail.error")}</p>
          ) : null}

          {!detailQuery.isLoading && !detailQuery.isError && detail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
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

              <Table removeWrapper aria-label={t("detail.items_aria")}>
                <TableHeader>
                  <TableColumn>{t("detail.table.producto")}</TableColumn>
                  <TableColumn>{t("detail.table.cantidad")}</TableColumn>
                  <TableColumn>{t("detail.table.precioUnitario")}</TableColumn>
                  <TableColumn>{t("detail.table.descuento")}</TableColumn>
                  <TableColumn>{t("detail.table.precioTotal")}</TableColumn>
                </TableHeader>
                <TableBody items={detail.productos}>
                  {(item: InvoiceDetailItem) => {
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
                </TableBody>
              </Table>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="justify-between">
          <div className="flex gap-2">
            <Button variant="light" onPress={onClose}>
              {t("detail.close")}
            </Button>
            {detail?.imagenUrl && (
              <Button color={appColor} variant="flat" onPress={onImageOpen}>
                {t("detail.view_image")}
              </Button>
            )}
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
                  {formatCurrency(baseTotal ?? 0, i18n.language, baseCurrency)}
                </p>
              ) : null}
            </div>
          ) : null}
        </ModalFooter>
      </ModalContent>
      {detail?.imagenUrl && (
        <Modal
          backdrop="blur"
          isOpen={isImageOpen}
          size="5xl"
          onClose={onImageClose}
        >
          <ModalContent>
            <ModalHeader>{t("detail.view_image")}</ModalHeader>
            <ModalBody className="p-1 overflow-auto max-h-[80vh] flex justify-center items-center bg-black/5">
              <img
                alt="Invoice"
                className="max-w-full h-auto rounded-lg shadow-lg"
                src={`${API_BASE_URL}${detail.imagenUrl}`}
              />
            </ModalBody>
            <ModalFooter>
              <Button onPress={onImageClose}>{t("detail.close")}</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      )}
    </Modal>
  );
};
