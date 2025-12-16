"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";
import { api } from "@/lib/api";

interface UnitOfMeasureComboboxProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  disabled?: boolean;
  className?: string;
}

interface UnitOfMeasureApiResponse {
  id: string;
  name: string;
}

export default function UnitOfMeasureCombobox({ value, onChange, disabled = false, className }: UnitOfMeasureComboboxProps) {
  const [loading, setLoading] = React.useState(false);
  const [unitOfMeasures, setUnitOfMeasures] = React.useState<ComboboxItem[]>([]);

  React.useEffect(() => {
    const fetchUnitOfMeasures = async () => {
      setLoading(true);
      const response = await api.get<UnitOfMeasureApiResponse[]>("/unit-of-measure");
      if (response.success) {
        const data = response.data || [];
        const mappedUnits: ComboboxItem[] = data.map((unit) => ({
          id: unit.id,
          value: unit.name,
        }));
        setUnitOfMeasures(mappedUnits);
      } else {
        console.error("Failed to fetch unit of measures:", response.error);
      }
      setLoading(false);
    };
    fetchUnitOfMeasures();
  }, []);

  return <MyCombobox items={unitOfMeasures} value={value} onChange={onChange} placeholder="Chọn đơn vị tính..." searchPlaceholder="Tìm đơn vị tính..." emptyText={loading ? "Đang tải..." : "Không tìm thấy đơn vị tính."} disabled={disabled || loading} className={className} width="w-full" />;
}
