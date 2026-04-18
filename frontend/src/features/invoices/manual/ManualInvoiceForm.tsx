import { Card, CardBody } from "@heroui/card";
import { Button } from "@heroui/button";
import { useTranslation } from "react-i18next";

import { CreateProductModal } from "../components/CreateProductModal";

import { useManualInvoiceForm } from "./hooks/useManualInvoiceForm";
import { ManualInvoiceHeader } from "./components/ManualInvoiceHeader";
import { ManualInvoiceItemForm } from "./components/ManualInvoiceItemForm";
import { ManualInvoiceItemsTable } from "./components/ManualInvoiceItemsTable";

import { useColorTheme } from "@/hooks/use-color-theme";
import { useAppColorVariants } from "@/theme/app-color-variants";

export const ManualInvoiceForm = () => {
  const { t } = useTranslation(["invoices"]);
  const { appColor } = useColorTheme();
  const appColorVariants = useAppColorVariants();

  const {
    form,
    items,
    formError,
    fieldErrors,
    itemErrors,
    selectedProductId,
    itemCantidad,
    itemUnidad,
    itemDescuento,
    isCreateProductOpen,
    totalCalculado,
    totalBase,
    showConversion,
    baseCurrency,
    productOptions,
    isLoadingProducts,
    isPendingSubmission,
    updateField,
    setMoneda,
    setTasaCambio,
    handleAddItem,
    updateItemField,
    handleRemoveItem,
    handleSubmit,
    handleProductCreated,
    setIsCreateProductOpen,
    setSelectedProductId,
    setItemCantidad,
    setItemUnidad,
    setItemDescuento,
    setInputText,
  } = useManualInvoiceForm();

  return (
    <Card className="max-w-2xl mx-auto">
      <CardBody className="p-6">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <ManualInvoiceHeader
            appColor={appColor}
            fieldErrors={fieldErrors}
            form={form}
            setMoneda={setMoneda}
            setTasaCambio={setTasaCambio}
            showConversion={showConversion}
            updateField={updateField}
          />

          <ManualInvoiceItemForm
            appColor={appColor}
            appColorVariants={appColorVariants}
            fieldErrors={fieldErrors}
            handleAddItem={handleAddItem}
            isLoadingProducts={isLoadingProducts}
            itemCantidad={itemCantidad}
            itemUnidad={itemUnidad}
            itemDescuento={itemDescuento}
            productOptions={productOptions}
            selectedProductId={selectedProductId}
            setInputText={setInputText}
            setIsCreateProductOpen={setIsCreateProductOpen}
            setItemCantidad={setItemCantidad}
            setItemUnidad={setItemUnidad}
            setItemDescuento={setItemDescuento}
            setSelectedProductId={setSelectedProductId}
          />

          <ManualInvoiceItemsTable
            appColor={appColor}
            baseCurrency={baseCurrency}
            fieldErrors={fieldErrors}
            handleRemoveItem={handleRemoveItem}
            itemErrors={itemErrors}
            items={items}
            moneda={form.moneda}
            showConversion={showConversion}
            totalBase={totalBase}
            totalCalculado={totalCalculado}
            updateItemField={updateItemField}
          />

          {formError ? (
            <p className="text-danger text-sm">{formError}</p>
          ) : null}

          <Button
            color={appColor}
            isLoading={isPendingSubmission}
            type="submit"
          >
            {t("manual.submit")}
          </Button>
        </form>
      </CardBody>

      <CreateProductModal
        isOpen={isCreateProductOpen}
        onClose={() => setIsCreateProductOpen(false)}
        onCreated={handleProductCreated}
      />
    </Card>
  );
};
