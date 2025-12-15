"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";

interface CategoryComboboxProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  onSelectItem?: (item: ComboboxItem | null) => void;
  disabled?: boolean;
  className?: string;
  excludeIds?: (string | number)[];
}

// mock
const categories: ComboboxItem[] = [
  { id: "a1b2c3d4-e5f6-4a5b-8c7d-9e0f1a2b3c4d", value: "Điện tử" },
  { id: "b2c3d4e5-f6a7-4b5c-9d8e-0f1a2b3c4d5e", value: "Thời trang" },
  { id: "c3d4e5f6-a7b8-4c5d-0e9f-1a2b3c4d5e6f", value: "Thực phẩm" },
  { id: "d4e5f6a7-b8c9-4d5e-1f0a-2b3c4d5e6f7a", value: "Nội thất" },
  { id: "e5f6a7b8-c9d0-4e5f-2a1b-3c4d5e6f7a8b", value: "Đồ gia dụng" },
  { id: "f6a7b8c9-d0e1-4f5a-3b2c-4d5e6f7a8b9c", value: "Sách và văn phòng phẩm" },
];

export default function CategoryCombobox({ value, onChange, onSelectItem, disabled = false, className, excludeIds = [] }: CategoryComboboxProps) {
  const availableCategories = categories.filter((cat) => !excludeIds.includes(cat.id));

  const handleChange = (selectedId: string | number) => {
    onChange?.(selectedId);
    const selectedItem = categories.find((cat) => cat.id === selectedId);
    onSelectItem?.(selectedItem || null);
  };

  return <MyCombobox items={availableCategories} value={value} onChange={handleChange} placeholder="Chọn danh mục..." searchPlaceholder="Tìm danh mục..." emptyText="Không tìm thấy danh mục." disabled={disabled} className={className} width="w-full" />;
}
