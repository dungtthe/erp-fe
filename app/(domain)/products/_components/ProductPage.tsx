import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/my-components/btn/ActionButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralInfo from "./GeneralInfo";

type ProductFormMode = "create" | "detail";

type ProductFormProps = {
  mode: ProductFormMode;
};

export default function ProductPage({ mode }: ProductFormProps) {
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
            <TabsTrigger value="GeneralInfo">Thông tin chung</TabsTrigger>
            <TabsTrigger value="Variant">Thuộc tính & biến thể</TabsTrigger>
            <TabsTrigger value="Bom">Định mức nguyên vật liệu</TabsTrigger>
            <TabsTrigger value="Routing">Quy trình sản xuất</TabsTrigger>
          </TabsList>
          <TabsContent value="GeneralInfo">
            <GeneralInfo data="a"></GeneralInfo>
          </TabsContent>
          <TabsContent value="Variant">Variant</TabsContent>
          <TabsContent value="Bom">Định mức nguyên vật liệu</TabsContent>
          <TabsContent value="Routing">Quy trình sản xuất</TabsContent>
        </Tabs>
      </div>
      {/* <div>Thông tin chung  Định mức nguyên vật liệu Quy trình</div> */}
    </div>
  );
}
