"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/my-components/btn/ActionButton";
import { AttributeSelector } from "@/my-components/domains/AttributeSelector";
import { useEffect, useState } from "react";
import { getProductAttributes, createOrUpdateProductAttributes } from "../_services/productService";
import ToastManager from "@/helpers/ToastManager";

export type Attribute = {
  attributeId: string;
  valueIds: string[];
};

export default function Attribute({ productId }: { productId: string }) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isShowbtnSaveCancel, setIsShowbtnSaveCancel] = useState(false);
  const [isCanEdit, setIsCanEdit] = useState(false);

  useEffect(() => {
    const loadAttributes = async () => {
      if (!productId) {
        setIsLoading(false);
        return;
      }

      try {
        const response = await getProductAttributes(productId);
        if (response.success && response.data) {
          const transformedAttributes: Attribute[] = response.data.map((attr) => ({
            attributeId: attr.attributeId,
            valueIds: attr.attributeValue.map((val) => val.attributeValueId),
          }));
          setAttributes(transformedAttributes);
          if (transformedAttributes.length === 0) {
            setIsCanEdit(true);
          }
        } else {
          ToastManager.error(response.error?.message || "Không thể tải thuộc tính");
        }
      } catch (error) {
        ToastManager.error("Đã xảy ra lỗi khi tải thuộc tính");
      } finally {
        setIsLoading(false);
      }
    };

    loadAttributes();
  }, [productId]);

  const addAttribute = () => {
    setAttributes([...attributes, { attributeId: "", valueIds: [] }]);
    setIsShowbtnSaveCancel(true);
  };

  const removeAttribute = (attributeId: string) => {
    setAttributes(attributes.filter((attr) => attr.attributeId !== attributeId));
  };

  const updateAttributeId = (oldAttributeId: string, newAttributeId: string) => {
    setAttributes(attributes.map((attr) => (attr.attributeId === oldAttributeId ? { ...attr, attributeId: newAttributeId, valueIds: [] } : attr)));
  };

  const addAttributeValue = (attributeId: string, valueId: string) => {
    if (!valueId) return;
    setAttributes(
      attributes.map((attr) => {
        if (attr.attributeId === attributeId && !attr.valueIds.includes(valueId)) {
          return { ...attr, valueIds: [...attr.valueIds, valueId] };
        }
        return attr;
      })
    );
  };

  const removeAttributeValue = (attributeId: string, valueIdToRemove: string) => {
    setAttributes(
      attributes.map((attr) => {
        if (attr.attributeId === attributeId) {
          return { ...attr, valueIds: attr.valueIds.filter((v) => v !== valueIdToRemove) };
        }
        return attr;
      })
    );
  };

  const handleReset = () => {
    setAttributes([]);
    setIsShowbtnSaveCancel(false);
  };

  const handleSave = async () => {
    if (!productId) {
      ToastManager.error("Không tìm thấy Product ID");
      return;
    }

    const invalidAttributes = attributes.filter((attr) => !attr.attributeId || attr.valueIds.length === 0);
    if (invalidAttributes.length > 0) {
      ToastManager.error("Vui lòng chọn thuộc tính và giá trị cho tất cả các mục");
      return;
    }

    const attributeValues: Record<string, string[]> = {};
    attributes.forEach((attr) => {
      attributeValues[attr.attributeId] = attr.valueIds;
    });

    setIsLoading(true);
    try {
      const response = await createOrUpdateProductAttributes({
        productId,
        attributeValues,
      });

      if (response.success) {
        ToastManager.success("Lưu thuộc tính thành công");
      } else {
        ToastManager.error(response.error?.message || "Không thể lưu thuộc tính");
      }
    } catch (error) {
      ToastManager.error("Đã xảy ra lỗi khi lưu thuộc tính");
    } finally {
      setIsLoading(false);
    }
  };
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Danh sách Thuộc tính</CardTitle>
          {isCanEdit && (
            <ActionButton action="create" onClick={addAttribute}>
              Thêm thuộc tính
            </ActionButton>
          )}
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8">Đang tải thuộc tính...</div>
          ) : (
            <div className="space-y-4">
              {attributes.map((attr, index) => {
                const otherAttributeIds = attributes.filter((a) => a.attributeId !== attr.attributeId).map((a) => a.attributeId);
                return <AttributeSelector key={attr.attributeId || `temp-${index}`} attributeId={attr.attributeId} selectedValueIds={attr.valueIds} onAttributeIdChange={updateAttributeId} onValueAdd={addAttributeValue} onValueRemove={removeAttributeValue} onRemoveAttribute={removeAttribute} disabledAttributeIds={otherAttributeIds} />;
              })}

              {attributes.length === 0 && <div className="text-center py-8 border border-dashed rounded-lg">Chưa có thuộc tính nào được thêm</div>}
            </div>
          )}
        </CardContent>
      </Card>
      {isShowbtnSaveCancel && (
        <div className="flex gap-5 justify-end mt-5">
          <ActionButton action="cancel" onClick={handleReset}></ActionButton>
          <ActionButton action="save" onClick={handleSave}></ActionButton>
        </div>
      )}
    </div>
  );
}
