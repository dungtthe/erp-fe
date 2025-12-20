"use client";

import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { api } from "@/lib/api";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import DeleteIcon from "../icons/DeleteIcon";
import AttributeValueCombobox from "./AttributeValueCombobox";

export type MasterAttributeValue = {
  id: string;
  value: string;
};

export type MasterAttribute = {
  id: string;
  attributeName: string;
  values: MasterAttributeValue[];
};

interface AttributeSelectorProps {
  attributeId: string;
  selectedValueIds: string[];
  onAttributeIdChange: (oldAttributeId: string, newAttributeId: string) => void;
  onValueAdd: (attributeId: string, valueId: string) => void;
  onValueRemove: (attributeId: string, valueId: string) => void;
  onRemoveAttribute: (attributeId: string) => void;
  disabledAttributeIds?: string[];
}

export function AttributeSelector({ attributeId, selectedValueIds, onAttributeIdChange, onValueAdd, onValueRemove, onRemoveAttribute, disabledAttributeIds = [] }: AttributeSelectorProps) {
  const [availableAttributes, setAvailableAttributes] = useState<MasterAttribute[]>([]);

  useEffect(() => {
    const fetchAttributes = async () => {
      try {
        const response = await api.get<MasterAttribute[]>("/attributes");
        if (response.success && response.data) {
          setAvailableAttributes(response.data);
        }
      } catch (error) {
        console.error("Error fetching attributes in selector:", error);
      }
    };
    fetchAttributes();
  }, []);

  const currentMasterAttr = availableAttributes.find((a) => a.id === attributeId);

  const handleValueSelect = (item: { id: string | number; value: string } | null) => {
    if (item && !selectedValueIds.includes(item.id as string)) {
      onValueAdd(attributeId, item.id as string);
    }
  };

  return (
    <div className="flex items-start gap-4 p-4 border rounded-lg bg-accent/50 relative group">
      <div className="w-1/4">
        <Label className="mb-2 block text-sm font-medium">Thuộc tính</Label>
        <Select value={attributeId} onValueChange={(val) => onAttributeIdChange(attributeId, val)}>
          <SelectTrigger className="bg-card">
            <SelectValue placeholder="Chọn thuộc tính" />
          </SelectTrigger>
          <SelectContent>
            {availableAttributes.map((attr) => {
              const isDisabled = disabledAttributeIds.includes(attr.id);
              return (
                <SelectItem key={attr.id} value={attr.id} disabled={isDisabled} className={isDisabled ? "opacity-50" : ""}>
                  {attr.attributeName} {isDisabled && "(Đã chọn)"}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>

      <div className="flex-1">
        <Label className="mb-2 block text-sm font-medium">Giá trị</Label>
        <div className="flex flex-wrap gap-2 items-center min-h-[40px] p-2 bg-card border rounded-md">
          {selectedValueIds.map((valueId) => {
            const valueObj = currentMasterAttr?.values.find((v) => v.id === valueId);
            return (
              <Badge key={valueId} variant="secondary" className="px-2 py-1 text-sm">
                {valueObj?.value || valueId}
                <button onClick={() => onValueRemove(attributeId, valueId)} className="ml-1 hover:text-destructive">
                  <X className="h-4 w-4" />
                </button>
              </Badge>
            );
          })}

          <AttributeValueCombobox attributeId={attributeId} attributeName={currentMasterAttr?.attributeName || ""} availableValues={currentMasterAttr?.values || []} onSelectItem={handleValueSelect} excludeValueIds={selectedValueIds} className="max-w-[150px]" />
        </div>
      </div>
      <DeleteIcon onClick={() => onRemoveAttribute(attributeId)}></DeleteIcon>
    </div>
  );
}
