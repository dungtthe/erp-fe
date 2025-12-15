"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";

interface UnitOfMeasureComboboxProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
}

export default function UnitOfMeasureCombobox({ value, onChange, disabled = false, className }: UnitOfMeasureComboboxProps) {
  //mockdata
  const unitOfMeasures: ComboboxItem[] = [
    { id: "7a8b9c0d-1e2f-4a3b-4c5d-6e7f8a9b0c1d", value: "Cái" },
    { id: "8b9c0d1e-2f3a-4b4c-5d6e-7f8a9b0c1d2e", value: "Chiếc" },
    { id: "9c0d1e2f-3a4b-4c5d-6e7f-8a9b0c1d2e3f", value: "Bộ" },
    { id: "0d1e2f3a-4b5c-4d6e-7f8a-9b0c1d2e3f4a", value: "Hộp" },
    { id: "1e2f3a4b-5c6d-4e7f-8a9b-0c1d2e3f4a5b", value: "Thùng" },
    { id: "2f3a4b5c-6d7e-4f8a-9b0c-1d2e3f4a5b6c", value: "Kg" },
    { id: "3a4b5c6d-7e8f-4a9b-0c1d-2e3f4a5b6c7d", value: "Gram" },
    { id: "4b5c6d7e-8f9a-4b0c-1d2e-3f4a5b6c7d8e", value: "Lít" },
    { id: "5c6d7e8f-9a0b-4c1d-2e3f-4a5b6c7d8e9f", value: "Mét" },
    { id: "6d7e8f9a-0b1c-4d2e-3f4a-5b6c7d8e9f0a", value: "M²" },
    { id: "7e8f9a0b-1c2d-4e3f-4a5b-6c7d8e9f0a1b", value: "M³" },
  ];

  return <MyCombobox items={unitOfMeasures} value={value} onChange={onChange} placeholder="Chọn đơn vị tính..." searchPlaceholder="Tìm đơn vị tính..." emptyText="Không tìm thấy đơn vị tính." disabled={disabled} className={className} width="w-full" />;
}
