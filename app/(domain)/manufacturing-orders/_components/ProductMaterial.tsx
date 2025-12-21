"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table"
import { useEffect, useState } from 'react'



interface Material {
    id: string
    name: string
    quantity: number
    unit: string
}

export default function ManufacturingStep() {
    // Initial sample data
    const [materials, setMaterials] = useState<Material[]>([
        { id: '1', name: 'Vải', quantity: 4, unit: 'm' },
        { id: '2', name: 'Kim', quantity: 12, unit: 'm' },
        { id: '3', name: 'Giấy', quantity: 2, unit: 'm' },
    ])

    const [newMaterial, setNewMaterial] = useState<Partial<Material> | null>(null)

    useEffect(() => {
        const interval = setInterval(() => {
            setMaterials(prev => prev.map(m => {
                if (m.quantity === 0) {
                    // Add 1 second (1/3600 hour)
                    return { ...m, quantity: m.quantity + (1 / 3600) }
                }
                return m
            }))
        }, 1000)

        return () => clearInterval(interval)
    }, [])




    return (
        <Card className="w-full border-slate-200 shadow-sm bg-white">
            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 bg-slate-50/50 border-b border-slate-100">

            </CardHeader>
            <CardContent className="p-0">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-slate-50 hover:bg-slate-50">
                            <TableHead className="w-[10%] text-xs font-semibold uppercase text-slate-500 tracking-wider">STT</TableHead>
                            <TableHead className="w-[30%] text-xs font-semibold uppercase text-slate-500 tracking-wider">Nguyên vật liệu</TableHead>
                            <TableHead className="w-[20%] text-xs font-semibold uppercase text-slate-500 tracking-wider">Số lượng</TableHead>
                            <TableHead className="w-[15%] text-xs font-semibold uppercase text-slate-500 tracking-wider ">Đơn vị</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {materials.map((material, index) => (
                            <TableRow key={material.id} className="hover:bg-slate-50/50 transition-colors">
                                <TableCell className="font-medium text-slate-700 py-3">{index + 1}</TableCell>
                                <TableCell className="font-medium text-slate-700 py-3">{material.name}</TableCell>
                                <TableCell className="text-slate-600 py-3">{material.quantity}</TableCell>
                                <TableCell className="text-slate-600 py-3">{material.unit}</TableCell>
                            </TableRow>
                        ))}
                        {materials.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-32 text-center text-slate-400">
                                    Chưa có nguyên vật liệu nào.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </CardContent>

            <CardFooter className="bg-slate-50/50 border-t border-slate-100 py-4 px-6 flex justify-end">

            </CardFooter>
        </Card>
    )
}
