import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Attribute from "./Attribute";
import GeneralInfo from "./GeneralInfo";
import VariantTab from "./VariantTab";
import BOM from "./BOM";
import Manufacture from "./Manufacture";

type ProductFormMode = "create" | "detail";

type ProductFormProps = {
  mode: ProductFormMode;
  productId?: string;
};

export default function ProductPage({ mode, productId }: ProductFormProps) {
  let s: string = "Thêm mới sản phẩm";
  if (mode === "detail") {
    s = "Thông tin sản phẩm";
  }

  return (
    <div>
      {/* info */}
      <div className="flex gap-5 items-center ">
        <h3 className="text-2xl">{s}</h3>
      </div>

      {/* tab */}
      <div className="mt-5">
        <Tabs defaultValue="GeneralInfo">
          <TabsList>
            <TabsTrigger value="GeneralInfo">Sản phẩm mẫu</TabsTrigger>
            <TabsTrigger value="Attribute">Thuộc tính</TabsTrigger>
            <TabsTrigger value="Bom">Định mức nguyên vật liệu</TabsTrigger>
            <TabsTrigger value="Routing">Quy trình sản xuất</TabsTrigger>
            <TabsTrigger value="VariantTab">Sản phẩm & Biến thể</TabsTrigger>
          </TabsList>
          <TabsContent value="GeneralInfo">
            <GeneralInfo mode={mode} productId={productId}></GeneralInfo>
          </TabsContent>

          <TabsContent value="Attribute">
            <Attribute productId={productId}></Attribute>
          </TabsContent>

          <TabsContent value="VariantTab">
            <VariantTab></VariantTab>
          </TabsContent>

          <TabsContent value="Bom">
            <BOM></BOM>
          </TabsContent>
          <TabsContent value="Routing">
            <Manufacture></Manufacture>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
