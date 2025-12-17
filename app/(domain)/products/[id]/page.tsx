import ContainerPage from "@/my-components/layout/ContainerPage";
import ProductPage from "../_components/ProductPage";

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  return (
    <ContainerPage>
      <ProductPage mode="detail" productId={params.id}></ProductPage>
    </ContainerPage>
  );
}
