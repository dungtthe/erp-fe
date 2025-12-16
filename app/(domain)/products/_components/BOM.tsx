"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import ActionButton from "@/my-components/btn/ActionButton";
import MaterialCombobox, { Material } from "@/my-components/domains/MaterialCombobox";
import { Check, ChevronsUpDown, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";

// Validate types sharing or import from VariantTab if possible, but for standalone UI we mock/define here
type Variant = {
    id: string; // SKU or distinct ID
    name: string;
};

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
                applyTo: ["all"],
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
                        <Button variant="secondary" size="sm" className="gap-1" onClick={handleAddRow}>
                            <Plus size={14} /> Thêm dòng
                        </Button>
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
                                    <td className="px-6 py-3 text-slate-700">
                                        {item.uom || "-"}
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

function VariantMultiSelect({
    selected,
    onChange,
    variants,
    disabledVariants = []
}: {
    selected: string[];
    onChange: (val: string[]) => void;
    variants: Variant[];
    disabledVariants?: string[];
}) {
    const [open, setOpen] = useState(false);

    const isAll = selected.includes("all");

    // Helper to get variant name
    const getVariantName = (id: string) => {
        return variants.find(v => v.id === id)?.name || id;
    };

    const toggleVariant = (id: string, disabled: boolean) => {
        if (disabled) return;

        let newSelected = [...selected];

        if (id === "all") {
            if (isAll) {
                newSelected = [];
            } else {
                newSelected = variants.filter(v => !disabledVariants.includes(v.id)).map(v => v.id);
                if (disabledVariants.length === 0) {
                    newSelected = ["all"];
                }
            }
        } else {
            if (isAll) {
                const allIds = variants.map(v => v.id);
                newSelected = allIds;

                if (newSelected.includes(id)) {
                    newSelected = newSelected.filter(x => x !== id);
                } else {
                    newSelected.push(id);
                }
            } else {
                if (newSelected.includes(id)) {
                    newSelected = newSelected.filter(x => x !== id);
                } else {
                    newSelected.push(id);
                }
            }
        }

        if (id !== "all" && newSelected.includes("all")) {
            newSelected = newSelected.filter(x => x !== "all");
        }

        const allSpecificIds = variants.map(v => v.id);
        const selectedSpecifics = newSelected.filter(x => x !== "all");

        if (disabledVariants.length === 0 && selectedSpecifics.length === allSpecificIds.length && allSpecificIds.length > 0) {
            newSelected = ["all"];
        }

        onChange(newSelected);
    };

    const handleRemove = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        toggleVariant(id, false);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={open}
                    className="justify-between w-full h-auto min-h-[2.25rem] py-1 px-3 text-xs font-normal bg-white"
                >
                    <div className="flex flex-wrap gap-1 items-center w-full">
                        {isAll ? (
                            <Badge variant="secondary" className="rounded-full px-2 font-normal">
                                Tất cả biến thể
                                <div
                                    className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-slate-200"
                                    onClick={(e) => handleRemove(e, "all")}
                                >
                                    <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                </div>
                            </Badge>
                        ) : selected.length > 0 ? (
                            selected.map((id) => (
                                <Badge key={id} variant="secondary" className="rounded-full px-2 font-normal">
                                    {getVariantName(id)}
                                    <div
                                        className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 cursor-pointer hover:bg-slate-200"
                                        onClick={(e) => handleRemove(e, id)}
                                    >
                                        <X className="h-3 w-3 text-muted-foreground hover:text-foreground" />
                                    </div>
                                </Badge>
                            ))
                        ) : (
                            <span className="text-muted-foreground">Chọn biến thể</span>
                        )}
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 absolute right-30" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[300px] p-0" align="start">
                <Command>
                    <CommandInput placeholder="Tìm biến thể..." />
                    <CommandList>
                        <CommandEmpty>Không tìm thấy.</CommandEmpty>
                        <CommandGroup>
                            {variants.map((variant) => {
                                const isSelected = selected.includes(variant.id) || isAll;
                                const isDisabled = disabledVariants.includes(variant.id);
                                return (
                                    <CommandItem
                                        key={variant.id}
                                        value={variant.name}
                                        onSelect={() => toggleVariant(variant.id, isDisabled)}
                                        disabled={isDisabled}
                                        className={isDisabled ? "opacity-50 cursor-not-allowed text-muted-foreground" : ""}
                                    >
                                        <Check
                                            className={cn(
                                                "mr-2 h-4 w-4",
                                                isSelected ? "opacity-100" : "opacity-0"
                                            )}
                                        />
                                        <span className={isDisabled ? "line-through" : ""}>{variant.name}</span>
                                    </CommandItem>
                                );
                            })}
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
}
