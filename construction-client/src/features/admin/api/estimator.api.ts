import { apiClient } from "@shared/api/apiClient";

export type RegionRates = {
  grey_with_material: number;
  grey_without_material: number;
  complete_with_material: number;
  complete_without_material: number;
};

export type EstimatorRegion = {
  _id: string;
  name: string;
  rates: RegionRates;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

// ---- Breakdown Node Types ----

export type BreakdownNode = {
  _id: string;
  name: string;
  percentage: number;
  amount: number;
  parentId: string | null;
  region: string;
  constructionType: "grey" | "complete";
  mode: "with_material" | "without_material";
  order: number;
  active: boolean;
  requiresMaterial: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TreeNode = BreakdownNode & {
  children: TreeNode[];
};

export type CreateNodePayload = {
  name: string;
  percentage: number;
  parentId: string | null;
  region: string;
  constructionType: "grey" | "complete";
  mode: "with_material" | "without_material";
  order?: number;
  requiresMaterial?: boolean;
  notes?: string;
};

export type UpdateNodePayload = Partial<
  Omit<CreateNodePayload, "region" | "constructionType" | "mode">
>;

// ---- Calculate / Preview Types ----

export type CalculatePayload = {
  region: string;
  constructionType: "grey" | "complete";
  mode: "with_material" | "without_material";
  areaUnit: string;
  areaSize: number;
  coveredArea?: number;
};

export type BreakdownResultNode = {
  _id: string;
  name: string;
  percentage: number;
  amount: number;
  children: BreakdownResultNode[];
};

export type CalculateResult = {
  region: string;
  constructionType: string;
  mode: string;
  originalArea: number;
  areaSqft: number;
  coveredArea: number;
  ratePerSqFt: number;
  totalCost: number;
  pricePerSqFt: number;
  summary: { name: string; amount: number }[];
  breakdown: BreakdownResultNode[];
  chart: { label: string; value: number }[];
};

export type PopularCalculation = {
  _id: string;
  region: string;
  area: number;
  unit: string;
  coveredArea: number;
  constructionType: "grey_structure" | "complete";
  mode: "with_material" | "without_material";
  displayOrder: number;
  isActive: boolean;
};
// ---- API response wrapper ----

type ApiResponse<T> = {
  success?: boolean;
  message?: string;
  data?: T;
};

export const getEstimatorRegions = async (): Promise<EstimatorRegion[]> => {
  const response = await apiClient.get<ApiResponse<EstimatorRegion[]>>(
    "/api/admin/estimator/regions"
  );
  return response.data || [];
};

export const createEstimatorRegion = async (payload: {
  name: string;
  rates: RegionRates;
  notes?: string;
}): Promise<EstimatorRegion> => {
  const response = await apiClient.post<ApiResponse<EstimatorRegion>>(
    "/api/admin/estimator/regions",
    payload
  );
  return response.data as EstimatorRegion;
};

export const updateEstimatorRegion = async (
  id: string,
  payload: Partial<{
    name: string;
    rates: RegionRates;
    notes?: string;
  }>
): Promise<EstimatorRegion> => {
  const response = await apiClient.put<ApiResponse<EstimatorRegion>>(
    `/api/admin/estimator/regions/${id}`,
    payload
  );
  return response.data as EstimatorRegion;
};

export const deleteEstimatorRegion = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/admin/estimator/regions/${id}`);
};

// ---- Breakdown Node API functions ----

export const getBreakdownNodes = async (params: {
  region: string;
  constructionType: string;
  mode: string;
}): Promise<BreakdownNode[]> => {
  const { region, constructionType, mode } = params;
  const response = await apiClient.get<ApiResponse<BreakdownNode[]>>(
    `/api/admin/estimator/nodes?region=${encodeURIComponent(region)}&constructionType=${encodeURIComponent(constructionType)}&mode=${encodeURIComponent(mode)}`
  );
  return response.data || [];
};

export const createBreakdownNode = async (
  payload: CreateNodePayload
): Promise<BreakdownNode> => {
  const response = await apiClient.post<ApiResponse<BreakdownNode>>(
    "/api/admin/estimator/nodes",
    payload
  );
  return response.data as BreakdownNode;
};

export const updateBreakdownNode = async (
  id: string,
  payload: UpdateNodePayload
): Promise<BreakdownNode> => {
  const response = await apiClient.put<ApiResponse<BreakdownNode>>(
    `/api/admin/estimator/nodes/${id}`,
    payload
  );
  return response.data as BreakdownNode;
};

export const deleteBreakdownNode = async (id: string): Promise<void> => {
  await apiClient.delete(`/api/admin/estimator/nodes/${id}`);
};

export const reorderBreakdownNode = async (
  id: string,
  order: number
): Promise<BreakdownNode> => {
  const response = await apiClient.patch<ApiResponse<BreakdownNode>>(
    `/api/admin/estimator/nodes/${id}/reorder`,
    { order }
  );
  return response.data as BreakdownNode;
};

export const activateBreakdownNode = async (
  id: string,
  active: boolean
): Promise<BreakdownNode> => {
  const response = await apiClient.patch<ApiResponse<BreakdownNode>>(
    `/api/admin/estimator/nodes/${id}/activate`,
    { active }
  );
  return response.data as BreakdownNode;
};

// ---- Calculate / Preview ----

export const calculateEstimate = async (
  payload: CalculatePayload
): Promise<CalculateResult> => {
  const response = await apiClient.post<ApiResponse<CalculateResult>>(
    "/api/estimator/calculate",
    payload
  );
  return response.data as CalculateResult;
};

// ---- Publish validation ----

export type ValidateTreePayload = {
  region: string;
  constructionType: "grey" | "complete";
  mode: "with_material" | "without_material";
};

export type ValidateTreeResult = {
  success: boolean;
  message: string;
  errors?: string[];
};

export const validateBreakdownTree = async (
  payload: ValidateTreePayload
): Promise<ValidateTreeResult> => {
  try {
    const response = await apiClient.post<ValidateTreeResult>(
      "/api/admin/estimator/nodes/validate",
      payload
    );
    return response as unknown as ValidateTreeResult;
  } catch (err: unknown) {
    // axios throws on 4xx — extract the error body
    const axiosErr = err as { response?: { data?: ValidateTreeResult } };
    if (axiosErr?.response?.data) return axiosErr.response.data;
    return { success: false, message: "Validation request failed." };
  }
};

export const getPopularCalculations = async (): Promise<
  PopularCalculation[]
> => {
  const response = await apiClient.get<
    ApiResponse<PopularCalculation[]>
  >("/api/admin/estimator/popular-calculations");

  return response.data || [];
};

export type CreatePopularCalculationPayload = {
  region: string;
  area: number;
  unit: string;
  coveredArea: number;
  constructionType:
    | "grey_structure"
    | "complete";
  mode:
    | "with_material"
    | "without_material";
  isActive?: boolean;
};

export const createPopularCalculation = async (
  payload: CreatePopularCalculationPayload
): Promise<PopularCalculation> => {
  const response = await apiClient.post<
    ApiResponse<PopularCalculation>
  >(
    "/api/admin/estimator/popular-calculations",
    payload
  );

  return response.data as PopularCalculation;
};
export const updatePopularCalculation = async (
  id: string,
  payload: Partial<PopularCalculation>
): Promise<PopularCalculation> => {
  const response = await apiClient.put<
    ApiResponse<PopularCalculation>
  >(
    `/api/admin/estimator/popular-calculations/${id}`,
    payload
  );

  return response.data as PopularCalculation;
};

export const deletePopularCalculation = async (
  id: string
): Promise<void> => {
  await apiClient.delete(
    `/api/admin/estimator/popular-calculations/${id}`
  );
};

export const togglePopularCalculation = async (
  id: string
): Promise<PopularCalculation> => {
  const response = await apiClient.patch<
    ApiResponse<PopularCalculation>
  >(
    `/api/admin/estimator/popular-calculations/${id}/toggle`
  );

  return response.data as PopularCalculation;
};

export const reorderPopularCalculation = async (
  id: string,
  displayOrder: number
): Promise<PopularCalculation> => {
  const response = await apiClient.patch<
    ApiResponse<PopularCalculation>
  >(
    `/api/admin/estimator/popular-calculations/${id}/reorder`,
    { displayOrder }
  );

  return response.data as PopularCalculation;
};
