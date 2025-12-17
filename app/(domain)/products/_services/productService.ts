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

export enum ProductType {
  FinishedProduct = 1,
  SemiFinished = 2,
  RawMaterial = 3,
  Consumable = 4,
}

export type Product = {
  id: string;
  name: string;
  code: string;
  image?: string;
  productType: ProductType;
  costPrice: number;
  productVariantNumber: number;
};

export type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

export async function getProductGeneralInfo(productId: string): Promise<ApiResponse<ProductGeneralInfoResponse>> {
  return api.get<ProductGeneralInfoResponse>("products/general-info", {
    params: { ProductId: productId },
  });
}

export async function createProduct(data: Partial<ProductGeneralInfo>): Promise<ApiResponse<string>> {
  return api.post<string>("products/create", data);
}



export async function getProducts(params: {
  page: number;
  pageSize: number;
  searchTerm: string;
  productType?: number;
}): Promise<ApiResponse<PagedResult<Product>>> {
  return api.post<PagedResult<Product>>("products", {
    ...params,
    // Add both camelCase and PascalCase for compatibility if needed, though strictly one should suffice if backend is consistent
    // Keeping it simple here based on recent successful calls
  });
}
