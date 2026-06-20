import { apiClient } from "./apiClient";

export const getProjectUpdates = async (contractorRequestId: string): Promise<any[]> => {
  const response = await apiClient.get<{ data: any[] }>(`/api/project-updates/${contractorRequestId}`);
  return (response as any).data || response;
};

export const createProjectUpdate = async (
  contractorRequestId: string,
  formData: FormData
): Promise<any> => {
  const response = await apiClient.post<any>(
    `/api/project-updates/${contractorRequestId}`,
    formData
  );
  return (response as any).data || response;
};

export const addProjectReply = async (
  updateId: string,
  message: string,
  parentReplyId?: string
): Promise<any> => {
  const response = await apiClient.post<any>(`/api/project-updates/reply/${updateId}`, {
    message,
    parentReplyId,
  });
  return (response as any).data || response;
};

export const deleteProjectUpdate = async (updateId: string): Promise<void> => {
  await apiClient.delete<void>(`/api/project-updates/${updateId}`);
};
