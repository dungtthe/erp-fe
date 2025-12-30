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

export interface BOMMaterial {
    id: string;
    materialName: string;
    quantityRequired: number;
    unitOfMeasureName: string;
}

export interface BOMResponse {
    bomId: string;
    bomCode: string;
    latestVersion: number;
    listMaterials: BOMMaterial[];
}

export interface RoutingStepResponse {
    routingStepId: string
    stepOrder: number
    operationName: string
    operationTime: number
}

export interface WorkOrderRequest {
    workCenterId: string;
    routingStepId: string;
    manufacturingOrderId?: string;
}

export interface CreateManufacturingOrderRequest {
    code: string;
    routingId: string;
    quantityToProduce: number;
    startDate: Date;
    endDate: Date;
    workOrders: WorkOrderRequest[];
}

export interface ManufacturingOrderDetail {
    manufacturingOrderId: string;
    code: string;
    productVariantId: string;
    routingId: string;
    quantityToProduce: number;
    manufacturingOrderStatus: number;
    startDate: Date;
    endDate: Date;
    workOrders: WorkOrderRequest[];
}

export interface RoutingStepResponse {
    routingId: string;
    routingStepId: string
    stepOrder: number
    operationName: string
    operationTime: number
}


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

export async function getBOM(productVariantId: string): Promise<ApiResponse<BOMResponse>> {
    return api.get<BOMResponse>(`bill-of-materials/get-bom/${productVariantId}`);
}

export async function getRoutingSteps(bomID: string): Promise<ApiResponse<RoutingStepResponse[]>> {
    return api.get<RoutingStepResponse[]>(`routings/get-steps/${bomID}`);
}

export async function createManufacturingOrder(data: CreateManufacturingOrderRequest): Promise<ApiResponse<string>> {
    return api.post<string>("manufacturing-orders/create", data);
}

export async function getMOById(id: string): Promise<ApiResponse<ManufacturingOrderDetail>> {
    return api.get<ManufacturingOrderDetail>(`manufacturing-orders/${id}`);
}
