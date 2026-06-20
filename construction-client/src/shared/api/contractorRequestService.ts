import { apiClient } from "./apiClient";

export const getAdminContractorRequests = async (status?: string): Promise<any[]> => {
  const query = status && status !== "All" ? `?status=${status}` : "";
  const response = await apiClient.get<{ data: any[] }>(`/api/contractor-requests/admin${query}`);
  return (response as any).data || response;
};

export const getMyContractorRequests = async (): Promise<any[]> => {
  const response = await apiClient.get<{ data: any[] }>(`/api/contractor-requests/my`);
  return (response as any).data || response;
};

export const getContractorRequestById = async (id: string): Promise<any> => {
  const response = await apiClient.get<any>(`/api/contractor-requests/${id}`);
  return (response as any).data || response;
};

export const updateContractorRequestStatus = async (
  id: string,
  status: string
): Promise<any> => {
  const response = await apiClient.patch<any>(
    `/api/contractor-requests/admin/${id}/status`,
    { status }
  );
  return (response as any).data || response;
};
