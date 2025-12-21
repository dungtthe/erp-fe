"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import ActionButton from "@/my-components/btn/ActionButton"
import { ReactNode } from 'react'

interface InfoFieldProps {
    label: string
    value: ReactNode
}

function InfoField({ label, value }: InfoFieldProps) {
    return (
        <div className="flex space-y-1.5 group">
            <span className="font-semibold text-xs tracking-wider w-[120px]">{label} :</span>
            <span className=" text-slate-900 text-sm pl-3">{value}</span>
        </div>
    )
}

export default function ManufacturingInformation({ mode, manufacturingOrderId }: { mode: "create" | "detail"; manufacturingOrderId?: string }) {

    const orderData = {
        code: manufacturingOrderId || "MO-2024-001",
        productName: "Áo sơ mi nam Basic - Size M",
        quantity: "500 Cái",
        startDate: "20/12/2024",
        endDate: "25/12/2024",
        bom: "BOM-ASM-01 (Ver 2.0)",
        pic: "Nguyễn Văn A"
    }

    return (
        <Card className="w-full border-slate-200 shadow-sm overflow-hidden bg-white">
            <CardHeader className="flex items-center justify-between py-1 px-6 bg-slate-50/50 border-b border-slate-100">
                <div className="flex items-center gap-3">
                    <ActionButton action="save" size="sm">
                        Xác nhận
                    </ActionButton>
                    <ActionButton action="cancel" size="sm">
                        Hủy
                    </ActionButton>
                </div>
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-slate-200/60 text-slate-600 hover:bg-slate-200/80 px-3 py-1 text-xs font-semibold tracking-wide">
                        Bản nháp
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12">
                    {/* Left Column */}
                    <div className="space-y-6">
                        <InfoField
                            label="Mã lệnh sản xuất"
                            value={orderData.code}
                        />
                        <InfoField
                            label="Sản phẩm"
                            value={orderData.productName}
                        />
                        <InfoField
                            label="Số lượng"
                            value={orderData.quantity}
                        />
                    </div>

                    <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-2">
                            <InfoField
                                label="Ngày bắt đầu"
                                value={orderData.startDate}
                            />
                            <InfoField
                                label="Ngày kết thúc"
                                value={orderData.endDate}
                            />
                        </div>
                        <InfoField
                            label="BOM (Định mức)"
                            value={<span className="hover:underline cursor-pointer">{orderData.bom}</span>}
                        />
                        <InfoField
                            label="Người phụ trách"
                            value={orderData.pic}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
