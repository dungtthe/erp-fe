import { ManufacturingType } from "@/resources/ManufacturingType";

export type ManufacturingOrder = {
    id: string;
    code: string;
    productName: string;
    productPlannedQuantity: number;
    productProducedQuantity: number;
    status: ManufacturingType;
};