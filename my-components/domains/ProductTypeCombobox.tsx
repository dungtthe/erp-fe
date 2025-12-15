"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";

interface ProductTypeComboboxProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
}

export default function ProductTypeCombobox({ value, onChange, disabled = false, className }: ProductTypeComboboxProps) {
  //mockdata
  const productTypes: ComboboxItem[] = [
    { id: "1a2b3c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d", value: "Hàng hóa" },
    { id: "2b3c4d5e-6f7a-4b8c-9d0e-1f2a3b4c5d6e", value: "Dịch vụ" },
    { id: "3c4d5e6f-7a8b-4c9d-0e1f-2a3b4c5d6e7f", value: "Combo" },
    { id: "4d5e6f7a-8b9c-4d0e-1f2a-3b4c5d6e7f8a", value: "Nguyên vật liệu" },
    { id: "5e6f7a8b-9c0d-4e1f-2a3b-4c5d6e7f8a9b", value: "Thành phẩm" },
    { id: "6f7a8b9c-0d1e-4f2a-3b4c-5d6e7f8a9b0c", value: "Bán thành phẩm" },
  ];

  return <MyCombobox items={productTypes} value={value} onChange={onChange} placeholder="Chọn loại sản phẩm..." searchPlaceholder="Tìm loại sản phẩm..." emptyText="Không tìm thấy loại sản phẩm." disabled={disabled} className={className} width="w-full" />;
}
