import { useMutation } from "@tanstack/react-query";
import axiosClient from "@/lib/axiosClient";

interface LoginPayload {
  documento: string;
  contrasena: string;
}

interface RegisterPayload {
  tipo_documento: string;
  documento_identidad: string;
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  foto?: File | null;
}

export const useLoginMutation = () =>
  useMutation({
    mutationFn: async (payload: LoginPayload) => {
      const response = await axiosClient.post("auth/login", payload);
      return response.data;
    },
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: async (payload: RegisterPayload) => {
      const formData = new FormData();
      formData.append("tipoDocumento", payload.tipo_documento);
      formData.append("documento", payload.documento_identidad);
      formData.append("nombres", payload.nombre);
      formData.append("apellidos", payload.apellido);
      formData.append("correo", payload.email);
      formData.append("contrasena", payload.password);

      if (payload.foto) {
        formData.append("foto", payload.foto);
      }

      const response = await axiosClient.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return response.data;
    },
  });
