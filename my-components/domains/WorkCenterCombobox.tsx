"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";
import { api } from "@/lib/api";
import { useEffect, useState } from "react";


interface WorkCenterComboboxProps {
    value?: string | number;
    onChange?: (value: string | number) => void;
    onSelectItem?: (item: ComboboxItem | null) => void;
    onCategoriesLoaded?: (categories: ComboboxItem[]) => void;
    disabled?: boolean;
    className?: string;
    excludeIds?: (string | number)[];
}

interface WorkCenterApiResponse {
    id: string;
    name: string;
    description: string;
}

export default function WorkCenterCombobox({ value, onChange, onSelectItem, onCategoriesLoaded, disabled = false, className, excludeIds = [] }: WorkCenterComboboxProps) {
    const [loading, setLoading] = useState(false);
    const [categories, setCategories] = useState<ComboboxItem[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            setLoading(true);
            const response = await api.get<WorkCenterApiResponse[]>("/work-centers/leaf");
            if (response.success) {
                const data = response.data || [];
                const mappedCategories: ComboboxItem[] = data.map((cat) => ({
                    id: cat.id,
                    value: cat.name + " - " + cat.description,
                }));
                setCategories(mappedCategories);
                onCategoriesLoaded?.(mappedCategories);
            } else {
                console.error("Failed to fetch categories:", response.error);
                setCategories([
                    {
                        id: "1",
                        value: "Xưởng may - May",
                    },
                    {
                        id: "2",
                        value: "Xưởng khâu - Khâu",
                    },
                    {
                        id: "3",
                        value: "Xưởng sơn - Sơn",
                    },
                ]);
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

    return <MyCombobox items={availableCategories} value={value} onChange={handleChange} placeholder={"Chọn xưởng..."} searchPlaceholder="Tìm xưởng..." emptyText={loading ? "Đang tải..." : "Không tìm thấy xưởng."} disabled={disabled || loading} className={className} width="w-full" />;
}