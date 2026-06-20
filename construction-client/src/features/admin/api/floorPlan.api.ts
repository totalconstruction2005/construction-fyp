import { apiClient } from "@shared/api/apiClient";

export interface FloorPlanImage {
  name: string;
  secure_url: string;
  public_id: string;
  resource_type: string;
}

export interface FloorPlan {
  _id: string;
  title: string;
  slug: string;
  marlaSize: number;
  category: "residential" | "commercial";
  rooms: number;
  washrooms: number;
  image: FloorPlanImage;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FloorPlanResponse {
  success: boolean;
  message: string;
  data: FloorPlan | FloorPlan[];
}

/**
 * Get all floor plans (admin only)
 */
export const getAllAdminFloorPlans = async (): Promise<FloorPlan[]> => {
  const response = await apiClient.get<FloorPlanResponse>("/api/admin/floor-plans");
  return Array.isArray(response.data) ? response.data : [];
};

/**
 * Get single floor plan by ID (admin only)
 */
export const getFloorPlanById = async (id: string): Promise<FloorPlan> => {
  const response = await apiClient.get<FloorPlanResponse>(`/api/admin/floor-plans/${id}`);
  return response.data as FloorPlan;
};

/**
 * Create new floor plan (admin only)
 */
export const createFloorPlan = async (formData: FormData): Promise<FloorPlan> => {
  const response = await apiClient.post<FloorPlanResponse>("/api/admin/floor-plans", formData);
  return response.data as FloorPlan;
};

/**
 * Update floor plan (admin only)
 */
export const updateFloorPlan = async (id: string, formData: FormData): Promise<FloorPlan> => {
  const response = await apiClient.put<FloorPlanResponse>(`/api/admin/floor-plans/${id}`, formData);
  return response.data as FloorPlan;
};

/**
 * Delete floor plan (admin only)
 */
export const deleteFloorPlan = async (id: string): Promise<void> => {
  await apiClient.delete<FloorPlanResponse>(`/api/admin/floor-plans/${id}`);
};

/**
 * Get all active floor plans (public - no authentication required)
 */
export const getPublicFloorPlans = async (): Promise<FloorPlan[]> => {
  try {
    console.log("📡 [API] Calling GET /api/floor-plans/public");
    const response = await apiClient.get<FloorPlanResponse>("/api/floor-plans/public");
    
    console.log("📡 [API] Response received:", response);
    console.log("📡 [API] Response type:", typeof response);
    console.log("📡 [API] Response keys:", Object.keys(response || {}));
    
    if (!response) {
      console.error("❌ [API] Response is null/undefined");
      return [];
    }
    
    if (!response.data) {
      console.warn("⚠️ [API] Response.data is missing", response);
      return [];
    }
    
    console.log("📡 [API] Response.data type:", typeof response.data);
    console.log("📡 [API] Is Array?:", Array.isArray(response.data));
    
    const result = Array.isArray(response.data) ? response.data : [];
    console.log("📡 [API] Returning", result.length, "items");
    return result;
  } catch (error) {
    console.error("❌ [API] Exception in getPublicFloorPlans:", error);
    throw error;
  }
};
