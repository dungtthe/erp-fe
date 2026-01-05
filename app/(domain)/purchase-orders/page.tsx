"use client";

import { format } from "date-fns";
import {
    ChevronDown,
    Plus,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

import { cn } from "@/lib/utils";
import DetailIcon from "@/my-components/icons/DetailIcon";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import MyPagination from "@/my-components/paginations/MyPagination";


type POStatus =
    | "Bản nháp"
    | "Đã xác nhận"
    | "Đã hoàn tất"
    | "Đã hủy";

interface PurchaseOrder {
    id: string;
    poNumber: string;
    supplierName: string;
    poDate: Date;
    expectedDeliveryDate: Date;
    totalAmount: number;
    status: POStatus;
    createdBy: string;
}

const STATUS_OPTIONS: POStatus[] = [
    "Bản nháp",
    "Đã xác nhận",
    "Đã hoàn tất",
    "Đã hủy",
];



const SUPPLIERS = [
    { id: "s1", name: "Acme Corp" },
    { id: "s2", name: "Globex Corporation" },
    { id: "s3", name: "Soylent Corp" },
    { id: "s4", name: "Initech" },
    { id: "s5", name: "Umbrella Corp" },
];

const generateMockPOs = (count: number): PurchaseOrder[] => {
    const pos: PurchaseOrder[] = [];


    for (let i = 1; i <= count; i++) {
        const status = STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)];
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 30));
        const deliveryDate = new Date(date);
        deliveryDate.setDate(deliveryDate.getDate() + 14);

        pos.push({
            id: `po-${i}`,
            poNumber: `PO-${2024000 + i}`,
            supplierName: SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)].name,
            poDate: date,
            expectedDeliveryDate: deliveryDate,
            totalAmount: Math.floor(Math.random() * 10000) + 500,
            status,
            createdBy: "",
        });
    }
    return pos.sort((a, b) => b.poDate.getTime() - a.poDate.getTime());
};

const INITIAL_DATA = generateMockPOs(25);


function StatusBadge({ status }: { status: POStatus }) {
    let className = "";
    switch (status) {
        case "Bản nháp":
            className = "bg-gray-100 text-gray-700 hover:bg-gray-100/80 border-gray-200";
            break;
        case "Đã xác nhận":
            className = "bg-yellow-50 text-yellow-700 hover:bg-yellow-50/80 border-yellow-200";
            break;
        case "Đã hoàn tất":
            className = "bg-blue-50 text-blue-700 hover:bg-blue-50/80 border-blue-200";
            break;
        case "Đã hủy":
            className = "bg-red-50 text-red-700 hover:bg-red-50/80 border-red-200";
            break;
    }

    return (
        <Badge variant="outline" className={cn("font-normal border", className)}>
            {status}
        </Badge>
    );
}


export default function PurchaseOrderListPage() {
    const [data, setData] = React.useState<PurchaseOrder[]>(INITIAL_DATA);
    const [loading, setLoading] = React.useState(false);
    const router = useRouter();

    const [poNumberFilter, setPoNumberFilter] = React.useState("");
    const [supplierFilter, setSupplierFilter] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<POStatus[]>([]);

    const [pagination, setPagination] = React.useState({
        page: 1,
        pageSize: 10,
        totalCount: 0,
        totalPages: 1,
    });

    const filteredData = React.useMemo(() => {
        const filtered = data.filter((item) => {
            if (poNumberFilter && !item.poNumber.toLowerCase().includes(poNumberFilter.toLowerCase())) {
                return false;
            }
            if (supplierFilter && item.supplierName !== supplierFilter) {
                return false;
            }
            if (statusFilter.length > 0 && !statusFilter.includes(item.status)) {
                return false;
            }

            return true;
        });
        return filtered;
    }, [
        data,
        poNumberFilter,
        supplierFilter,
        statusFilter,
    ]);

    // Update pagination when filtered data changes
    React.useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            totalCount: filteredData.length,
            totalPages: Math.ceil(filteredData.length / prev.pageSize),
            page: 1, // Reset to first page on filter change
        }));
    }, [filteredData.length]);

    const paginatedData = React.useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        return filteredData.slice(startIndex, startIndex + pagination.pageSize);
    }, [filteredData, pagination.page, pagination.pageSize]);

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };


    return (
        <div className="min-h-screen bg-muted/40 p-6 space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý đơn đặt hàng</h1>

                </div>
                <div className="flex items-center gap-2">
                    <Button size="sm" className="h-9 gap-1 shadow-sm">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Tạo đơn đặt hàng</span>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 bg-card p-4 rounded-xl border shadow-sm items-end">
                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Mã đơn hàng</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm kiếm đơn hàng..."
                            className="pl-9 bg-background"
                            value={poNumberFilter}
                            onChange={(e) => setPoNumberFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Nhà cung cấp</label>
                    <Select value={supplierFilter} onValueChange={setSupplierFilter}>
                        <SelectTrigger className="bg-background">
                            <SelectValue placeholder="Nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_clear_value_hack" className="text-muted-foreground italic">Clear Selection</SelectItem>
                            {SUPPLIERS.map((s) => (
                                <SelectItem key={s.id} value={s.name}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-medium text-muted-foreground">Trạng thái</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between bg-background text-left font-normal">
                                {statusFilter.length === 0 ? (
                                    <span className="text-muted-foreground">Tất cả trạng thái</span>
                                ) : (
                                    <span className="truncate">
                                        {statusFilter.length} trạng thái
                                    </span>
                                )}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                            <div className="p-2 gap-2 flex flex-col">
                                {STATUS_OPTIONS.map((status) => (
                                    <div key={status} className="flex items-center space-x-2">
                                        <input
                                            type="checkbox"
                                            id={`status-${status}`}
                                            checked={statusFilter.includes(status)}
                                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary accent-primary"
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setStatusFilter([...statusFilter, status])
                                                } else {
                                                    setStatusFilter(statusFilter.filter(s => s !== status))
                                                }
                                            }}
                                        />
                                        <label htmlFor={`status-${status}`} className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                            {status}
                                        </label>
                                    </div>
                                ))}
                            </div>
                            <div className="p-2 border-t text-center">
                                <Button variant="ghost" size="sm" className="h-6 text-xs w-full" onClick={() => setStatusFilter([])}>Clear</Button>
                            </div>
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden">
                <Card>
                    <CardContent>
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead>STT</TableHead>
                                    <TableHead className="w-[140px]">Mã đơn hàng</TableHead>
                                    <TableHead>Nhà cung cấp</TableHead>
                                    <TableHead>Ngày giao hàng</TableHead>
                                    <TableHead className="text-right">Tổng tiền</TableHead>
                                    <TableHead>Trạng thái</TableHead>
                                    <TableHead className="w-[50px]">Hành động</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {loading ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            Loading...
                                        </TableCell>
                                    </TableRow>
                                ) : paginatedData.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-32 text-center text-muted-foreground">
                                            <div className="flex flex-col items-center justify-center gap-2">
                                                <Search className="h-8 w-8 opacity-20" />
                                                Không có đơn hàng nào
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    paginatedData.map((po, index) => (
                                        <TableRow key={po.id} className="group hover:bg-muted/30 transition-colors">
                                            <TableCell className="font-medium">
                                                {index + 1}
                                            </TableCell>
                                            <TableCell className="font-medium">
                                                {po.poNumber}
                                            </TableCell>
                                            <TableCell>{po.supplierName}</TableCell>

                                            <TableCell className="text-muted-foreground text-sm">
                                                {format(po.expectedDeliveryDate, "dd/MM/yyyy")}
                                            </TableCell>
                                            <TableCell className="text-right font-medium">
                                                {new Intl.NumberFormat("en-US", {
                                                    style: "currency",
                                                    currency: "VND",
                                                }).format(po.totalAmount)}
                                            </TableCell>
                                            <TableCell>
                                                <StatusBadge status={po.status} />
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center justify-center">
                                                    <DetailIcon onClick={() => router.push(`/purchase-orders/${po.id}`)} />
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
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
