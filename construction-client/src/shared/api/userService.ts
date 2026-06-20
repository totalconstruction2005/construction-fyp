import { apiClient } from "./apiClient";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type UserSummary = {
  _id?: string;
  name?: string;
  email?: string;
  createdAt?: string;
};

export const getUserById = async (id: string) => {
  const response = await apiClient.get<ApiResponse<UserSummary>>(`/api/user/${id}`);
  return response.data;
};
