import ContainerPage from "@/my-components/layout/ContainerPage";
import ManufacturingOrderPage from "../_components/ManufacturinOrderPage";

export default function ManufacturingOrdersDetailPage({ params }: { params: { id: string } }) {
    return (
        <ContainerPage>
            <ManufacturingOrderPage mode="detail" manufacturingOrderId={params.id}></ManufacturingOrderPage>
        </ContainerPage>
    );
}