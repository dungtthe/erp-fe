"use client";

import { format } from "date-fns";
import { ChevronDown, Search } from "lucide-react";
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
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import DetailIcon from "@/my-components/icons/DetailIcon";
import MyPagination from "@/my-components/paginations/MyPagination";
import ActionButton from "@/my-components/btn/ActionButton";


type InvoiceStatus = "Draft" | "Posted" | "Paid" | "Cancelled";

interface PurchaseInvoice {
    id: string;
    invoiceNumber: string;
    supplierId: string;
    supplierName: string;
    invoiceDate: Date;
    dueDate: Date;
    totalAmount: number;
    paidAmount: number;
    balanceAmount: number;
    status: InvoiceStatus;
}


const STATUS_OPTIONS: InvoiceStatus[] = ["Draft", "Posted", "Paid", "Cancelled"];

const SUPPLIERS = [
    { id: "s1", name: "TechParts Solution" },
    { id: "s2", name: "Global Office Supplies" },
    { id: "s3", name: "Heavy Machinery Co." },
    { id: "s4", name: "Fast Logistics Ltd." },
    { id: "s5", name: "Prime Materials Inc." },
];

const generateMockInvoices = (count: number): PurchaseInvoice[] => {
    const invoices: PurchaseInvoice[] = [];
    for (let i = 1; i <= count; i++) {
        const status = STATUS_OPTIONS[Math.floor(Math.random() * STATUS_OPTIONS.length)];
        const supplier = SUPPLIERS[Math.floor(Math.random() * SUPPLIERS.length)];

        const invoiceDate = new Date();
        invoiceDate.setDate(invoiceDate.getDate() - Math.floor(Math.random() * 60));

        const dueDate = new Date(invoiceDate);
        dueDate.setDate(dueDate.getDate() + 30);
        const totalAmount = Math.floor(Math.random() * 50000000) + 1000000;

        let paidAmount = 0;
        if (status === "Paid") {
            paidAmount = totalAmount;
        } else if (status === "Posted") {
            paidAmount = Math.random() > 0.5 ? Math.floor(totalAmount * 0.3) : 0;
        } else {
            paidAmount = 0;
        }

        invoices.push({
            id: `inv-${i}`,
            invoiceNumber: `INV-${new Date().getFullYear()}-${(1000 + i).toString()}`,
            supplierId: supplier.id,
            supplierName: supplier.name,
            invoiceDate: invoiceDate,
            dueDate: dueDate,
            totalAmount: totalAmount,
            paidAmount: paidAmount,
            balanceAmount: totalAmount - paidAmount,
            status: status,
        });
    }
    return invoices.sort((a, b) => b.invoiceDate.getTime() - a.invoiceDate.getTime());
};

const INITIAL_DATA = generateMockInvoices(45);

function StatusBadge({ status }: { status: InvoiceStatus }) {
    let className = "";
    let label = "";
    switch (status) {
        case "Draft":
            className = "bg-muted text-muted-foreground border-border hover:bg-muted/80";
            label = "Bản nháp";
            break;
        case "Posted":
            className = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800 hover:bg-blue-100/80 dark:hover:bg-blue-900/40";
            label = "Ghi sổ";
            break;
        case "Paid":
            className = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800 hover:bg-emerald-100/80 dark:hover:bg-emerald-900/40";
            label = "Đã thanh toán";
            break;
        case "Cancelled":
            className = "bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20";
            label = "Đã hủy";
            break;
    }

    return (
        <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-medium border shadow-sm transition-colors", className)}>
            {label}
        </Badge>
    );
}

export default function PurchaseInvoiceListPage() {
    const router = useRouter();

    const [data, setData] = React.useState<PurchaseInvoice[]>(INITIAL_DATA);
    const [loading, setLoading] = React.useState(false);

    const [invoiceNumberFilter, setInvoiceNumberFilter] = React.useState("");
    const [supplierFilter, setSupplierFilter] = React.useState("");
    const [statusFilter, setStatusFilter] = React.useState<InvoiceStatus[]>([]);

    const [pagination, setPagination] = React.useState({
        page: 1,
        pageSize: 9,
        totalCount: 0,
        totalPages: 1,
    });

    const filteredData = React.useMemo(() => {
        return data.filter((item) => {
            const matchesInvoiceNumber = !invoiceNumberFilter || item.invoiceNumber.toLowerCase().includes(invoiceNumberFilter.toLowerCase());
            const matchesSupplier = !supplierFilter || item.supplierName === supplierFilter;
            const matchesStatus = statusFilter.length === 0 || statusFilter.includes(item.status);

            return matchesInvoiceNumber && matchesSupplier && matchesStatus;
        });
    }, [data, invoiceNumberFilter, supplierFilter, statusFilter]);

    React.useEffect(() => {
        setPagination((prev) => ({
            ...prev,
            totalCount: filteredData.length,
            totalPages: Math.ceil(filteredData.length / prev.pageSize) || 1,
            page: 1,
        }));
    }, [filteredData.length]);

    const paginatedData = React.useMemo(() => {
        const startIndex = (pagination.page - 1) * pagination.pageSize;
        return filteredData.slice(startIndex, startIndex + pagination.pageSize);
    }, [filteredData, pagination.page, pagination.pageSize]);

    const handlePageChange = (newPage: number) => {
        setPagination((prev) => ({ ...prev, page: newPage }));
    };

    const handleViewDetail = (id: string) => {
        router.push(`/purchase-invoices/${id}`);
    };

    const formatCurrency = (value: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
        }).format(value);
    };

    const getStatusLabel = (status: InvoiceStatus) => {
        switch (status) {
            case "Draft": return "Bản nháp";
            case "Posted": return "Ghi sổ";
            case "Paid": return "Đã thanh toán";
            case "Cancelled": return "Đã hủy";
            default: return status;
        }
    }

    return (
        <div className="min-h-screen bg-muted/40 p-6 space-y-6">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">Quản lý hóa đơn mua hàng</h1>

                </div>
                <div className="flex items-center gap-2">
                    <ActionButton action="create" href="/purchase-invoices/create">
                        <span className="hidden sm:inline">Tạo hóa đơn</span>
                    </ActionButton>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-4 bg-card p-4 rounded-xl border shadow-sm">
                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Số hóa đơn</label>
                    <div className="relative">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Tìm số hóa đơn..."
                            className="pl-9 h-10 bg-background"
                            value={invoiceNumberFilter}
                            onChange={(e) => setInvoiceNumberFilter(e.target.value)}
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Nhà cung cấp</label>
                    <Select value={supplierFilter} onValueChange={(val) => setSupplierFilter(val === "all_clear" ? "" : val)}>
                        <SelectTrigger className="h-10 bg-background">
                            <SelectValue placeholder="Chọn nhà cung cấp" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all_clear" className="text-muted-foreground italic text-xs">Xóa chọn</SelectItem>
                            {SUPPLIERS.map((s) => (
                                <SelectItem key={s.id} value={s.name}>{s.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Trạng thái</label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-between h-10 bg-background font-normal">
                                {statusFilter.length === 0 ? (
                                    <span className="text-muted-foreground">Tất cả trạng thái</span>
                                ) : (
                                    <span className="truncate">{statusFilter.length} đã chọn</span>
                                )}
                                <ChevronDown className="h-4 w-4 opacity-50" />
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-[200px] p-0" align="start">
                            <div className="p-2 gap-1 flex flex-col">
                                {STATUS_OPTIONS.map((status) => (
                                    <div key={status} className="flex items-center space-x-2 p-2 hover:bg-muted/50 rounded-md transition-colors cursor-pointer"
                                        onClick={() => {
                                            if (statusFilter.includes(status)) {
                                                setStatusFilter(statusFilter.filter(s => s !== status));
                                            } else {
                                                setStatusFilter([...statusFilter, status]);
                                            }
                                        }}>
                                        <div className={cn(
                                            "h-4 w-4 rounded border flex items-center justify-center",
                                            statusFilter.includes(status) ? "bg-primary border-primary text-primary-foreground" : "border-muted-foreground"
                                        )}>
                                            {statusFilter.includes(status) && <span className="text-[10px]">✓</span>}
                                        </div>
                                        <span className="text-sm font-medium leading-none">{getStatusLabel(status)}</span>
                                    </div>
                                ))}
                            </div>
                            {statusFilter.length > 0 && (
                                <div className="p-2 border-t mt-1">
                                    <Button variant="ghost" size="sm" className="w-full h-8 text-xs" onClick={() => setStatusFilter([])}>
                                        Xóa bộ lọc
                                    </Button>
                                </div>
                            )}
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="rounded-xl border shadow-sm bg-card overflow-hidden flex flex-col">
                <Card className="border-0 shadow-none">
                    <CardContent className="p-0">
                        <div className="relative w-full overflow-auto max-h-[70vh]">
                            <Table>
                                <TableHeader className="bg-muted/50 sticky top-0 z-10 shadow-sm">
                                    <TableRow className="hover:bg-muted/50">
                                        <TableHead className="font-semibold ">STT</TableHead>
                                        <TableHead className="font-semibold ">Số hóa đơn</TableHead>
                                        <TableHead className="font-semibold ">Nhà cung cấp</TableHead>
                                        <TableHead className="font-semibold ">Hạn thanh toán</TableHead>
                                        <TableHead className="text-right font-semibold ">Tổng tiền</TableHead>
                                        <TableHead className="text-right font-semibold ">Đã thanh toán</TableHead>
                                        <TableHead className="text-right font-semibold ">Còn lại</TableHead>
                                        <TableHead className="font-semibold text-center">Trạng thái</TableHead>
                                        <TableHead className="text-right font-semibold ">Hành động</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {paginatedData.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={10} className="h-48 text-center text-muted-foreground">
                                                <div className="flex flex-col items-center justify-center gap-3">
                                                    <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                                                        <Search className="h-6 w-6 opacity-30" />
                                                    </div>
                                                    <p>Không tìm thấy hóa đơn nào phù hợp.</p>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        paginatedData.map((invoice, index) => (
                                            <TableRow
                                                key={invoice.id}
                                                className="group hover:bg-muted/40 transition-colors cursor-pointer"
                                                onClick={() => handleViewDetail(invoice.id)}
                                            >
                                                <TableCell className="text-muted-foreground text-xs py-3">
                                                    {(pagination.page - 1) * pagination.pageSize + index + 1}
                                                </TableCell>
                                                <TableCell className="font-medium text-primary hover:underline py-3">
                                                    {invoice.invoiceNumber}
                                                </TableCell>
                                                <TableCell className="font-medium py-3">
                                                    {invoice.supplierName}
                                                </TableCell>
                                                <TableCell className="text-sm text-muted-foreground py-3">
                                                    {format(invoice.dueDate, "dd/MM/yyyy")}
                                                </TableCell>
                                                <TableCell className="text-right font-medium py-3">
                                                    {formatCurrency(invoice.totalAmount)}
                                                </TableCell>
                                                <TableCell className="text-right text-muted-foreground py-3">
                                                    {formatCurrency(invoice.paidAmount)}
                                                </TableCell>
                                                <TableCell className="text-right font-semibold whitespace-nowrap py-3">
                                                    {formatCurrency(invoice.balanceAmount)}
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <StatusBadge status={invoice.status} />
                                                </TableCell>
                                                <TableCell className="text-center py-3">
                                                    <div className="flex items-center justify-center">
                                                        <DetailIcon
                                                            className="h-4 w-4 text-muted-foreground hover:text-primary"
                                                            onClick={() => { }}
                                                        />
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                    <CardFooter className="py-4 border-t">
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
