"use client"
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManufacturingInformation from "./ManufacturingInformation";
import ManufacturingStep, { ExtendedRoutingStep } from "./ManufacturingStep";
import ProductMaterial from "./ProductMaterial";
import { getBOM, getMOById, getRoutingSteps, ManufacturingOrderDetail } from "../_services/manufacturingOrderService";

type ManufacturingOrderFormMode = "create" | "detail";

type ManufacturingOrderFormProps = {
    mode: ManufacturingOrderFormMode;
    manufacturingOrderId?: string;
};

export default function ManufacturingOrderPage({ mode, manufacturingOrderId }: ManufacturingOrderFormProps) {
    let s: string = "Thêm mới lệnh sản xuất";
    if (mode === "detail") {
        s = "Thông tin lệnh sản xuất";
    }

    const [selectedProductVariantId, setSelectedProductVariantId] = useState<string>("");
    const [selectedBomId, setSelectedBomId] = useState<string>("");
    const [routingId, setRoutingId] = useState<string>("");
    const [steps, setSteps] = useState<ExtendedRoutingStep[]>([]);
    const [orderDetail, setOrderDetail] = useState<ManufacturingOrderDetail | null>(null);

    useEffect(() => {
        const fetchDetail = async () => {
            if (mode === 'detail' && manufacturingOrderId) {
                try {
                    const response = await getMOById(manufacturingOrderId);
                    if (response.success && response.data) {
                        const data = response.data;
                        setOrderDetail(data);
                        setSelectedProductVariantId(data.productVariantId);
                        const bomResponse = await getBOM(data.productVariantId);
                        if (bomResponse.success && bomResponse.data) {
                            setSelectedBomId(bomResponse.data.bomId);
                        }
                    }
                } catch (error) {
                    console.error("Failed to fetch manufacturing order details:", error);
                }
            }
        };
        fetchDetail();
    }, [mode, manufacturingOrderId]);

    useEffect(() => {
        const fetchRouting = async () => {
            if (!selectedBomId) {
                setSteps([]);
                setRoutingId("");
                return;
            }
            try {
                const response = await getRoutingSteps(selectedBomId);
                if (response.success && response.data) {
                    setRoutingId(response.data[0].routingId);
                    const mappedSteps = response.data.map(step => {
                        let currentWorkCenterId = undefined;
                        if (mode === 'detail' && orderDetail?.workOrders) {
                            const match = orderDetail.workOrders.find(wo => wo.routingStepId === step.routingStepId);
                            if (match) {
                                currentWorkCenterId = match.workCenterId;
                            }
                        }
                        return {
                            ...step,
                            workCenterId: currentWorkCenterId
                        };
                    });
                    setSteps(mappedSteps);
                } else {
                    setSteps([]);
                    setRoutingId("");
                }
            } catch (err) {
                console.error("Failed to fetch routing steps", err);
                setSteps([]);
                setRoutingId("");
            }
        }
        fetchRouting();
    }, [selectedBomId, orderDetail, mode]);

    const handleProductSelect = (productVariantId: string, bomId?: string) => {
        setSelectedProductVariantId(productVariantId);
        if (bomId) setSelectedBomId(bomId);
        else setSelectedBomId("");
    };

    return (
        <>
            <div className="flex gap-5 items-center mb-5">
                <h3 className="text-2xl">{s}</h3>
            </div>
            <ManufacturingInformation
                mode={mode}
                manufacturingOrderId={manufacturingOrderId}
                onProductSelect={handleProductSelect}
                routingId={routingId}
                steps={steps}
                initialData={orderDetail}
            />

            <div className="mt-2">
                <Tabs defaultValue="Material">
                    <TabsList>
                        <TabsTrigger value="Material" className="mr-2">Thành phần</TabsTrigger>
                        <TabsTrigger value="Step" className="mr-2">Công đoạn</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Material">
                        <ProductMaterial productVariantId={selectedProductVariantId}></ProductMaterial>
                    </TabsContent>
                    <TabsContent value="Step">
                        <ManufacturingStep
                            steps={steps}
                            onStepsChange={setSteps}
                            mode={mode}
                            manufacturingOrderId={manufacturingOrderId}
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}


