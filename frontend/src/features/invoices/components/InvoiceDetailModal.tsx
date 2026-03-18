import type { InvoiceDetailItem } from "../types";

import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
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

import { appColor } from "@/theme/theme.config";
import { appColorVariants } from "@/theme/app-color-variants";

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

          {!detailQuery.isLoading &&
          !detailQuery.isError &&
          detailQuery.data ? (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                <p>
                  <span className="font-semibold">{t("detail.codigo")}:</span>{" "}
                  {detailQuery.data.codigoFactura}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.fecha")}:</span>{" "}
                  {formatDate(detailQuery.data.fechaHoraCompra, i18n.language)}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.metodo")}:</span>{" "}
                  {t(`list.payment.${detailQuery.data.metodoPago}`)}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.lugar")}:</span>{" "}
                  {detailQuery.data.lugarCompra}
                </p>
                <p>
                  <span className="font-semibold">{t("detail.nit")}:</span>{" "}
                  {detailQuery.data.nitProveedor || "-"}
                </p>
              </div>

              <Table removeWrapper aria-label={t("detail.items_aria")}>
                <TableHeader>
                  <TableColumn>{t("detail.table.producto")}</TableColumn>
                  <TableColumn>{t("detail.table.cantidad")}</TableColumn>
                  <TableColumn>{t("detail.table.precioUnitario")}</TableColumn>
                  <TableColumn>{t("detail.table.descuento")}</TableColumn>
                  <TableColumn>{t("detail.table.precioTotal")}</TableColumn>
                </TableHeader>
                <TableBody items={detailQuery.data.productos}>
                  {(item: InvoiceDetailItem) => (
                    <TableRow
                      key={`${item.producto.id}-${item.cantidad}-${item.precioTotal}`}
                    >
                      <TableCell>{item.producto.nombre}</TableCell>
                      <TableCell>{item.cantidad}</TableCell>
                      <TableCell>
                        {formatCurrency(
                          getInvoiceItemUnitPrice(item),
                          i18n.language,
                        )}
                      </TableCell>
                      <TableCell>{item.descuento ?? 0}%</TableCell>
                      <TableCell>
                        {formatCurrency(item.precioTotal, i18n.language)}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter className="justify-between">
          <Button variant="light" onPress={onClose}>
            {t("detail.close")}
          </Button>
          {detailQuery.data ? (
            <p className={`text-xl font-bold ${appColorVariants.textStrong}`}>
              {t("detail.total")}:{" "}
              {formatCurrency(detailQuery.data.totalPagar, i18n.language)}
            </p>
          ) : null}
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
