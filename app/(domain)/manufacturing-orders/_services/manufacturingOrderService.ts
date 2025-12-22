import { api, ApiResponse } from "@/lib/api";
import { ManufacturingType } from "@/resources/ManufacturingType";

export type ManufacturingOrder = {
    id: string;
    code: string;
    productName: string;
    quantityToProduce: number;
    quantityProduced: number;
    status: ManufacturingType;
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

