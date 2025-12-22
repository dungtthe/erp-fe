"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import ActionButton from "@/my-components/btn/ActionButton";
import DetailIcon from "@/my-components/icons/DetailIcon";
import MyPagination from "@/my-components/paginations/MyPagination";
import { MANUFACTURING_TYPE_COLORS, MANUFACTURING_TYPE_LABELS, ManufacturingType } from "@/resources/ManufacturingType";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { getMOs, ManufacturingOrder } from "./_services/manufacturingOrderService";


export default function ManufacturingOrdersPage() {

    const router = useRouter();
    const [manufacturingOrders, setManufacturingOrders] = useState<ManufacturingOrder[]>([]);
    const [loading, setLoading] = useState(false);
    const [pagination, setPagination] = useState({
        page: 1,
        pageSize: 5,
        totalCount: 0,
        totalPages: 1,
    });
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

    const fetchManufacturingOrders = async () => {
        setLoading(true);
        try {
            const response = await getMOs({
                page: pagination.page,
                pageSize: pagination.pageSize,
                searchTerm: debouncedSearchTerm,
            });
            if (response.data) {
                setManufacturingOrders(response.data.items);
                setPagination({
                    ...pagination,
                    totalCount: response.data.totalCount,
                    totalPages: response.data.totalPages,
                });
            }
        } catch (error) {
            console.error("Không lấy được dữ liệu:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPagination((prev) => ({ ...prev, page: 1 }));
        }, 500);

        return () => {
            clearTimeout(handler);
        };
    }, [searchTerm]);

    useEffect(() => {
        fetchManufacturingOrders();
    }, [pagination.page, debouncedSearchTerm]);

    const handlePageChange = (page: number) => {
        setPagination({ ...pagination, page });
    };

    return (
        <div className="min-h-screen bg-muted/40">
            <div className="mx-auto  p-6">
                <div className="mb-6 flex flex-col gap-1">
                    <h1 className="text-2xl font-semibold leading-[1.3] text-foreground">Danh sách lệnh sản xuất</h1>
                </div>

                <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div className="flex flex-1 items-center gap-3">
                        <div className="relative w-full max-w-sm">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Tìm kiếm theo mã lệnh sản xuất ..."
                                className="h-10 w-full pl-9 rounded-lg bg-background focus-visible:ring-ring"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                    </div>
                    <div className="flex items-center gap-3">
                        <ActionButton action="create" href="/manufacturing-orders/create">
                            Tạo lệnh sản xuất
                        </ActionButton>
                    </div>
                </div>

                <Card className="px-5">
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-muted">
                                <TableRow className="bg-muted hover:bg-muted">
                                    <TableHead className="font-semibold">STT</TableHead>
                                    <TableHead className="font-semibold">Mã lệnh sản xuất</TableHead>
                                    <TableHead className="font-semibold">Sản phẩm</TableHead>
                                    <TableHead className="font-semibold">Số lượng dự kiến</TableHead>
                                    <TableHead className="font-semibold">Số lượng đã sản xuất</TableHead>
                                    <TableHead className="font-semibold">Trạng thái</TableHead>
                                    <TableHead className="font-semibold w-0">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {manufacturingOrders.map((item, index) => (
                                    <TableRow key={item.id} className="hover:bg-muted/50 transition-colors">
                                        <TableCell>{(pagination.page - 1) * pagination.pageSize + index + 1}</TableCell>
                                        <TableCell>{item.code}</TableCell>
                                        <TableCell>{item.productName}</TableCell>
                                        <TableCell>{item.quantityToProduce}</TableCell>
                                        <TableCell>{item.quantityProduced}</TableCell>
                                        <TableCell>
                                            <Badge className={cn("font-medium border-0 px-2.5 py-0.5", MANUFACTURING_TYPE_COLORS[item.status])}>{MANUFACTURING_TYPE_LABELS[item.status]}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex items-center justify-center">
                                                <DetailIcon onClick={() => router.push(`/manufacturing-orders/${item.id}`)} />
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                    <CardFooter>
                        <MyPagination
                            paginationData={{
                                page: pagination.page,
                                pageSize: pagination.pageSize,
                                totalCount: pagination.totalCount,
                                totalPages: pagination.totalPages,
                                hasNextPage: pagination.page < pagination.totalPages,
                                hasPreviousPage: pagination.page > 1,
                            }}
                            onPageChange={handlePageChange}
                        />
                    </CardFooter>
                </Card>

            </div>
        </div>
    );
}
