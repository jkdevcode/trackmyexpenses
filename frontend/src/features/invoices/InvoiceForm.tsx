import { useState, useMemo } from "react";
import { Input /* Textarea */ } from "@heroui/input";
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

interface InvoiceFormProps {
    initialData: ParsedInvoice;
    onSave: (data: any, products: ProductSuggestion[]) => void;
    onCancel: () => void;
    saving: boolean;
}

export const InvoiceForm = ({ initialData, onSave, onCancel, saving }: InvoiceFormProps) => {
    const { t } = useTranslation("invoices");
    const { isOpen, onOpen, onClose } = useDisclosure();

    // Form State
    const [lugarCompra, setLugarCompra] = useState(initialData.empresa?.nombre || "");
    const [nitProveedor, setNitProveedor] = useState(initialData.empresa?.nit || "");
    const [fecha, setFecha] = useState(initialData.fecha || new Date().toISOString().split('T')[0]);
    const [metodoPago, setMetodoPago] = useState("EFECTIVO");

    // Products State (Source of Truth for Totals)
    const [products, setProducts] = useState<ProductSuggestion[]>(initialData.productos || []);

    // Calculated Total
    const totalPagar = useMemo(() => {
        return products.reduce((acc, curr) => acc + (curr.precioTotal || 0), 0);
    }, [products]);

    const handleSubmit = () => {
        const formData = {
            lugarCompra,
            nitProveedor,
            fechaHoraCompra: new Date(fecha).toISOString(), // Ensure ISO format
            metodoPago,
            totalPagar // Read-only value passed for confirmation
        };
        onSave(formData, products);
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <Card>
                <CardHeader className="flex flex-col items-start gap-1 pb-0">
                    <h2 className="text-xl font-bold">{t("form.title")}</h2>
                    <p className="text-sm text-default-500">{t("form.subtitle")}</p>
                </CardHeader>
                <CardBody className="gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={t("form.provider")}
                            value={lugarCompra}
                            onValueChange={setLugarCompra}
                            variant="bordered"
                            isRequired
                        />
                        <Input
                            label={t("form.nit")}
                            value={nitProveedor}
                            onValueChange={setNitProveedor}
                            variant="bordered"
                        />
                        <DatePicker
                            label={t("form.date")}
                            value={fecha ? parseDate(fecha) : today(getLocalTimeZone())}
                            onChange={(date: any) => setFecha(date ? date.toString() : "")}
                            variant="bordered"
                            isRequired
                            maxValue={today(getLocalTimeZone())}
                        />
                        <Select
                            label={t("form.payment_method")}
                            selectedKeys={[metodoPago]}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            variant="bordered"
                            isRequired
                        >
                            <SelectItem key="EFECTIVO">{t("common.cash", "Efectivo")}</SelectItem>
                            <SelectItem key="TARJETA_CREDITO">{t("common.credit_card", "Tarjeta Crédito")}</SelectItem>
                            <SelectItem key="TARJETA_DEBITO">{t("common.debit_card", "Tarjeta Débito")}</SelectItem>
                            <SelectItem key="TRANSFERENCIA">{t("common.transfer", "Transferencia")}</SelectItem>
                            <SelectItem key="OTRO">{t("common.other", "Otro")}</SelectItem>
                        </Select>
                    </div>

                    <div className="border-t border-default-200 pt-4 mt-2">
                        <Input
                            label={t("form.total")}
                            value={`$ ${new Intl.NumberFormat('es-CO').format(totalPagar)}`}
                            readOnly
                            description={t("form.total_desc")}
                            className="font-bold text-lg"
                            color={appColor}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Products Section */}
            <div>
                <h3 className="text-lg font-semibold mb-2 ml-1">{t("form.products_title")}</h3>

                {products.length > 10 ? (
                    <InvoiceSummary
                        totalItems={products.length}
                        totalAmount={totalPagar}
                        onViewProducts={onOpen}
                    />
                ) : (
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">{products.length} {t("form.items")}</span>
                            <Button size="sm" variant="flat" onPress={onOpen}>
                                {t("form.edit")}
                            </Button>
                        </div>
                        <ul className="space-y-2">
                            {products.map((p, idx) => (
                                <li key={idx} className="flex justify-between text-sm border-b border-default-100 pb-1">
                                    <span>{p.cantidad} x {p.nombreDetected}</span>
                                    <span>${new Intl.NumberFormat('es-CO').format(p.precioTotal)}</span>
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
                <Button color={appColor} onPress={handleSubmit} isLoading={saving}>
                    {t("form.save")}
                </Button>
            </div>

            <InvoiceItemsModal
                isOpen={isOpen}
                onClose={onClose}
                products={products}
                onProductsChange={setProducts}
            />
        </div>
    );
};
