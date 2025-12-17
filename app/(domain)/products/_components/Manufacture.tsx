"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import ActionButton from "@/my-components/btn/ActionButton";
import VariantMultiSelect from "@/my-components/domains/VariantMultiSelect";
import { MoreHorizontal, Pencil, Save, Trash2, X } from "lucide-react";
import { useState } from "react";

// Mock variants for the dropdown (Excluding "all" because component handles it)
const VARIANTS = [
    { id: "v1", name: "Tiêu chuẩn (Mặc định)" },
    { id: "v2", name: "Hoàn thiện cao cấp" },
    { id: "v3", name: "Eco/Tái chế" },
];

export type Operation = {
    id: string;
    name: string;
    duration: string; // hh:mm
    variantIds: string[];
};

export default function Manufacture() {
    const [operations, setOperations] = useState<Operation[]>([
        { id: "1", name: "Chuẩn bị nguyên liệu", duration: "00:30", variantIds: ["all"] },
        { id: "2", name: "Lắp ráp", duration: "02:00", variantIds: ["v1"] },
        { id: "3", name: "Kiểm tra chất lượng", duration: "00:15", variantIds: ["all"] },
    ]);

    const [editingId, setEditingId] = useState<string | null>(null);
    // Temporary state for the row being edited
    const [tempRowData, setTempRowData] = useState<Operation | null>(null);

    const handleAddOperation = () => {
        const newId = Math.random().toString(36).substr(2, 9);
        const newOp: Operation = {
            id: newId,
            name: "",
            duration: "00:00",
            variantIds: [],
        };

        setOperations([...operations, newOp]);
        startEditing(newOp);
    };

    const startEditing = (op: Operation) => {
        setEditingId(op.id);
        setTempRowData({ ...op });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setTempRowData(null);
    };

    const saveRow = () => {
        if (!tempRowData) return;

        setOperations((prev) =>
            prev.map((op) => (op.id === tempRowData.id ? tempRowData : op))
        );
        setEditingId(null);
        setTempRowData(null);
    };

    const deleteRow = (id: string) => {
        setOperations((prev) => prev.filter((op) => op.id !== id));
        if (editingId === id) {
            cancelEditing();
        }
    };

    const handleFieldChange = (field: keyof Operation, value: any) => {
        if (tempRowData) {
            setTempRowData({ ...tempRowData, [field]: value });
        }
    };

    return (
        <div className="w-full space-y-6">
            <Card className="border-border bg-card text-card-foreground shadow-sm">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border pb-6">
                    <div className="space-y-1">
                        <CardTitle className="text-2xl font-semibold tracking-tight">Quy trình sản xuất</CardTitle>
                    </div>
                    <ActionButton action="create" onClick={handleAddOperation}>Thêm công đoạn</ActionButton>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="w-full overflow-auto">
                        <table className="w-full caption-bottom text-sm text-left">
                            <thead className="[&_tr]:border-b bg-muted/40">
                                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted border-border">
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground min-w-[200px]">
                                        Tên công đoạn
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground w-[150px]">
                                        Thời gian (phút)
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground w-[300px]">
                                        Áp dụng biến thể
                                    </th>
                                    <th className="h-12 px-6 align-middle font-medium text-muted-foreground w-[80px] text-right">

                                    </th>
                                </tr>
                            </thead>
                            <tbody className="[&_tr:last-child]:border-0">
                                {operations.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="h-24 text-center text-muted-foreground">
                                            Chưa có công đoạn nào. Click "Thêm công đoạn" để thêm mới 1 công đoạn
                                        </td>
                                    </tr>
                                ) : (
                                    operations.map((op) => {
                                        const isEditing = editingId === op.id;
                                        const data = isEditing && tempRowData ? tempRowData : op;

                                        return (
                                            <tr
                                                key={op.id}
                                                className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted group border-border"
                                            >
                                                <td className="p-4 px-6 align-middle">
                                                    {isEditing ? (
                                                        <Input
                                                            value={data.name}
                                                            onChange={(e) => handleFieldChange("name", e.target.value)}
                                                            placeholder="Nhập tên công đoạn"
                                                            className="h-9 bg-background"
                                                            autoFocus
                                                        />
                                                    ) : (
                                                        <span className="font-medium text-foreground">{op.name || "Chưa đặt tên"}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 align-middle">
                                                    {isEditing ? (
                                                        <Input
                                                            type="time"
                                                            value={data.duration}
                                                            onChange={(e) => handleFieldChange("duration", e.target.value)}
                                                            className="h-9 bg-background"
                                                        />
                                                    ) : (
                                                        <span className="font-mono text-muted-foreground">{op.duration}</span>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 align-middle">
                                                    {isEditing ? (
                                                        <VariantMultiSelect
                                                            selected={data.variantIds}
                                                            onChange={(val) => handleFieldChange("variantIds", val)}
                                                            variants={VARIANTS}
                                                        />
                                                    ) : (
                                                        <div className="flex flex-wrap items-center gap-1">
                                                            {op.variantIds.includes("all") ? (
                                                                <Badge variant="secondary" className="font-medium bg-primary/10 text-primary hover:bg-primary/20">
                                                                    Tất cả biến thể
                                                                </Badge>
                                                            ) : (
                                                                op.variantIds.map(id => {
                                                                    const variant = VARIANTS.find(v => v.id === id);
                                                                    return (
                                                                        <Badge
                                                                            key={id}
                                                                            variant="secondary"
                                                                            className="font-medium"
                                                                        >
                                                                            {variant?.name || id}
                                                                        </Badge>
                                                                    );
                                                                })
                                                            )}
                                                        </div>
                                                    )}
                                                </td>
                                                <td className="p-4 px-6 align-middle text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button
                                                                variant="ghost"
                                                                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                            >
                                                                <span className="sr-only">Open menu</span>
                                                                <MoreHorizontal className="h-4 w-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-[160px]">
                                                            <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                                                            {isEditing ? (
                                                                <>
                                                                    <DropdownMenuItem onClick={saveRow}>
                                                                        <Save className="mr-2 h-4 w-4" />
                                                                        Lưu thay đổi
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem onClick={cancelEditing}>
                                                                        <X className="mr-2 h-4 w-4" />
                                                                        Hủy
                                                                    </DropdownMenuItem>
                                                                </>
                                                            ) : (
                                                                <>
                                                                    <DropdownMenuItem onClick={() => startEditing(op)}>
                                                                        <Pencil className="mr-2 h-4 w-4" />
                                                                        Sửa
                                                                    </DropdownMenuItem>
                                                                    <DropdownMenuItem
                                                                        onClick={() => deleteRow(op.id)}
                                                                        className="text-destructive focus:text-destructive"
                                                                    >
                                                                        <Trash2 className="mr-2 h-4 w-4" />
                                                                        Xóa
                                                                    </DropdownMenuItem>
                                                                </>
                                                            )}
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

        </div>
    );
}
