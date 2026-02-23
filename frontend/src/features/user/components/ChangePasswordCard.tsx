import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { addToast } from "@heroui/toast";

import { useChangePasswordMutation } from "../hooks/useUserMutations";

import { appColor } from "@/theme/theme.config";
import { getChangePasswordSchema } from "@/schemas/profile";
import { getErrorMessage } from "@/utils/errors";

const ChangePasswordCard = () => {
  const { t } = useTranslation(["profile", "auth", "validation"]);
  const changePasswordMutation = useChangePasswordMutation();

  const formik = useFormik({
    initialValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
    validationSchema: getChangePasswordSchema(t),
    onSubmit: async (values, { resetForm }) => {
      try {
        await changePasswordMutation.mutateAsync(values);

        addToast({
          title: t("profile:security.success"),
          color: "success",
          timeout: 3000,
        });
        resetForm();
      } catch (error: any) {
        // If it's a specific 401 from backend "incorrect password", show specific message if possible,
        // or just use generic error. The backend throws Unauthorized for bad current pass.
        const isUnauthorized = error.response?.status === 401;

        addToast({
          title: t("profile:security.error"),
          description: isUnauthorized
            ? t("auth:errors.invalid_credentials")
            : getErrorMessage(error, t),
          color: "danger",
          timeout: 5000,
        });
      }
    },
  });

  return (
    <Card className="max-w-4xl w-full shadow-lg rounded-2xl p-6">
      <CardHeader className="flex flex-col items-start pb-0 pt-4">
        <h2 className="text-xl font-bold">{t("profile:security.title")}</h2>
      </CardHeader>
      <CardBody className="mt-4">
        <form className="space-y-6" onSubmit={formik.handleSubmit}>
          <div className="grid grid-cols-1 gap-6">
            <Input
              color={appColor}
              errorMessage={formik.errors.currentPassword}
              isInvalid={
                formik.touched.currentPassword &&
                !!formik.errors.currentPassword
              }
              label={t("profile:security.current_password")}
              name="currentPassword"
              type="password"
              value={formik.values.currentPassword}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <Input
              color={appColor}
              errorMessage={formik.errors.newPassword}
              isInvalid={
                formik.touched.newPassword && !!formik.errors.newPassword
              }
              label={t("profile:security.new_password")}
              name="newPassword"
              type="password"
              value={formik.values.newPassword}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
            <Input
              color={appColor}
              errorMessage={formik.errors.confirmPassword}
              isInvalid={
                formik.touched.confirmPassword &&
                !!formik.errors.confirmPassword
              }
              label={t("profile:security.confirm_password")}
              name="confirmPassword"
              type="password"
              value={formik.values.confirmPassword}
              variant="bordered"
              onBlur={formik.handleBlur}
              onChange={formik.handleChange}
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button
              className="font-semibold shadow-md w-full sm:w-auto"
              color={appColor}
              isDisabled={!formik.isValid || !formik.dirty}
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
