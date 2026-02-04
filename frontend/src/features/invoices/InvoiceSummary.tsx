import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";
import { appColor } from "@/theme/theme.config";

interface InvoiceSummaryProps {
    totalItems: number;
    totalAmount: number;
    onViewProducts: () => void;
}

export const InvoiceSummary = ({ totalItems, totalAmount, onViewProducts }: InvoiceSummaryProps) => {
    const { t } = useTranslation("invoices");

    return (
        <Card className="bg-default-50 border border-default-200">
            <CardBody className="flex flex-row justify-between items-center p-4">
                <div className="flex flex-col">
                    <span className="text-default-500 text-sm">{t("summary.products_detected")}</span>
                    <span className="text-xl font-bold">{totalItems} <span className="text-xs font-normal text-default-400">{t("form.items")}</span></span>
                </div>

                <div className="flex items-center gap-4">
                    <div className="flex flex-col items-end mr-4">
                        <span className="text-default-500 text-sm">{t("summary.calculated_total")}</span>
                        <span className={`text-xl font-bold text-${appColor}-600`}>
                            ${new Intl.NumberFormat('es-CO').format(totalAmount)}
                        </span>
                    </div>

                    <Button color={appColor} variant="flat" onPress={onViewProducts}>
                        {t("summary.view_details")}
                    </Button>
                </div>
            </CardBody>
        </Card>
    );
};
