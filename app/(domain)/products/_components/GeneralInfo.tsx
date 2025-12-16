"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import ImageUploader, { UploadedImage } from "@/my-components/ImageUploader";
import ActionButton from "@/my-components/btn/ActionButton";
import CategoryCombobox from "@/my-components/domains/CategoryCombobox";
import ProductTypeCombobox from "@/my-components/domains/ProductTypeCombobox";
import UnitOfMeasureCombobox from "@/my-components/domains/UnitOfMeasureCombobox";
import RequiredMark from "@/my-components/helpers/RequiredMark";
import { X } from "lucide-react";
import { useState } from "react";

export default function GeneralInfo({ data }: { data: any }) {
  const [selectedUnit, setSelectedUnit] = useState<string | number>("");
  const [selectedProductType, setSelectedProductType] = useState<string | number>("");
  const [selectedCategories, setSelectedCategories] = useState<{ id: string | number; value: string }[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | number>("");
  const [currentCategoryItem, setCurrentCategoryItem] = useState<{ id: string | number; value: string } | null>(null);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);

  const handleAddCategory = () => {
    if (currentCategoryItem && !selectedCategories.some((cat) => cat.id === currentCategoryItem.id)) {
      setSelectedCategories([...selectedCategories, currentCategoryItem]);
      setCurrentCategory("");
      setCurrentCategoryItem(null);
    }
  };

  const handleRemoveCategory = (id: string | number) => {
    setSelectedCategories(selectedCategories.filter((cat) => cat.id !== id));
  };

  return (
    <div>
      <div className="flex gap-5">
        <div className="w-[70%]">
          {/* cơ bản */}
          <Card>
            <CardHeader className="border-b">
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="w-full">
                  <Label>
                    Tên sản phẩm
                    <RequiredMark></RequiredMark>
                  </Label>
                  <Input placeholder="VD: Ghế Xoay Văn Phòng"></Input>
                </div>

                <div className="w-full">
                  <Label>
                    Mã sản phẩm
                    <RequiredMark></RequiredMark>
                  </Label>
                  <Input placeholder="VD: G-X-V-P"></Input>
                </div>
              </div>

              <div className="mt-3">
                <Label>Mô tả</Label>
                <Textarea placeholder="VD: Tựa lưng trung thiết kế bảo vệ sức khỏe, giúp nâng đỡ bộ phận cột sống và vùng thắt lưng an toàn, hạn chế nhức mỏi khi ngồi làm việc lâu"></Textarea>
              </div>

              <div className="flex gap-2">
                <div className="mt-3 w-full">
                  <Label>
                    Đơn vị tính
                    <RequiredMark></RequiredMark>
                  </Label>
                  <UnitOfMeasureCombobox value={selectedUnit} onChange={setSelectedUnit} />
                </div>
                <div className="mt-3 w-full">
                  <Label>
                    Loại sản phẩm
                    <RequiredMark></RequiredMark>
                  </Label>
                  <ProductTypeCombobox value={selectedProductType} onChange={setSelectedProductType} />
                </div>
              </div>

              <div className="mt-3">
                <Label>Danh mục sản phẩm</Label>
                <div className="flex gap-2 mt-1">
                  <div className="flex-1">
                    <CategoryCombobox value={currentCategory} onChange={setCurrentCategory} onSelectItem={setCurrentCategoryItem} excludeIds={selectedCategories.map((cat) => cat.id)} />
                  </div>
                  <Button type="button" onClick={handleAddCategory} disabled={!currentCategory}>
                    Thêm
                  </Button>
                </div>
                {selectedCategories.length > 0 && (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedCategories.map((category) => (
                      <div key={category.id} className="flex items-center gap-2 bg-secondary text-secondary-foreground px-3 py-1.5 rounded-md text-sm">
                        <span>{category.value}</span>
                        <button type="button" onClick={() => handleRemoveCategory(category.id)} className="text-secondary-foreground/60 hover:text-secondary-foreground transition-colors">
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* hoạt động */}
          <Card className="mt-5">
            <CardHeader className="border-b">
              <CardTitle>Hoạt động</CardTitle>
            </CardHeader>

            <CardContent>
              <div className="flex justify-between">
                <div>
                  <p className="font-medium">Có thể bán</p>
                  <Label className="text-foreground/70">Sản phẩm có thể bán cho khách hàng</Label>
                </div>
                <Switch id="CanBeSold-mode" />
              </div>
              <div className="flex justify-between">
                <div className="mt-2">
                  <p className="font-medium">Có thể mua</p>
                  <Label className="text-foreground/70">Sản phẩm có thể mua từ nhà cung cấp</Label>
                </div>
                <Switch id="CanBePurchased-mode" />
              </div>
              <div className="flex justify-between">
                <div className="mt-2">
                  <p className="font-medium">Có thể sản xuất</p>
                  <Label className="text-foreground/70">Sản phẩm có thể được sản xuất</Label>
                </div>
                <Switch id="CanBeManufactured-mode" />
              </div>
            </CardContent>
          </Card>

          {/* giá cả */}
          <Card className="mt-5">
            <CardHeader className="border-b">
              <CardTitle>Giá cả</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="w-full">
                <Label>
                  Chi phí sản xuất
                  <RequiredMark></RequiredMark>
                </Label>
                <Input></Input>
              </div>

              <div className="w-full mt-2">
                <Label>
                  Giá bán
                  <RequiredMark></RequiredMark>
                </Label>
                <Input></Input>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-5 justify-end mt-5">
            <ActionButton action="cancel"></ActionButton>
            <ActionButton action="save"></ActionButton>
          </div>
        </div>

        {/* ảnh */}
        <Card className="w-[28%] h-fit min-h-100">
          <CardHeader className="border-b">
            <CardTitle>Ảnh sản phẩm</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <ImageUploader images={productImages} onChange={setProductImages} gridCols={2} aspectRatio={1} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
