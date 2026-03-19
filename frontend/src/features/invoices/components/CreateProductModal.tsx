import type { ProductCatalogItem } from "../types";

import { useState } from "react";
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { addToast } from "@heroui/toast";
import { useTranslation } from "react-i18next";

import { useCreateProductMutation } from "../hooks/useInvoiceMutations";

import { appColor } from "@/theme/theme.config";

interface CreateProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: (product: ProductCatalogItem) => void;
}

type CreateProductFormState = {
  codigo: string;
  nombre: string;
  precioUnitario: string;
};

const initialState: CreateProductFormState = {
  codigo: "",
  nombre: "",
  precioUnitario: "",
};

export const CreateProductModal = ({
  isOpen,
  onClose,
  onCreated,
}: CreateProductModalProps) => {
  const { t } = useTranslation(["invoices", "validation"]);
  const createProductMutation = useCreateProductMutation();
  const [form, setForm] = useState<CreateProductFormState>(initialState);
  const [error, setError] = useState<string>("");

  const updateField = <K extends keyof CreateProductFormState>(
    key: K,
    value: CreateProductFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setError("");

    const codigo = form.codigo.trim();
    const nombre = form.nombre.trim();
    const precioUnitario = Number(form.precioUnitario);

    if (!codigo || !nombre) {
      const message = t("manual.create_product.validation_required");

      setError(message);
      return;
    }

    if (!Number.isFinite(precioUnitario) || precioUnitario <= 0) {
      const message = t("manual.create_product.validation_price");

      setError(message);
      return;
    }

    try {
      const product = await createProductMutation.mutateAsync({
        codigo,
        nombre,
        precioUnitario,
      });

      addToast({
        title: t("toast.success"),
        description: t("manual.create_product.success"),
        color: "success",
      });

      onCreated(product);
      setForm(initialState);
    } catch (err) {
      void err;
      const message = t("manual.create_product.error");

      setError(message);
      addToast({
        title: t("toast.error"),
        description: message,
        color: "danger",
      });
    }
  };

  const handleClose = () => {
    setForm(initialState);
    setError("");
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose}>
      <ModalContent>
        <ModalHeader>{t("manual.create_product.title")}</ModalHeader>
        <ModalBody className="space-y-3">
          <Input
            color={appColor}
            label={t("manual.create_product.codigo")}
            value={form.codigo}
            variant="bordered"
            onValueChange={(value) => updateField("codigo", value)}
          />
          <Input
            color={appColor}
            label={t("manual.create_product.nombre")}
            value={form.nombre}
            variant="bordered"
            onValueChange={(value) => updateField("nombre", value)}
          />
          <Input
            color={appColor}
            label={t("manual.create_product.precio")}
            min={0.01}
            step="0.01"
            type="number"
            value={form.precioUnitario}
            variant="bordered"
            onValueChange={(value) => updateField("precioUnitario", value)}
          />

          {error ? <p className="text-danger text-sm">{error}</p> : null}
        </ModalBody>
        <ModalFooter>
          <Button variant="light" onPress={handleClose}>
            {t("manual.create_product.cancel")}
          </Button>
          <Button
            color={appColor}
            isLoading={createProductMutation.isPending}
            onPress={handleSubmit}
          >
            {t("manual.create_product.submit")}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};
