import { apiClient } from "./apiClient";

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

type MapRequestRecord = Record<string, unknown>;

const isBlobLike = (value: unknown): value is Blob => value instanceof Blob;

export const createMapRequest = async (data: Record<string, unknown>, files: File[]) => {
  const formData = new FormData();

  // Append all text fields
  Object.keys(data).forEach((key) => {
    const value = data[key];
    if (value !== undefined && value !== null) {
      if (isBlobLike(value)) {
        formData.append(key, value);
      } else {
        formData.append(key, String(value));
      }
    }
  });

  // Append files
  files.forEach((file) => {
    formData.append("uploads", file);
  });

  const response = await apiClient.post<ApiResponse<MapRequestRecord>>("/api/map-requests", formData);
  return response.data;
};

export const getMyMapRequests = async <T = MapRequestRecord[]>() => {
  const response = await apiClient.get<ApiResponse<T>>("/api/map-requests/my");
  return response.data;
};

export const getAllMapRequests = async <T = MapRequestRecord[]>() => {
  const response = await apiClient.get<ApiResponse<T>>("/api/map-requests");
  return response.data;
};

export const updateMapRequestStatus = async (id: string, status: string) => {
  const response = await apiClient.patch<ApiResponse<MapRequestRecord>>(
    `/api/map-requests/${id}/status`,
    { status }
  );
  return response.data;
};
