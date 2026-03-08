import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/toast";
import { isAxiosError } from "axios";

import { useChangePasswordMutation } from "../hooks/useUserMutations";

import { appColor } from "@/theme/theme.config";
import { getChangePasswordSchema } from "@/schemas/profile";
import { getErrorMessage } from "@/utils/errors";

interface ChangePasswordValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

const ChangePasswordCard = () => {
  const { t } = useTranslation(["profile", "auth", "validation"]);
  const changePasswordMutation = useChangePasswordMutation();

  const {
    handleSubmit,
    register,
    reset,
    formState: { errors, touchedFields, isValid, isDirty },
  } = useForm<ChangePasswordValues>({
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    resolver: yupResolver(getChangePasswordSchema(t)),
    mode: "onTouched",
  });

  const onSubmit = async (values: ChangePasswordValues) => {
    try {
      await changePasswordMutation.mutateAsync(values);

      addToast({
        title: t("profile:security.success"),
        color: "success",
        timeout: 3000,
      });
      reset();
    } catch (error: unknown) {
      // If it's a specific 401 from backend "incorrect password", show specific message if possible,
      // or just use generic error. The backend throws Unauthorized for bad current pass.
      const isUnauthorized =
        isAxiosError(error) && error.response?.status === 401;

      addToast({
        title: t("profile:security.error"),
        description: isUnauthorized
          ? t("auth:errors.invalid_credentials")
          : getErrorMessage(error, t),
        color: "danger",
        timeout: 5000,
      });
    }
  };

  return (
    <Card className="max-w-4xl w-full shadow-lg rounded-2xl p-6">
      <CardHeader className="flex flex-col items-start pb-0 pt-4">
        <h2 className="text-xl font-bold">{t("profile:security.title")}</h2>
      </CardHeader>
      <CardBody className="mt-4">
        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-6">
            <Input
              color={appColor}
              errorMessage={errors.currentPassword?.message}
              isInvalid={
                !!touchedFields.currentPassword && !!errors.currentPassword
              }
              label={t("profile:security.current_password")}
              type="password"
              variant="bordered"
              {...register("currentPassword")}
            />
            <Input
              color={appColor}
              errorMessage={errors.newPassword?.message}
              isInvalid={!!touchedFields.newPassword && !!errors.newPassword}
              label={t("profile:security.new_password")}
              type="password"
              variant="bordered"
              {...register("newPassword")}
            />
            <Input
              color={appColor}
              errorMessage={errors.confirmPassword?.message}
              isInvalid={
                !!touchedFields.confirmPassword && !!errors.confirmPassword
              }
              label={t("profile:security.confirm_password")}
              type="password"
              variant="bordered"
              {...register("confirmPassword")}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              className="font-semibold shadow-md w-full sm:w-auto"
              color={appColor}
              isDisabled={!isValid || !isDirty}
              isLoading={changePasswordMutation.isPending}
              type="submit"
              variant="solid"
            >
              {t("profile:security.update_password")}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default ChangePasswordCard;
