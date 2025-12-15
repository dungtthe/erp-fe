import ContainerPage from "@/my-components/layout/ContainerPage";
import ProductPage from "../_components/ProductPage";

export default function CreateProduct() {
  return (
    <ContainerPage>
      <ProductPage mode="create"></ProductPage>
    </ContainerPage>
  );
}
