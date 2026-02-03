import { useState, useMemo } from "react";
import { Input /* Textarea */ } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { useDisclosure } from "@heroui/modal";
import { Select, SelectItem } from "@heroui/select";
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
                    <h2 className="text-xl font-bold">{t("form.title", "Revisión de Factura")}</h2>
                    <p className="text-sm text-default-500">{t("form.subtitle", "Verifica los datos extraídos antes de guardar.")}</p>
                </CardHeader>
                <CardBody className="gap-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input
                            label={t("form.provider", "Lugar de Compra")}
                            value={lugarCompra}
                            onValueChange={setLugarCompra}
                            variant="bordered"
                        />
                        <Input
                            label={t("form.nit", "NIT Proveedor")}
                            value={nitProveedor}
                            onValueChange={setNitProveedor}
                            variant="bordered"
                        />
                        <Input
                            type="date"
                            label={t("form.date", "Fecha")}
                            value={fecha}
                            onValueChange={setFecha}
                            variant="bordered"
                        />
                        <Select
                            label={t("form.payment_method", "Método de Pago")}
                            selectedKeys={[metodoPago]}
                            onChange={(e) => setMetodoPago(e.target.value)}
                            variant="bordered"
                        >
                            <SelectItem key="EFECTIVO">Efectivo</SelectItem>
                            <SelectItem key="TARJETA_CREDITO">Tarjeta Crédito</SelectItem>
                            <SelectItem key="TARJETA_DEBITO">Tarjeta Débito</SelectItem>
                            <SelectItem key="TRANSFERENCIA">Transferencia</SelectItem>
                            <SelectItem key="OTRO">Otro</SelectItem>
                        </Select>
                    </div>

                    <div className="border-t border-default-200 pt-4 mt-2">
                        <Input
                            label={t("form.total", "Total a Pagar (Auto-calculado)")}
                            value={`$ ${new Intl.NumberFormat('es-CO').format(totalPagar)}`}
                            readOnly
                            description={t("form.total_desc", "Calculado basándose en la lista de productos.")}
                            className="font-bold text-lg"
                            color={appColor}
                        />
                    </div>
                </CardBody>
            </Card>

            {/* Products Section */}
            <div>
                <h3 className="text-lg font-semibold mb-2 ml-1">{t("form.products_title", "Detalle de Productos")}</h3>

                {products.length > 10 ? (
                    <InvoiceSummary
                        totalItems={products.length}
                        totalAmount={totalPagar}
                        onViewProducts={onOpen}
                    />
                ) : (
                    <Card className="p-4">
                        <div className="flex justify-between items-center mb-4">
                            <span className="font-semibold">{products.length} {t("form.items", "Items")}</span>
                            <Button size="sm" variant="flat" onPress={onOpen}>
                                {t("form.edit", "Ampliar / Editar")}
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
                    {t("form.cancel", "Cancelar")}
                </Button>
                <Button color={appColor} onPress={handleSubmit} isLoading={saving}>
                    {t("form.save", "Guardar Factura")}
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
