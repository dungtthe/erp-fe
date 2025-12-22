"use client"

import { Badge } from "@/components/ui/badge"
import { Calendar } from "@/components/ui/calendar"
import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import ActionButton from "@/my-components/btn/ActionButton"
import DatePicker from "@/my-components/datepicker/DatePicker"
import ProductListDialog from "@/my-components/domains/ProductListDialog"
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Product } from "../../products/_services/productService"
import { getBOM, getProductVariants, ProductVariant } from "../_services/manufacturingOrderService"

interface InfoFieldProps {
    label: string
    value: ReactNode
}

function InfoField({ label, value }: InfoFieldProps) {
    return (
        <div className="flex items-center space-x-2  group">
            <span className="font-semibold text-sm  w-[125px] shrink-0">{label} :</span>
            <div className="flex-1 text-sm  max-w-[260px]">{value}</div>
        </div>
    )
}

export default function ManufacturingInformation({
    mode,
    manufacturingOrderId,
    onProductSelect
}: {
    mode: "create" | "detail";
    manufacturingOrderId?: string;
    onProductSelect?: (productVariantId: string, bomId?: string) => void;
}) {

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [products, setProducts] = useState<Product[]>([]);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 1,
    });

    const fetchProductVariants = useCallback(async () => {
        try {
            const body: any = {
                page: pagination.page,
                pageSize: pagination.pageSize,
                searchTerm: "",
            };

            const response = await getProductVariants(body);

            if (response.success && response.data) {
                const mappedProducts: Product[] = response.data.items.map((v: ProductVariant) => ({
                    id: v.productVariantId,
                    name: v.productVariantName,
                    code: v.productVariantCode,
                    image: v.productVariantImage,
                    productType: v.productVariantType,
                    costPrice: 0,
                    productVariantNumber: 0
                }));

                setProducts(mappedProducts);
                setPagination((prev) => ({
                    ...prev,
                    totalCount: response.data!.totalCount,
                    totalPages: response.data!.totalPages,
                }));
            }
        } catch (error) {
            console.error("Không tải được dữ liệu sản phẩm:", error);
        }
    }, [pagination.page, pagination.pageSize]);

    useEffect(() => {
        if (isDialogOpen) {
            fetchProductVariants();
        }
    }, [isDialogOpen, fetchProductVariants]);

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= pagination.totalPages) {
            setPagination((prev) => ({ ...prev, page: newPage }));
        }
    };

    const [orderData, setOrderData] = useState<{
        code: string,
        productName: string,
        quantity: number,
        startDate: Date | undefined,
        endDate: Date | undefined,
        bom: string,
        pic: string
    }>({
        code: manufacturingOrderId || "",
        productName: "Chọn sản phẩm",
        quantity: 500,
        startDate: new Date(),
        endDate: new Date(new Date().setDate(new Date().getDate() + 5)),
        bom: "",
        pic: "Nguyễn Văn A"
    });

    const handleSelectProduct = async (product: Product) => {
        setOrderData(prev => ({
            ...prev,
            productName: product.name,
            bom: "Đang tải..."
        }));
        setIsDialogOpen(false);

        if (onProductSelect) {
            onProductSelect(product.id, undefined);
        }

        try {
            const response = await getBOM(product.id);
            if (response.success && response.data) {
                setOrderData(prev => ({
                    ...prev,
                    bom: `${response.data?.bomCode} (Ver ${response.data?.latestVersion})`
                }));
                if (onProductSelect) {
                    onProductSelect(product.id, response.data.bomId);
                }
            } else {
                setOrderData(prev => ({
                    ...prev,
                    bom: "Không tìm thấy BOM"
                }));
            }
        } catch (error) {
            console.error("Failed to fetch BOM:", error);
            setOrderData(prev => ({
                ...prev,
                bom: "Lỗi khi tải BOM"
            }));
        }
    };

    return (
        <Card className="w-full border-border shadow-sm overflow-hidden bg-card">
            <CardHeader className="flex items-center justify-between py-1 px-6 border-b border-border">
                <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="bg-secondary text-secondary-foreground hover:bg-secondary/80 px-3 py-1 text-sm font-semibold tracking-wide">
                        Bản nháp
                    </Badge>
                </div>
                <div className="flex items-center gap-3">
                    <ActionButton action="save" size="sm">
                        Xác nhận
                    </ActionButton>
                    <ActionButton action="cancel" size="sm">
                        Hủy
                    </ActionButton>
                </div>
            </CardHeader>

            <CardContent className="p-6">
                <div className="grid grid-cols-[1fr_1.5fr] gap-y-8 gap-x-2">
                    <div className="space-y-8">
                        <InfoField
                            label="Mã lệnh sản xuất"
                            value={<div className="flex items-center gap-2">
                                <Input
                                    type="text"
                                    value={orderData.code}
                                    placeholder="MO-YYYY-STT"
                                    onChange={(e) => setOrderData(prev => ({ ...prev, code: e.target.value }))}
                                    className="h-8 md:w-[160px]"
                                />
                            </div>}
                        />
                        <InfoField
                            label="Sản phẩm"
                            value={
                                <ProductListDialog
                                    open={isDialogOpen}
                                    onOpenChange={setIsDialogOpen}
                                    trigger={<span className="text-primary font-semibold hover:underline cursor-pointer flex items-center gap-2">
                                        {orderData.productName}
                                    </span>}
                                    products={products}
                                    pagination={pagination}
                                    onPageChange={handlePageChange}
                                    onSelect={handleSelectProduct}
                                />
                            }
                        />
                        <InfoField
                            label="Số lượng"
                            value={
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="number"
                                        min={1}
                                        value={orderData.quantity}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                                        className="h-8 md:w-[160px]"
                                    />
                                    <span className="text-sm text-muted-foreground">Cái</span>
                                </div>
                            }
                        />
                    </div>

                    <div className="space-y-8">
                        <div className="grid grid-cols-2">
                            <InfoField
                                label="Ngày bắt đầu"
                                value={
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <DatePicker />

                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={orderData.startDate}
                                                onSelect={(date) => setOrderData(prev => ({ ...prev, startDate: date }))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                }
                            />
                            <InfoField
                                label="Ngày kết thúc"
                                value={
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <DatePicker />
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={orderData.endDate}
                                                onSelect={(date) => setOrderData(prev => ({ ...prev, endDate: date }))}
                                            />
                                        </PopoverContent>
                                    </Popover>
                                }
                            />
                        </div>
                        <InfoField
                            label="BOM (Định mức)"
                            value={orderData.bom}
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
