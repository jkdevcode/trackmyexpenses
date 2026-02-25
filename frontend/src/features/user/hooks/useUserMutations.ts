import { useMutation } from "@tanstack/react-query";

import {
  changePasswordRequest,
  updateProfileRequest,
  type UpdateProfilePayload,
} from "../services/userService";

export const useUpdateProfileMutation = () =>
  useMutation({
    mutationFn: (payload: UpdateProfilePayload) =>
      updateProfileRequest(payload),
  });

export const useChangePasswordMutation = () =>
  useMutation({
    mutationFn: (values: {
      currentPassword: string;
      newPassword: string;
      confirmPassword: string;
    }) => changePasswordRequest(values),
  });
