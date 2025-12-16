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
    { id: 1, value: "Thành phẩm" },
    { id: 2, value: "Bán thành phẩm" },
    { id: 3, value: "Nguyên vật liệu" },
    { id: 4, value: "Tiêu hao" },
  ];

  return <MyCombobox items={productTypes} value={value} onChange={onChange} placeholder="Chọn loại sản phẩm..." searchPlaceholder="Tìm loại sản phẩm..." emptyText="Không tìm thấy loại sản phẩm." disabled={disabled} className={className} width="w-full" />;
}
