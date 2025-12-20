"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";

interface AttributeValueComboboxProps {
  attributeId: string;
  attributeName: string;
  availableValues: { id: string; value: string }[];
  onSelectItem?: (item: ComboboxItem | null) => void;
  disabled?: boolean;
  className?: string;
  excludeValueIds?: string[];
}

export default function AttributeValueCombobox({ attributeName, availableValues, onSelectItem, disabled = false, className, excludeValueIds = [] }: AttributeValueComboboxProps) {
  const [currentValue, setCurrentValue] = React.useState<string | number>("");

  const filteredValues = availableValues.filter((val) => !excludeValueIds.includes(val.id));

  const comboboxItems: ComboboxItem[] = filteredValues.map((val) => ({
    id: val.id,
    value: val.value,
  }));

  const handleChange = (selectedId: string | number) => {
    setCurrentValue(selectedId);
    const selectedItem = availableValues.find((val) => val.id === selectedId);
    onSelectItem?.(selectedItem || null);
    setCurrentValue("");
  };

  return <MyCombobox items={comboboxItems} value={currentValue} onChange={handleChange} placeholder={excludeValueIds.length === 0 ? "Chọn giá trị..." : "+ Thêm"} searchPlaceholder="Tìm giá trị..." emptyText={!attributeName ? "Chọn thuộc tính trước" : "Không tìm thấy giá trị."} disabled={disabled || !attributeName || comboboxItems.length === 0} className={className} width="w-full" allowClear={false} />;
}
