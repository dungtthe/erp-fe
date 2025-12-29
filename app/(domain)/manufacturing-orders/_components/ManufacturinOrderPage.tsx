"use client"
import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManufacturingInformation from "./ManufacturingInformation";
import ManufacturingStep, { ExtendedRoutingStep } from "./ManufacturingStep";
import ProductMaterial from "./ProductMaterial";
import { getRoutingSteps } from "../_services/manufacturingOrderService";

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
                    setSteps(response.data.map(step => ({ ...step, workCenterId: undefined })));
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
    }, [selectedBomId]);

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
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}


