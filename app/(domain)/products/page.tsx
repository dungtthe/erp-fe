import ActionButton from "@/my-components/btn/ActionButton";
import ContainerPage from "@/my-components/layout/ContainerPage";

export default function ProductsPage() {
  return (
    <ContainerPage>
      <ActionButton action="create" href="/products/create">
        Thêm sản phẩm mới
      </ActionButton>
    </ContainerPage>
  );
}
