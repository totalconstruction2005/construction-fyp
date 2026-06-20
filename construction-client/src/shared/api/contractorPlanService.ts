import { apiClient } from "./apiClient";

export type ContractorPlanInput = {
  title: string;
  price: number;
  currency: string;
  tagline: string;
  features: string[];
  isActive: boolean;
};

export const getContractorPlans = async (): Promise<any[]> => {
  const res = await apiClient.get<{ data: any[] }>("/api/contractor-plans");
  return (res as any).data || res || [];
};

export const createContractorPlan = async (planData: ContractorPlanInput): Promise<any> => {
  const res = await apiClient.post<any>("/api/contractor-plans", planData);
  return (res as any).data || res;
};

export const updateContractorPlan = async (id: string, planData: ContractorPlanInput): Promise<any> => {
  const res = await apiClient.put<any>(`/api/contractor-plans/${id}`, planData);
  return (res as any).data || res;
};

export const reorderContractorPlans = async (orderedIds: string[]): Promise<any> => {
  const res = await apiClient.patch<any>("/api/contractor-plans/reorder", { orderedIds });
  return res;
};

export const deleteContractorPlan = async (id: string) => {
  await apiClient.delete(`/api/contractor-plans/${id}`);
};
