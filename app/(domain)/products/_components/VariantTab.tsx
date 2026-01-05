"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverTrigger
} from "@/components/ui/popover";
import ActionButton from "@/my-components/btn/ActionButton";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export type Variant = {
    name: string;
    sku: string;
    priceReferences: number;
    costPrice: number;
    weight: number;
    length: number;
    width: number;
    height: number;
    volume: number;
    attributes: Record<string, string>;
};

export default function VariantTab() {
    const product = { name: "Sản phẩm A" };

    const [variants, setVariants] = useState<Variant[]>([
        {
            sku: "SKU-1",
            name: "Biến thể 1",
            priceReferences: 200,
            costPrice: 600,
            weight: 1,
            length: 1,
            width: 1,
            height: 1,
            volume: 1,
            attributes: {
                "Màu sắc": "Đỏ",
                "Kích thước": "S"
            },

        },
        {
            sku: "SKU-2",
            name: "Biến thể 2",
            priceReferences: 300,
            costPrice: 500,
            weight: 1,
            length: 1,
            width: 1,
            height: 1,
            volume: 1,
            attributes: {
                "Màu sắc": "Vàng",
                "Kích thước": "M"
            },
        }
    ]);

    return (
        <div>
            <Card className="mt-5" >
                <CardHeader className="border-b pb-4">
                    <div className="flex justify-between items-center">
                        <CardTitle>Danh sách biến thể</CardTitle>

                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="px-6 py-3 font-medium">Tên</th>
                                    <th className="px-6 py-3 font-medium">SKU</th>
                                    <th className="px-6 py-3 font-medium">Giá trị biến thể</th>
                                    <th className="px-6 py-3 font-medium">Giá sản xuất</th>
                                    <th className="px-6 py-3 font-medium">Giá bán </th>
                                    <th className="px-6 py-3 font-medium">Cân nặng</th>
                                    <th className="px-6 py-3 font-medium"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {variants.map((v, i) => (
                                    <tr key={v.sku} className="hover:bg-slate-50 group transition-colors">
                                        <td className="px-6 py-3">
                                            <div className="font-medium text-slate-900">{product.name}</div>
                                        </td>
                                        <td className="px-6 py-3">
                                            <Input
                                                className="h-8 font-mono text-xs bg-slate-50 border-slate-200 w-32"
                                                value={v.sku}
                                                disabled
                                            />
                                        </td>

                                        <td className="px-6 py-3">
                                            <div className="flex flex-wrap gap-1 mt-0.5 w-full">
                                                {Object.entries(v.attributes).map(([key, val]) => (
                                                    <span key={key} className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 border border-slate-200">
                                                        {key}: {val}
                                                    </span>
                                                ))}
                                            </div>
                                        </td>

                                        <td className="px-6 py-3">
                                            <Input
                                                className="h-8 w-20 ml-auto"
                                                type="number"
                                                value={v.priceReferences}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[i].priceReferences = Number(e.target.value);
                                                    setVariants(newVariants);
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-3">
                                            <Input
                                                className="h-8 w-20 ml-auto"
                                                type="number"
                                                value={v.costPrice}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[i].costPrice = Number(e.target.value);
                                                    setVariants(newVariants);
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-3">
                                            <Input
                                                className="h-8 w-16 ml-auto"
                                                type="number"
                                                value={v.weight}
                                                onChange={(e) => {
                                                    const newVariants = [...variants];
                                                    newVariants[i].weight = Number(e.target.value);
                                                    setVariants(newVariants);
                                                }}
                                            />
                                        </td>
                                        <td className="px-6 py-3 text-right">
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8"
                                                        onClick={() => {
                                                            toast.success("Đã click vào detail");
                                                        }}
                                                    >
                                                        <MoreHorizontal className="h-4 w-4" />
                                                    </Button>
                                                </PopoverTrigger>
                                            </Popover>
                                        </td>

                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end mt-5">
                    {variants.length > 0 && (
                        <div className="flex gap-5">
                            <ActionButton action="cancel" ></ActionButton>
                            <ActionButton action="save" ></ActionButton>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>)
}