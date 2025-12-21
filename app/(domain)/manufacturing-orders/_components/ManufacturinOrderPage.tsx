import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ManufacturingInformation from "./ManufacturingInformation";
import ManufacturingStep from "./ManufacturingStep";
import ProductMaterial from "./ProductMaterial";

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

    return (
        <>
            <div className="flex gap-5 items-center mb-5">
                <h3 className="text-2xl">{s}</h3>
            </div>
            <ManufacturingInformation mode={mode} manufacturingOrderId={manufacturingOrderId}></ManufacturingInformation>

            <div className="mt-2">
                <Tabs defaultValue="Material">
                    <TabsList>
                        <TabsTrigger value="Material" className="mr-2">Thành phần</TabsTrigger>
                        <TabsTrigger value="Step" className="mr-2">Công đoạn</TabsTrigger>
                    </TabsList>
                    <TabsContent value="Material">
                        <ProductMaterial></ProductMaterial>
                    </TabsContent>
                    <TabsContent value="Step">
                        <ManufacturingStep></ManufacturingStep>
                    </TabsContent>
                </Tabs>
            </div>
        </>
    );
}

