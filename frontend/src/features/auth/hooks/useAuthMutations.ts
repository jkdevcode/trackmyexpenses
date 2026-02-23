import { useMutation } from "@tanstack/react-query";

import {
  loginRequest,
  registerRequest,
  type LoginPayload,
  type RegisterPayload,
} from "../services/authService";

export const useLoginMutation = () =>
  useMutation({
    mutationFn: (payload: LoginPayload) => loginRequest(payload),
  });

export const useRegisterMutation = () =>
  useMutation({
    mutationFn: (payload: RegisterPayload) => registerRequest(payload),
  });
