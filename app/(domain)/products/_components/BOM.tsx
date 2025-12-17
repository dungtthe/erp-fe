"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import ActionButton from "@/my-components/btn/ActionButton";
import MaterialCombobox, { Material } from "@/my-components/domains/MaterialCombobox";
import UnitOfMeasureCombobox from "@/my-components/domains/UnitOfMeasureCombobox";
import VariantMultiSelect, { Variant } from "@/my-components/domains/VariantMultiSelect";
import { Trash2 } from "lucide-react";
import { useState } from "react";

type BOMItem = {
    id: string;
    materialId: string | number;
    materialName: string;
    qty: number;
    uom: string;
    applyTo: string[]; // List of variant IDs. If empty or contains 'all', means all? Let's be explicit.
};

// Mock variants (In real app, pass this as prop from parent)
const MOCK_VARIANTS: Variant[] = [
    { id: "SKU-1", name: "Biến thể 1 (Đỏ/S)" },
    { id: "SKU-2", name: "Biến thể 2 (Vàng/M)" },
    { id: "SKU-3", name: "Biến thể 3 (Xanh/L)" },
];



export default function BOM() {
    const [bomItems, setBomItems] = useState<BOMItem[]>([
        { id: "1", materialId: "m1", materialName: "Mặt bàn gỗ MDF", qty: 1, uom: "Cái", applyTo: ["all"] },
        // 'all' is a special key for "All Variants"
    ]);

    const handleAddRow = () => {
        setBomItems([
            ...bomItems,
            {
                id: Math.random().toString(36).substr(2, 9),
                materialId: "",
                materialName: "",
                qty: 1,
                uom: "",
                applyTo: [],
            },
        ]);
    };

    const handleRemoveRow = (id: string) => {
        setBomItems(bomItems.filter((item) => item.id !== id));
    };

    const updateItem = (id: string, updates: Partial<BOMItem>) => {
        setBomItems(bomItems.map((item) => (item.id === id ? { ...item, ...updates } : item)));
    };

    // Calculate which variants are already used for a specific material across OTHER rows
    const getDisabledVariants = (itemId: string, materialId: string | number) => {
        if (!materialId) return [];
        const used = new Set<string>();
        bomItems.forEach((row) => {
            if (row.id !== itemId && row.materialId === materialId) {
                if (row.applyTo.includes("all")) {
                    MOCK_VARIANTS.forEach((v) => used.add(v.id));
                } else {
                    row.applyTo.forEach((vid) => used.add(vid));
                }
            }
        });
        return Array.from(used);
    };

    const handleMaterialSelect = (itemId: string, material: Material | null) => {
        if (material) {
            // Check for conflicts with current filtered variants
            const disabledForNewMat = getDisabledVariants(itemId, material.id);

            setBomItems((prev) => prev.map(item => {
                if (item.id === itemId) {
                    let newApplyTo = item.applyTo;
                    // If previously "all", we need to see if "all" is still allowed.
                    // If any mock variant is in disabledForNewMat, "all" is effectively invalid for THOSE variants.
                    // We should convert "all" to specific list minus disabled ones.

                    if (newApplyTo.includes("all")) {
                        const allIds = MOCK_VARIANTS.map(v => v.id);
                        newApplyTo = allIds.filter(id => !disabledForNewMat.includes(id));
                    } else {
                        newApplyTo = newApplyTo.filter(id => !disabledForNewMat.includes(id));
                    }

                    return {
                        ...item,
                        materialId: material.id,
                        materialName: material.value,
                        uom: material.uom,
                        applyTo: newApplyTo
                    };
                }
                return item;
            }));

        } else {
            updateItem(itemId, {
                materialId: "",
                materialName: "",
                uom: "",
                applyTo: [], // Clear applyTo if no material
            });
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                        <CardTitle>Thành phần nguyên liệu</CardTitle>
                        <ActionButton action="create" onClick={handleAddRow}>Thêm dòng</ActionButton>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs text-slate-500  bg-slate-50 border-b border-slate-200">
                            <tr>
                                <th className="px-6 py-3 font-medium w-1/3">Nguyên liệu</th>
                                <th className="px-6 py-3 font-medium w-30">Số lượng</th>
                                <th className="px-6 py-3 font-medium w-24">ĐVT</th>
                                <th className="px-6 py-3 font-medium min-w-[200px]">Áp dụng cho biến thể</th>
                                <th className="px-6 py-3 font-medium w-16"></th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {bomItems.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-50 group">
                                    <td className="px-6 py-3 font-medium text-slate-700">
                                        <div className="flex items-center gap-2">
                                            <MaterialCombobox
                                                value={item.materialId}
                                                onChange={(val) => {
                                                    // Handled in onSelectMaterial
                                                    if (!val) updateItem(item.id, { materialId: "", materialName: "", uom: "" });
                                                }}
                                                onSelectMaterial={(mat) => handleMaterialSelect(item.id, mat)}
                                                className="w-full bg-transparent p-0 h-9"
                                            />
                                        </div>
                                    </td>
                                    <td className="px-6 py-3">
                                        <Input
                                            type="number"
                                            value={item.qty}
                                            onChange={(e) => updateItem(item.id, { qty: parseFloat(e.target.value) || 0 })}
                                            className="h-8 w-full font-mono"
                                        />
                                    </td>
                                    <td className="px-3 py-3 text-slate-700">
                                        <UnitOfMeasureCombobox
                                            value={item.uom}
                                            onChange={(val) => updateItem(item.id, { uom: val as string })}
                                        />
                                    </td>
                                    <td className="px-3 py-4 bg-transparent" >
                                        <VariantMultiSelect
                                            selected={item.applyTo}
                                            onChange={(newVal) => updateItem(item.id, { applyTo: newVal })}
                                            variants={MOCK_VARIANTS}
                                            disabledVariants={getDisabledVariants(item.id, item.materialId)}
                                        />
                                    </td>
                                    <td className="px-6 py-3">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleRemoveRow(item.id)}
                                        >
                                            <Trash2 size={16} />
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                            {bomItems.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                                        Chưa có nguyên liệu nào. Nhấn Thêm dòng để bắt đầu.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </CardContent>
                <CardFooter className="flex justify-end mt-5">
                    {bomItems.length > 0 && (
                        <div className="flex gap-5">
                            <ActionButton action="cancel" />
                            <ActionButton action="save" />
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}
