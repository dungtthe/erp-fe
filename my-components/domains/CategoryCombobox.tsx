"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";
import { api } from "@/lib/api";

interface CategoryComboboxProps {
  value?: string | number;
  onChange?: (value: string | number) => void;
  onSelectItem?: (item: ComboboxItem | null) => void;
  onCategoriesLoaded?: (categories: ComboboxItem[]) => void;
  disabled?: boolean;
  className?: string;
  excludeIds?: (string | number)[];
}

interface CategoryApiResponse {
  id: string;
  name: string;
  sortOrder: number;
}

export default function CategoryCombobox({ value, onChange, onSelectItem, onCategoriesLoaded, disabled = false, className, excludeIds = [] }: CategoryComboboxProps) {
  const [loading, setLoading] = React.useState(false);
  const [categories, setCategories] = React.useState<ComboboxItem[]>([]);

  React.useEffect(() => {
    const fetchCategories = async () => {
      setLoading(true);
      const response = await api.get<CategoryApiResponse[]>("/categories/leaf");
      if (response.success) {
        const data = response.data || [];
        const mappedCategories: ComboboxItem[] = data.map((cat) => ({
          id: cat.id,
          value: cat.name,
        }));
        setCategories(mappedCategories);
        onCategoriesLoaded?.(mappedCategories);
      } else {
        console.error("Failed to fetch categories:", response.error);
      }
      setLoading(false);
    };
    fetchCategories();
  }, []);

  const availableCategories = categories.filter((cat) => !excludeIds.includes(cat.id));

  const handleChange = (selectedId: string | number) => {
    onChange?.(selectedId);
    const selectedItem = categories.find((cat) => cat.id === selectedId);
    onSelectItem?.(selectedItem || null);
  };

  return <MyCombobox items={availableCategories} value={value} onChange={handleChange} placeholder="Chọn danh mục..." searchPlaceholder="Tìm danh mục..." emptyText={loading ? "Đang tải..." : "Không tìm thấy danh mục."} disabled={disabled || loading} className={className} width="w-full" />;
}
