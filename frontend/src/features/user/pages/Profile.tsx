import { useState, useRef } from "react";
import { useFormik } from "formik";
import { useTranslation } from "react-i18next";
import { Button } from "@heroui/button";
import { Input } from "@heroui/input";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { addToast } from "@heroui/toast";

import axiosClient from "@/lib/axiosClient";
import { useSession } from "@/contexts/session-context";
import { getErrorMessage } from "@/utils/errors";
import { appColor } from "@/theme/theme.config";
import { getProfileSchema } from "@/schemas/profile";
import { CameraIcon } from "@/features/auth/pages/Register";

const ProfilePage = () => {
    const { t } = useTranslation(["profile", "auth", "validation"]);
    const { user, login, token } = useSession();

    const ASSETS_URL = import.meta.env.VITE_ASSETS_URL;

    // Image handling
    const [foto, setFoto] = useState<File | null>(null);
    const [fotoPreview, setFotoPreview] = useState<string>(user?.foto ? `${ASSETS_URL}${user.foto}` : "");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setFoto(file);
            setFotoPreview(URL.createObjectURL(file));
        }
    };

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const formik = useFormik({
        initialValues: {
            nombres: user?.nombres || "",
            apellidos: user?.apellidos || "",
            correo: user?.correo || "",
            documento: user?.documento || "",
        },
        enableReinitialize: true,
        validationSchema: getProfileSchema(t),
        onSubmit: async (values) => {
            try {
                const formData = new FormData();

                // Only append changed fields (Partial update)
                if (values.nombres !== user?.nombres) formData.append("nombres", values.nombres);
                if (values.apellidos !== user?.apellidos) formData.append("apellidos", values.apellidos);
                if (values.correo !== user?.correo) formData.append("correo", values.correo);
                if (values.documento !== user?.documento) formData.append("documento", values.documento);

                if (foto) {
                    formData.append("foto", foto);
                }

                // Si no hay cambios, no enviar nada o solo el avatar si cambió
                const hasChanges = formData.entries().next().done === false;

                if (!hasChanges) {
                    addToast({
                        title: t("profile:success"),
                        color: appColor as any,
                        timeout: 3000,
                    });
                    return;
                }

                const response = await axiosClient.patch(`/users/${user?.id}`, formData, {
                    headers: { "Content-Type": "multipart/form-data" }
                });

                if (response.status === 200) {
                    addToast({
                        title: t("profile:success"),
                        color: appColor as any,
                        timeout: 3000,
                    });

                    // Update session context with new user data
                    if (token) {
                        login(token, response.data.user);
                    }
                }

            } catch (error: any) {
                addToast({
                    title: t("profile:error"),
                    description: error.response?.status === 409 ? t("auth:errors.user_exists") : getErrorMessage(error, t),
                    color: "danger",
                    timeout: 5000,
                });
            }
        },
    });

    const handleReset = () => {
        formik.resetForm();
        setFoto(null);
        setFotoPreview(user?.foto ? `${ASSETS_URL}${user.foto}` : "");
    };

    return (
        <div className="flex justify-center items-start p-4 bg-background min-h-full">
            <Card className="max-w-4xl w-full shadow-lg rounded-2xl p-6">
                <CardHeader className="flex flex-col items-center pb-0 pt-4">
                    <div className="relative group cursor-pointer" onClick={handleAvatarClick}>
                        <Avatar
                            className="w-32 h-32 text-large transition-transform group-hover:scale-105"
                            src={fotoPreview || "https://images.unsplash.com/broken"}
                            showFallback
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                            <CameraIcon className="w-8 h-8 text-white" />
                        </div>
                        <input
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            className="hidden"
                            onChange={handleImageChange}
                        />
                    </div>
                    <p className="text-primary text-sm mt-3 font-medium transition-opacity opacity-70 hover:opacity-100">
                        {t("profile:avatar.change")}
                    </p>
                    <h1 className="text-2xl font-bold mt-4">{t("profile:title")}</h1>
                </CardHeader>

                <CardBody className="mt-8">
                    <form className="space-y-8" onSubmit={formik.handleSubmit}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nombres */}
                            <Input
                                errorMessage={formik.errors.nombres}
                                isInvalid={formik.touched.nombres && !!formik.errors.nombres}
                                label={t("auth:fields.name.label")}
                                name="nombres"
                                placeholder={t("auth:fields.name.placeholder")}
                                value={formik.values.nombres}
                                variant="bordered"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                color={appColor}
                            />
                            {/* Apellidos */}
                            <Input
                                errorMessage={formik.errors.apellidos}
                                isInvalid={formik.touched.apellidos && !!formik.errors.apellidos}
                                label={t("auth:fields.lastname.label")}
                                name="apellidos"
                                placeholder={t("auth:fields.lastname.placeholder")}
                                value={formik.values.apellidos}
                                variant="bordered"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                color={appColor}
                            />

                            {/* Email */}
                            <Input
                                errorMessage={formik.errors.correo}
                                isInvalid={formik.touched.correo && !!formik.errors.correo}
                                label={t("auth:fields.email.label")}
                                name="correo"
                                type="email"
                                placeholder={t("auth:fields.email.placeholder")}
                                value={formik.values.correo}
                                variant="bordered"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                color={appColor}
                            />

                            {/* Documento ID */}
                            <Input
                                errorMessage={formik.errors.documento}
                                isInvalid={formik.touched.documento && !!formik.errors.documento}
                                label={t("auth:fields.document_id.label")}
                                name="documento"
                                placeholder={t("auth:fields.document_id.placeholder")}
                                value={formik.values.documento}
                                variant="bordered"
                                onBlur={formik.handleBlur}
                                onChange={formik.handleChange}
                                color={appColor}
                            />
                        </div>

                        <div className="flex flex-col sm:flex-row gap-4 pt-4">
                            <Button
                                className="w-full font-semibold shadow-lg"
                                color={appColor}
                                isLoading={formik.isSubmitting}
                                type="submit"
                                variant="solid"
                                disabled={!formik.dirty && !foto}
                            >
                                {t("profile:save")}
                            </Button>
                            <Button
                                className="w-full font-semibold shadow-lg"
                                color="default"
                                variant="flat"
                                onClick={handleReset}
                            >
                                {t("profile:reset")}
                            </Button>
                        </div>
                    </form>
                </CardBody>
            </Card>
        </div>
    );
};

export default ProfilePage;
