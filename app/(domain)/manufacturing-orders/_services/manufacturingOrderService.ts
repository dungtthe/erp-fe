import { api, ApiResponse } from "@/lib/api";
import { ManufacturingType } from "@/resources/ManufacturingType";
import { ProductType } from "@/resources/ProductResource";

export type ManufacturingOrder = {
    id: string;
    code: string;
    productName: string;
    quantityToProduce: number;
    quantityProduced: number;
    status: ManufacturingType;
};

export type ProductVariant = {
    productVariantId: string;
    productVariantName: string;
    productVariantCode: string;
    productVariantImage: string;
    productVariantType: ProductType;
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



export async function getMOs(params: { page: number; pageSize: number; searchTerm: string; productType?: number }): Promise<ApiResponse<PagedResult<ManufacturingOrder>>> {
    return api.post<PagedResult<ManufacturingOrder>>("manufacturing-orders", {
        ...params,
    });
}

export async function getProductVariants(params: { page: number; pageSize: number; searchTerm: string; productType?: number }): Promise<ApiResponse<PagedResult<ProductVariant>>> {
    return api.post<PagedResult<ProductVariant>>("product-variants", {
        ...params,
    });
}



