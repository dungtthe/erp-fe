"use client";
import * as React from "react";
import MyCombobox, { ComboboxItem } from "@/my-components/combobox/my-combobox";
import { api } from "@/lib/api";

export interface Material extends ComboboxItem {
    uom: string;
}

interface MaterialComboboxProps {
    value?: string | number;
    onChange?: (value: string | number) => void;
    onSelectMaterial?: (material: Material | null) => void;
    disabled?: boolean;
    className?: string;
    excludeIds?: (string | number)[];
}

interface ProductApiResponse {
    id: string;
    name: string;
    uom: string;
}

export default function MaterialCombobox({
    value,
    onChange,
    onSelectMaterial,
    disabled = false,
    className,
    excludeIds = [],
}: MaterialComboboxProps) {
    const [loading, setLoading] = React.useState(false);
    const [materials, setMaterials] = React.useState<Material[]>([]);

    React.useEffect(() => {
        const fetchMaterials = async () => {
            setLoading(true);
            try {
                const response = await api.get<ProductApiResponse[]>("/products");
                if (response.success) {
                    const data = response.data || [];
                    const mappedMaterials: Material[] = data.map((prod) => ({
                        id: prod.id,
                        value: prod.name,
                        uom: prod.uom || "Cái",
                    }));
                    setMaterials(mappedMaterials);
                } else {
                    console.warn("Failed to fetch materials, using mock data");
                    setMaterials([
                        { id: "m1", value: "Gỗ MDF", uom: "m2" },
                        { id: "m2", value: "Sắt hộp 30x30", uom: "mét" },
                        { id: "m3", value: "Sơn PU", uom: "lít" },
                        { id: "m4", value: "Ốc vít", uom: "cái" },
                    ]);
                }
            } catch (e) {
                console.error(e);
                setMaterials([
                    { id: "m1", value: "Gỗ MDF", uom: "m2" },
                    { id: "m2", value: "Sắt hộp 30x30", uom: "mét" },
                    { id: "m3", value: "Sơn PU", uom: "lít" },
                    { id: "m4", value: "Ốc vít", uom: "cái" },
                ]);
            }
            setLoading(false);
        };
        fetchMaterials();
    }, []);

    const availableMaterials = materials.filter((m) => !excludeIds.includes(m.id));

    const handleChange = (selectedId: string | number) => {
        onChange?.(selectedId);
        const selectedMaterial = materials.find((m) => m.id === selectedId);
        onSelectMaterial?.(selectedMaterial || null);
    };

    return (
        <MyCombobox
            items={availableMaterials}
            value={value}
            onChange={handleChange}
            placeholder="Chọn nguyên liệu..."
            searchPlaceholder="Tìm nguyên liệu..."
            emptyText={loading ? "Đang tải..." : "Không tìm thấy nguyên liệu."}
            disabled={disabled || loading}
            className={className}
            width="w-full"
        />
    );
}
