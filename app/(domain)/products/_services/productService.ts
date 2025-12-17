import { api, ApiResponse } from "@/lib/api";

export interface ProductGeneralInfo {
  id?: string;
  name: string;
  code: string;
  description?: string;
  images?: string[];
  unitOfMeasureId: string;
  productType: number;
  canBeSold: boolean;
  canBePurchased: boolean;
  canBeManufactured: boolean;
  priceReference: number;
  costPrice: number;
  categoryIds?: string[];
}

export interface ProductGeneralInfoResponse {
  id: string;
  name: string;
  code: string;
  description?: string;
  images?: string[];
  unitOfMeasureId: string;
  productType: number;
  canBeSold: boolean;
  canBePurchased: boolean;
  canBeManufactured: boolean;
  priceReference: number;
  costPrice: number;
  categoryIds?: string[];
}

export async function getProductGeneralInfo(productId: string): Promise<ApiResponse<ProductGeneralInfoResponse>> {
  return api.get<ProductGeneralInfoResponse>("products/general-info", {
    params: { ProductId: productId },
  });
}

export async function createProduct(data: Partial<ProductGeneralInfo>): Promise<ApiResponse<string>> {
  return api.post<string>("products/create", data);
}
