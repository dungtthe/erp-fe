"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import UnitOfMeasureCombobox from "@/my-components/domains/UnitOfMeasureCombobox";
import RequiredMark from "@/my-components/helpers/RequiredMark";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useEffect, useState } from "react";
import ProductTypeCombobox from "@/my-components/domains/ProductTypeCombobox";
import { Switch } from "@/components/ui/switch";
import CategoryCombobox from "@/my-components/domains/CategoryCombobox";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import ImageUploader, { UploadedImage } from "@/my-components/ImageUploader";
import ActionButton from "@/my-components/btn/ActionButton";
import { api } from "@/lib/api";
import { formatCurrency, parseCurrency } from "@/helpers/format";
import ToastManager from "@/helpers/ToastManager";
import { getProductGeneralInfo, createProduct as createProductApi } from "../_services/productService";

interface GeneralInfoProps {
  mode: "create" | "detail";
  productId?: string;
}

export default function GeneralInfo({ mode, productId }: GeneralInfoProps) {
  // Form states
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [selectedUnit, setSelectedUnit] = useState<string | number>("");
  const [selectedProductType, setSelectedProductType] = useState<string | number>("");
  const [selectedCategories, setSelectedCategories] = useState<{ id: string | number; value: string }[]>([]);
  const [currentCategory, setCurrentCategory] = useState<string | number>("");
  const [currentCategoryItem, setCurrentCategoryItem] = useState<{ id: string | number; value: string } | null>(null);
  const [productImages, setProductImages] = useState<UploadedImage[]>([]);
  const [canBeSold, setCanBeSold] = useState(true);
  const [canBePurchased, setCanBePurchased] = useState(false);
  const [canBeManufactured, setCanBeManufactured] = useState(false);
  const [costPrice, setCostPrice] = useState("");
  const [priceReference, setPriceReference] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingCategoryIds, setPendingCategoryIds] = useState<string[]>([]);

  // mode = detail
  useEffect(() => {
    if (mode === "detail" && productId) {
      loadProductData(productId);
    }
  }, [mode, productId]);

  const loadProductData = async (id: string) => {
    try {
      setIsLoading(true);
      const response = await getProductGeneralInfo(id);

      if (!response.success || !response.data) {
        ToastManager.error("Lỗi tải dữ liệu", response.error?.message || "Không thể tải thông tin sản phẩm");
        return;
      }

      const data = response.data;
      setName(data.name);
      setCode(data.code);
      setDescription(data.description || "");
      setSelectedUnit(data.unitOfMeasureId);
      setSelectedProductType(data.productType);
      setCanBeSold(data.canBeSold);
      setCanBePurchased(data.canBePurchased);
      setCanBeManufactured(data.canBeManufactured);
      setCostPrice(data.costPrice.toString());
      setPriceReference(data.priceReference.toString());

      if (data.images && data.images.length > 0) {
        const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://localhost:7015/api";
        const transformedImages: UploadedImage[] = data.images.map((imgName) => ({
          id: imgName,
          url: `${API_BASE_URL}/files/image?uploadType=1&fileName=${imgName}`,
          file: null as any,
        }));
        setProductImages(transformedImages);
      }

      if (data.categoryIds && data.categoryIds.length > 0) {
        setPendingCategoryIds(data.categoryIds);
      }
    } catch (error) {
      console.error("Error loading product data:", error);
      ToastManager.error("Đã có lỗi xảy ra khi tải dữ liệu sản phẩm");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseCurrency(e.target.value);
    setCostPrice(rawValue);
  };

  const handlePriceReferenceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const rawValue = parseCurrency(e.target.value);
    setPriceReference(rawValue);
  };

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

  const handleCategoriesLoaded = (categories: { id: string | number; value: string }[]) => {
    if (pendingCategoryIds.length > 0) {
      const matchedCategories = categories.filter((cat) => pendingCategoryIds.includes(cat.id as string));
      setSelectedCategories(matchedCategories);
      setPendingCategoryIds([]);
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Validation
      if (!name.trim()) {
        ToastManager.warning("Vui lòng nhập tên sản phẩm");
        return;
      }
      if (!code.trim()) {
        ToastManager.warning("Vui lòng nhập mã sản phẩm");
        return;
      }
      if (!selectedUnit) {
        ToastManager.warning("Vui lòng chọn đơn vị tính");
        return;
      }
      if (!selectedProductType) {
        ToastManager.warning("Vui lòng chọn loại sản phẩm");
        return;
      }
      if (!costPrice || isNaN(Number(costPrice))) {
        ToastManager.warning("Vui lòng nhập chi phí sản xuất hợp lệ");
        return;
      }
      if (!priceReference || isNaN(Number(priceReference))) {
        ToastManager.warning("Vui lòng nhập giá bán hợp lệ");
        return;
      }

      // Handle images
      let uploadedFileNames: string[] = [];
      const newImages = productImages.filter((img) => img.file !== null);
      const existingImages = productImages.filter((img) => img.file === null);

      if (newImages.length > 0) {
        const files = newImages.map((img) => img.file!);
        const uploadResponse = await api.uploadFiles<string[]>(files, 1);

        if (!uploadResponse.success || !uploadResponse.data) {
          ToastManager.error("Lỗi upload ảnh", uploadResponse.error?.message || "Lỗi không xác định");
          return;
        }

        uploadedFileNames = uploadResponse.data;
      }

      const allImageNames = [...existingImages.map((img) => img.id), ...uploadedFileNames];

      const productData = {
        name: name,
        code: code,
        description: description || undefined,
        images: allImageNames.length > 0 ? allImageNames : undefined,
        unitOfMeasureId: selectedUnit as string,
        productType: Number(selectedProductType),
        canBeSold: canBeSold,
        canBePurchased: canBePurchased,
        canBeManufactured: canBeManufactured,
        priceReference: Number(priceReference),
        costPrice: Number(costPrice),
        categoryIds: selectedCategories.length > 0 ? selectedCategories.map((cat) => cat.id as string) : undefined,
      };

      if (mode === "create") {
        const createResponse = await createProductApi(productData);

        if (!createResponse.success) {
          ToastManager.error("Lỗi tạo sản phẩm", createResponse.error?.message || "Lỗi không xác định");
          return;
        }

        ToastManager.success("Tạo sản phẩm thành công!", "Đang chuyển hướng...");
        setTimeout(() => {
          window.location.href = "/products";
        }, 1000);
      } else {
        // Update mode
        if (!productId) {
          ToastManager.error("Lỗi", "Không tìm thấy ID sản phẩm");
          return;
        }
        console.log(productData);
      }
    } catch (error) {
      console.error("Error saving product:", error);
      ToastManager.error("Đã có lỗi xảy ra khi lưu sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

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
                  <Input placeholder="VD: Ghế Xoay Văn Phòng" value={name} onChange={(e) => setName(e.target.value)}></Input>
                </div>

                <div className="w-full">
                  <Label>
                    Mã sản phẩm
                    <RequiredMark></RequiredMark>
                  </Label>
                  <Input placeholder="VD: G-X-V-P" value={code} onChange={(e) => setCode(e.target.value)}></Input>
                </div>
              </div>

              <div className="mt-3">
                <Label>Mô tả</Label>
                <Textarea placeholder="VD: Tựa lưng trung thiết kế bảo vệ sức khỏe, giúp nâng đỡ bộ phận cột sống và vùng thắt lưng an toàn, hạn chế nhức mỏi khi ngồi làm việc lâu" value={description} onChange={(e) => setDescription(e.target.value)}></Textarea>
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
                    <CategoryCombobox value={currentCategory} onChange={setCurrentCategory} onSelectItem={setCurrentCategoryItem} onCategoriesLoaded={handleCategoriesLoaded} excludeIds={selectedCategories.map((cat) => cat.id)} />
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
                <Switch id="CanBeSold-mode" checked={canBeSold} onCheckedChange={setCanBeSold} />
              </div>
              <div className="flex justify-between">
                <div className="mt-2">
                  <p className="font-medium">Có thể mua</p>
                  <Label className="text-foreground/70">Sản phẩm có thể mua từ nhà cung cấp</Label>
                </div>
                <Switch id="CanBePurchased-mode" checked={canBePurchased} onCheckedChange={setCanBePurchased} />
              </div>
              <div className="flex justify-between">
                <div className="mt-2">
                  <p className="font-medium">Có thể sản xuất</p>
                  <Label className="text-foreground/70">Sản phẩm có thể được sản xuất</Label>
                </div>
                <Switch id="CanBeManufactured-mode" checked={canBeManufactured} onCheckedChange={setCanBeManufactured} />
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
                <div className="relative">
                  <Input value={formatCurrency(costPrice)} onChange={handleCostPriceChange} placeholder="0"></Input>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                </div>
              </div>

              <div className="w-full mt-2">
                <Label>
                  Giá bán
                  <RequiredMark></RequiredMark>
                </Label>
                <div className="relative">
                  <Input value={formatCurrency(priceReference)} onChange={handlePriceReferenceChange} placeholder="0"></Input>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">đ</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-5 justify-end mt-5">
            <ActionButton action="cancel"></ActionButton>
            <ActionButton action="save" onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Đang lưu..." : undefined}
            </ActionButton>
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
