"use client"

import { Badge } from "@/components/ui/badge"

import {
    Card,
    CardContent,
    CardHeader,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import ActionButton from "@/my-components/btn/ActionButton"
import DatePicker from "@/my-components/datepicker/DatePicker"
import ProductListDialog from "@/my-components/domains/ProductListDialog"
import { useRouter } from "next/navigation"
import { ReactNode, useCallback, useEffect, useState } from 'react'
import { Product } from "../../products/_services/productService"
import { createManufacturingOrder, getBOM, getMOById, getProductVariants, ManufacturingOrderDetail, ProductVariant } from "../_services/manufacturingOrderService"
import { toast } from "sonner"
import ToastManager from "@/helpers/ToastManager"

import { ExtendedRoutingStep } from "./ManufacturingStep";

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
    onProductSelect,
    routingId,
    steps,
    initialData
}: {
    mode: "create" | "detail";
    manufacturingOrderId?: string;
    onProductSelect?: (productVariantId: string, bomId?: string) => void;
    routingId?: string;
    steps?: ExtendedRoutingStep[];
    initialData?: ManufacturingOrderDetail | null;
}) {
    const router = useRouter();
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

    const handleSelectProduct = async (product: Product) => {
        const generatedCode = `MO-${new Date().getFullYear()}-${product.code}`;
        setOrderData(prev => ({
            ...prev,
            productName: product.name,
            code: generatedCode,
            bom: "Đang tải...",
            productVariantId: product.id
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

    const [orderData, setOrderData] = useState<{
        code: string,
        productName: string,
        quantityToProduce: number,
        startDate: Date | undefined,
        endDate: Date | undefined,
        bom: string,
        productVariantId?: string
    }>({
        code: manufacturingOrderId || "",
        productName: "Chọn sản phẩm",
        quantityToProduce: 1,
        startDate: undefined,
        endDate: undefined,
        bom: "",
        productVariantId: undefined
    });

    useEffect(() => {
        if (initialData) {
            const startDate = typeof initialData.startDate === 'string' ? new Date(initialData.startDate) : initialData.startDate;
            const endDate = typeof initialData.endDate === 'string' ? new Date(initialData.endDate) : initialData.endDate;

            setOrderData(prev => ({
                ...prev,
                code: initialData.code,
                quantityToProduce: initialData.quantityToProduce,
                startDate: startDate,
                endDate: endDate,
                productVariantId: initialData.productVariantId,
                bom: "Đang tải...",
                productName: "Đang tải..."
            }));

            // Fetch BOM info
            getBOM(initialData.productVariantId).then(res => {
                if (res.success && res.data) {
                    const data = res.data;
                    setOrderData(prev => ({
                        ...prev,
                        bom: `${data.bomCode} (Ver ${data.latestVersion})`
                    }));
                } else {
                    setOrderData(prev => ({ ...prev, bom: "Không tìm thấy BOM" }));
                }
            }).catch(() => {
                setOrderData(prev => ({ ...prev, bom: "Lỗi tải BOM" }));
            });

            // Fetch Product Name via Search
            // This is a best-effort attempt assuming search by ID might work or we can find it in the first page if recent
            getProductVariants({ page: 1, pageSize: 10, searchTerm: "" }).then(res => {
                if (res.success && res.data) {
                    const items = res.data.items;
                    // Try to find matching variant
                    const found = items.find(p => p.productVariantId === initialData.productVariantId);
                    if (found) {
                        setOrderData(prev => ({ ...prev, productName: found.productVariantName }));
                    } else {
                        // If not found in first page, maybe leave it or show ID? 
                        // For now, let's keep "Đang tải..." or set to Code if failed? 
                        // Or try specific search if API supports it
                        setOrderData(prev => ({ ...prev, productName: prev.productName === "Đang tải..." ? "Sản phẩm (Chi tiết)" : prev.productName }));
                    }
                }
            })
        }
    }, [initialData]);

    const handleConfirm = async () => {
        if (!orderData.productVariantId) {
            ToastManager.error("Vui lòng chọn sản phẩm!");
            return;
        }

        if (!orderData.startDate || !orderData.endDate) {
            ToastManager.error("Vui lòng chọn ngày bắt đầu và kết thúc!");
            return;
        }
        if (orderData.startDate > orderData.endDate) {
            ToastManager.error("Ngày bắt đầu không thể lớn hơn ngày kết thúc!");
            return;
        }
        if (!routingId) {
            ToastManager.error("Dữ liệu định mức/quy trình chưa được tải đầy đủ!");
            return;
        }
        if (steps && steps.some(s => !s.workCenterId)) {
            ToastManager.error("Vui lòng chọn phân xưởng cho tất cả các công đoạn!");
            return;
        }
        if (orderData.quantityToProduce <= 0) {
            ToastManager.error("Số lượng phải lớn hơn 0!");
            return;
        }

        try {
            const workOrders = steps?.map(step => ({
                manufacturingOrderId: step.routingStepId,
                workCenterId: String(step.workCenterId),
                routingStepId: step.routingStepId
            })) || [];

            const result = await createManufacturingOrder({
                code: orderData.code,
                routingId: routingId,
                quantityToProduce: orderData.quantityToProduce,
                startDate: orderData.startDate,
                endDate: orderData.endDate,
                workOrders: workOrders
            });

            if (result.success) {
                ToastManager.success("Tạo lệnh sản xuất thành công!");
                router.push("/manufacturing-orders");
            } else {
                ToastManager.error("Có lỗi khi tạo lệnh: " + (result.error?.message || "Lỗi không xác định"));
            }
        } catch (error) {
            console.error("Error creating order:", error);
            ToastManager.error("Đã xảy ra lỗi hệ thống.");
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
                    <ActionButton action="save" size="sm" onClick={handleConfirm}>
                        Xác nhận
                    </ActionButton>
                    <ActionButton action="cancel" size="sm" onClick={() => router.back()}>
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
                                    placeholder="Tự động tạo"
                                    readOnly={true}
                                    className="h-8 md:w-[200px] bg-muted/50 cursor-not-allowed backdrop-blur-sm"
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
                                        value={orderData.quantityToProduce}
                                        onChange={(e) => setOrderData(prev => ({ ...prev, quantityToProduce: parseInt(e.target.value) || 0 }))}
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
                                    <DatePicker
                                        value={orderData.startDate}
                                        onChange={(date) => setOrderData(prev => ({ ...prev, startDate: date }))}
                                    />
                                }
                            />
                            <InfoField
                                label="Ngày kết thúc"
                                value={
                                    <DatePicker
                                        value={orderData.endDate}
                                        onChange={(date) => setOrderData(prev => ({ ...prev, endDate: date }))}
                                    />
                                }
                            />
                        </div>
                        <InfoField
                            label="BOM (Định mức)"
                            value={orderData.bom}
                        />
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
