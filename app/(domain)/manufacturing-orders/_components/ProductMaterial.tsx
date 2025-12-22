"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useEffect, useState } from 'react'
import { BOMMaterial, getBOM } from "../_services/manufacturingOrderService"



export default function ProductMaterial({ productVariantId }: { productVariantId?: string }) {
    const [materials, setMaterials] = useState<BOMMaterial[]>([])

    useEffect(() => {
        if (!productVariantId) {
            setMaterials([]);
            return;
        }
        fetchBOM(productVariantId);
    }, [productVariantId]);

    const fetchBOM = async (productVariantId: string) => {
        try {
            const response = await getBOM(productVariantId)
            if (response.success && response.data) {
                setMaterials(response.data.listMaterials)
            }
            else {
                setMaterials([]);
            }
        } catch (error) {
            console.error("Failed to fetch BOM for material:", error);
            setMaterials([]);
        }
    }
    return (
        <Card className="w-full border-border shadow-sm bg-card">
            <CardContent className="p-2">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                            <TableHead className="font-semibold">STT</TableHead>
                            <TableHead className="font-semibold">Nguyên vật liệu</TableHead>
                            <TableHead className="font-semibold">Số lượng</TableHead>
                            <TableHead className="font-semibold">Đơn vị</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.map((material, index) => (
                            <TableRow key={material.id} className="hover:bg-muted/50 transition-colors">
                                <TableCell>{index + 1}</TableCell>
                                <TableCell>{material.materialName}</TableCell>
                                <TableCell>{material.quantityRequired}</TableCell>
                                <TableCell>{material.unitOfMeasureName}</TableCell>
                            </TableRow>
                        ))}
                        {materials.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} className="h-32 text-center text-muted-foreground">
                                    {productVariantId ? "Sản phẩm chưa có BOM hoặc chưa có nguyên vật liệu." : "Vui lòng chọn sản phẩm để xem định mức."}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>
    )
}
