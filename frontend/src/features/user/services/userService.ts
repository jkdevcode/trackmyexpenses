import axiosClient from "@/lib/axiosClient";

export interface UpdateProfilePayload {
  userId: number;
  names: {
    nombres: string;
    apellidos: string;
    correo: string;
    documento: string;
  };
  currentUser: {
    nombres?: string;
    apellidos?: string;
    correo?: string;
    documento?: string;
  };
  foto?: File | null;
}

export const updateProfileRequest = async (payload: UpdateProfilePayload) => {
  const formData = new FormData();

  if (payload.names.nombres !== payload.currentUser.nombres) {
    formData.append("nombres", payload.names.nombres);
  }
  if (payload.names.apellidos !== payload.currentUser.apellidos) {
    formData.append("apellidos", payload.names.apellidos);
  }
  if (payload.names.correo !== payload.currentUser.correo) {
    formData.append("correo", payload.names.correo);
  }
  if (payload.names.documento !== payload.currentUser.documento) {
    formData.append("documento", payload.names.documento);
  }
  if (payload.foto) {
    formData.append("foto", payload.foto);
  }

  const hasChanges = !formData.entries().next().done;
  if (!hasChanges) return null;

  const response = await axiosClient.patch(`/users/${payload.userId}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return response.data;
};

export const changePasswordRequest = async (values: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) => {
  const response = await axiosClient.patch("/users/change-password", values);
  return response.data;
};
