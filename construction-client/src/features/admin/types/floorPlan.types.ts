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
  createdAt?: string;
  updatedAt?: string;
}

export interface FloorPlanFormData {
  title: string;
  marlaSize: number;
  category: "residential" | "commercial";
  rooms: number;
  washrooms: number;
  imageFile: File | null;
  isActive: boolean;
}
