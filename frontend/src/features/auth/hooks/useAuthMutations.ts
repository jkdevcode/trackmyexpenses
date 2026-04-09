import { useMutation } from "@tanstack/react-query";

import {
  forgotPasswordRequest,
  loginRequest,
  resetPasswordRequest,
  registerRequest,
  type ForgotPasswordPayload,
  type LoginPayload,
  type ResetPasswordPayload,
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

export const useForgotPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      forgotPasswordRequest(payload),
  });

export const useResetPasswordMutation = () =>
  useMutation({
    mutationFn: (payload: ResetPasswordPayload) =>
      resetPasswordRequest(payload),
  });
