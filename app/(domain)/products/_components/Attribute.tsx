"use client";

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ActionButton from "@/my-components/btn/ActionButton";
import { AttributeSelector } from "@/my-components/domains/AttributeSelector";
import { useEffect, useState } from "react";
import { getProductAttributes } from "../_services/productService";
import ToastManager from "@/helpers/ToastManager";

export type Attribute = {
  attributeId: string;
  valueIds: string[];
};

export default function Attribute({ productId }: { productId: string }) {
  const [attributes, setAttributes] = useState<Attribute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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
  };

  const handleSave = () => {
    console.log("Danh sách thuộc tính:");
    attributes.forEach((attr) => {
      console.log({
        attributeId: attr.attributeId,
        valueIds: attr.valueIds,
      });
    });
    console.log(productId);
    ToastManager.success("Lưu thành công");
  };
  return (
    <div>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between border-b pb-4">
          <CardTitle>Danh sách Thuộc tính</CardTitle>
          <ActionButton action="create" onClick={addAttribute}>
            Thêm thuộc tính
          </ActionButton>
        </CardHeader>
        <CardContent className="pt-6">
          {isLoading ? (
            <div className="text-center py-8 text-slate-500">Đang tải thuộc tính...</div>
          ) : (
            <div className="space-y-4">
              {attributes.map((attr, index) => {
                const otherAttributeIds = attributes.filter((a) => a.attributeId !== attr.attributeId).map((a) => a.attributeId);
                return <AttributeSelector key={attr.attributeId || `temp-${index}`} attributeId={attr.attributeId} selectedValueIds={attr.valueIds} onAttributeIdChange={updateAttributeId} onValueAdd={addAttributeValue} onValueRemove={removeAttributeValue} onRemoveAttribute={removeAttribute} disabledAttributeIds={otherAttributeIds} />;
              })}

              {attributes.length === 0 && <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">Chưa có thuộc tính nào được thêm</div>}
            </div>
          )}
        </CardContent>
        <CardFooter className="flex justify-end mt-5">
          {attributes.length > 0 && (
            <div className="flex gap-5">
              <ActionButton action="cancel" onClick={handleReset}></ActionButton>
              <ActionButton action="save" onClick={handleSave}></ActionButton>
            </div>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
