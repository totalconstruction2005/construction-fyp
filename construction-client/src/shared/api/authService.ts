import { apiClient } from "@shared/api/apiClient";
import { ApiError } from "@shared/utils/errorHandler";

export type AuthUser = {
  id: string;
  email: string;
  name?: string;
  role?: "admin" | "client";
};

type AuthResponse = {
  data?: unknown;
  user?: unknown;
  token?: string;
  message?: string;
};

const AUTH_BASE_PATH = "/api/user";

const normalizeUser = (payload: unknown): AuthUser => {
  if (!payload || typeof payload !== "object") {
    throw new ApiError("Invalid user response", 500, payload);
  }

  const raw = payload as Record<string, unknown>;
  const idValue = (raw.id as string | undefined) || (raw._id as string | undefined) || "";
  const emailValue = (raw.email as string | undefined) || "";

  if (!idValue || !emailValue) {
    throw new ApiError("Invalid user data", 500, payload);
  }

  return {
    id: idValue,
    email: emailValue,
    name: raw.name as string | undefined,
    role: raw.role as "admin" | "client" | undefined,
  };
};

const parseAuthResponse = (payload: AuthResponse): { user: AuthUser; token?: string } => {
  const userPayload = payload.data ?? payload.user ?? payload;
  return {
    user: normalizeUser(userPayload),
    token: payload.token,
  };
};

export const authService = {
  async login(email: string, password: string) {
    const payload = await apiClient.post<AuthResponse>(`${AUTH_BASE_PATH}/login`, {
      email,
      password,
    });

    return parseAuthResponse(payload);
  },

  async signup(name: string, email: string, password: string) {
    const payload = await apiClient.post<AuthResponse>(`${AUTH_BASE_PATH}/signup`, {
      name,
      email,
      password,
    });

    return parseAuthResponse(payload);
  },

  async forgotPassword(email: string) {
    return apiClient.post<{ success: boolean; message: string }>("/api/auth/forgot-password", {
      email,
    });
  },

  async verifyResetCode(email: string, code: string) {
    return apiClient.post<{ success: boolean; message: string }>("/api/auth/verify-reset-code", {
      email,
      code,
    });
  },

  async resetPassword(email: string, code: string, newPassword: string, confirmPassword: string) {
    return apiClient.post<{ success: boolean; message: string }>("/api/auth/reset-password", {
      email,
      code,
      newPassword,
      confirmPassword,
    });
  },

  async changePassword(currentPassword: string, newPassword: string, confirmPassword: string) {
    return apiClient.patch<{ success: boolean; message: string }>("/api/auth/change-password", {
      currentPassword,
      newPassword,
      confirmPassword,
    });
  },
};
