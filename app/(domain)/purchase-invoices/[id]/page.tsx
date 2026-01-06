"use client";

import * as React from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ArrowLeft,
    Check,
    ChevronsUpDown,
    FileText,
    Plus,
    Receipt,
    Trash2,
    Pencil,
    X,
    Save
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import ActionButton from "@/my-components/btn/ActionButton";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command";
import ToastManager from "@/helpers/ToastManager";
import { MessageBox } from "@/my-components/messagebox";


type InvoiceStatus = "Draft" | "Posted" | "Paid" | "Cancelled";
type InvoiceSource = "PO" | "MANUAL";
type LineType = "ITEM" | "EXPENSE";

interface Supplier {
    id: string;
    name: string;
    currency: string;
    paymentTerms: number;
}

interface ReferenceDoc {
    id: string;
    code: string;
    supplierId: string;
    date: string;
}

interface InvoiceLine {
    id: string;
    itemCode: string;
    description: string;
    uom: string;
    quantity: number;
    remainingQuantity?: number;
    invoicedQuantity: number;
    unitPrice: number;
    originalPrice?: number;
    taxRate: number;
    type: LineType;
}

interface PurchaseInvoiceDetail {
    id: string;
    invoiceNumber: string;
    status: InvoiceStatus;
    source: InvoiceSource;
    referenceId?: string;
    supplierId: string;
    invoiceDate: string;
    accountingDate: string;
    dueDate: string;
    lines: InvoiceLine[];
    amountPaid?: number;
}


const SUPPLIERS: Supplier[] = [
    { id: "s1", name: "TechParts Solution", currency: "VND", paymentTerms: 30 },
    { id: "s2", name: "Global Office Supplies", currency: "VND", paymentTerms: 15 },
    { id: "s3", name: "Heavy Machinery Co.", currency: "USD", paymentTerms: 45 },
];

const MOCK_POS: ReferenceDoc[] = [
    { id: "po-101", code: "PO-2024-001", supplierId: "s1", date: "2024-01-10" },
    { id: "po-102", code: "PO-2024-002", supplierId: "s2", date: "2024-01-12" }
];

const MOCK_INVOICE: PurchaseInvoiceDetail = {
    id: "inv-001",
    invoiceNumber: "INV-2024-999",
    status: "Draft",
    source: "PO",
    referenceId: "po-101",
    supplierId: "s1",
    invoiceDate: "2024-01-15",
    accountingDate: "2024-01-15",
    dueDate: "2024-02-14",
    lines: [
        { id: "l1", type: "ITEM", itemCode: "CPU-001", description: "Intel Core i9 Processor", uom: "Unit", quantity: 10, remainingQuantity: 10, invoicedQuantity: 5, unitPrice: 12000000, taxRate: 10 },
        { id: "l2", type: "ITEM", itemCode: "RAM-002", description: "DDR5 32GB 6000MHz", uom: "Unit", quantity: 20, remainingQuantity: 20, invoicedQuantity: 10, unitPrice: 4500000, taxRate: 10 },
    ],
    amountPaid: 0,
};

const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
};

function StatusBadge({ status }: { status: InvoiceStatus }) {
    let className = "";
    let label = "";
    switch (status) {
        case "Draft":
            className = "bg-muted text-muted-foreground border-border";
            label = "Bản nháp";
            break;
        case "Posted":
            className = "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800";
            label = "Ghi sổ";
            break;
        case "Paid":
            className = "bg-emerald-100 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800";
            label = "Đã thanh toán";
            break;
        case "Cancelled":
            className = "bg-destructive/10 text-destructive border-destructive/20";
            label = "Đã hủy";
            break;
    }

    return (
        <Badge variant="outline" className={cn("px-2.5 py-0.5 text-xs font-medium border shadow-sm transition-colors", className)}>
            {label}
        </Badge>
    );
}

export default function PurchaseInvoiceDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params.id as string;

    const [isEditing, setIsEditing] = React.useState(false);

    const [invoiceData, setInvoiceData] = React.useState<PurchaseInvoiceDetail>(MOCK_INVOICE);

    const [supplierId, setSupplierId] = React.useState<string>(MOCK_INVOICE.supplierId);
    const [invoiceNumber, setInvoiceNumber] = React.useState(MOCK_INVOICE.invoiceNumber);
    const [invoiceDate, setInvoiceDate] = React.useState(MOCK_INVOICE.invoiceDate);
    const [accountingDate, setAccountingDate] = React.useState(MOCK_INVOICE.accountingDate);
    const [dueDate, setDueDate] = React.useState(MOCK_INVOICE.dueDate);
    const [lines, setLines] = React.useState<InvoiceLine[]>(MOCK_INVOICE.lines);
    const [amountPaid, setAmountPaid] = React.useState<number>(MOCK_INVOICE.amountPaid || 0);

    const [isSupplierOpen, setIsSupplierOpen] = React.useState(false);

    React.useEffect(() => {
        if (isEditing && supplierId && invoiceDate) {
            const supplier = SUPPLIERS.find(s => s.id === supplierId);
            if (supplier) {
                const date = new Date(invoiceDate);
                date.setDate(date.getDate() + supplier.paymentTerms);
                setDueDate(date.toISOString().split('T')[0]);
            }
        }
    }, [supplierId, invoiceDate, isEditing]);

    React.useEffect(() => {
        setSupplierId(invoiceData.supplierId);
        setInvoiceNumber(invoiceData.invoiceNumber);
        setInvoiceDate(invoiceData.invoiceDate);
        setAccountingDate(invoiceData.accountingDate);
        setDueDate(invoiceData.dueDate);
        setLines(invoiceData.lines);
        setAmountPaid(invoiceData.amountPaid || 0);
    }, [invoiceData]);

    const currentSupplier = SUPPLIERS.find(s => s.id === supplierId);
    const currency = currentSupplier?.currency || "VND";

    const totals = React.useMemo(() => {
        return lines.reduce((acc, line) => {
            const lineTotal = line.invoicedQuantity * line.unitPrice;
            const taxAmount = lineTotal * (line.taxRate / 100);
            return {
                subtotal: acc.subtotal + lineTotal,
                tax: acc.tax + taxAmount,
                total: acc.total + lineTotal + taxAmount
            };
        }, { subtotal: 0, tax: 0, total: 0 });
    }, [lines]);

    const remainingAmount = totals.total - amountPaid;

    const handleEdit = () => {
        setIsEditing(true);
    };

    const handleCancelEdit = () => {
        setInvoiceNumber(invoiceData.invoiceNumber);
        setSupplierId(invoiceData.supplierId);
        setInvoiceDate(invoiceData.invoiceDate);
        setAccountingDate(invoiceData.accountingDate);
        setDueDate(invoiceData.dueDate);
        setLines(invoiceData.lines);
        setAmountPaid(invoiceData.amountPaid || 0);
        setIsEditing(false);
    };

    const handleSave = () => {
        if (invoiceData.status === "Posted") {
            const updatedInvoice = {
                ...invoiceData,
                amountPaid,
            };
            setInvoiceData(updatedInvoice);
            setIsEditing(false);
            ToastManager.success("Đã cập nhật thông tin thanh toán!");
            return;
        }

        if (!invoiceNumber || !supplierId || lines.length === 0) {
            ToastManager.error("Vui lòng điền đầy đủ thông tin bắt buộc.");
            return;
        }

        const invalidLines = lines.filter(l => l.remainingQuantity !== undefined && l.invoicedQuantity > l.remainingQuantity);
        if (invalidLines.length > 0) {
            ToastManager.error("Số lượng hóa đơn không được vượt quá số lượng còn lại.");
            return;
        }

        const updatedInvoice = {
            ...invoiceData,
            invoiceNumber,
            supplierId,
            invoiceDate,
            accountingDate,
            dueDate,
            lines,
            amountPaid
        };
        setInvoiceData(updatedInvoice);
        setIsEditing(false);
        ToastManager.success("Đã lưu thay đổi!");
    };

    const handleConfirm = () => {
        setInvoiceData(prev => ({ ...prev, status: "Posted" }));
        setIsEditing(false);
        ToastManager.success("Hóa đơn đã được xác nhận!");
    };

    const handleCancelInvoice = () => {
        if (amountPaid > 0) {
            ToastManager.error("Không thể hủy hóa đơn đã có thanh toán. Vui lòng hoàn tác thanh toán trước.");
            return;
        }
        setInvoiceData(prev => ({ ...prev, status: "Cancelled" }));
        setIsEditing(false);
        ToastManager.success("Hóa đơn đã hủy thành công");
    };

    const isGlobalDisabled = !isEditing;
    const isCoreDisabled = isGlobalDisabled || invoiceData.status === "Posted";
    const isSettlementDisabled = isGlobalDisabled;
    const handleLineChange = (id: string, field: keyof InvoiceLine, value: any) => {
        setLines(prev => prev.map(line => {
            if (line.id === id) {
                return { ...line, [field]: value };
            }
            return line;
        }));
    };

    const addManualLine = () => {
        const newLine: InvoiceLine = {
            id: Math.random().toString(36).substr(2, 9),
            itemCode: "",
            description: "",
            uom: "Unit",
            quantity: 1,
            invoicedQuantity: 1,
            unitPrice: 0,
            taxRate: 0,
            type: "ITEM",
        };
        setLines([...lines, newLine]);
    };

    const removeLine = (id: string) => {
        setLines(prev => prev.filter(l => l.id !== id));
    };

    return (
        <div className="min-h-screen bg-muted/40 pb-20">

            <div className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.push("/purchase-invoices")}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">Chi tiết hóa đơn mua hàng</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={invoiceData.status} />
                                <span className="text-xs text-muted-foreground ml-2">{invoiceData.id.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isEditing ? (
                            <>
                                <ActionButton action="cancel" onClick={handleCancelEdit}>
                                    Hủy
                                </ActionButton>
                                <ActionButton action="save" onClick={handleSave}>Lưu</ActionButton>
                            </>
                        ) : (
                            <>
                                {invoiceData.status === "Draft" && (
                                    <>
                                        <MessageBox
                                            trigger={
                                                <ActionButton action="cancel">
                                                    Hủy hóa đơn
                                                </ActionButton>
                                            }
                                            title="Hủy hóa đơn"
                                            description="Bạn có chắc chắn muốn hủy hóa đơn này? Hành động này không thể hoàn tác."
                                            actionLabel="Đồng ý"
                                            onConfirm={handleCancelInvoice}
                                        />
                                        <ActionButton action="edit" onClick={handleEdit}>
                                            Chỉnh sửa
                                        </ActionButton>

                                        <MessageBox
                                            trigger={
                                                <ActionButton action="save">
                                                    Xác nhận
                                                </ActionButton>
                                            }
                                            title="Xác nhận hóa đơn"
                                            description="Bạn có chắc chắn muốn xác nhận hóa đơn này? Hành động này sẽ khóa các thông tin chính và ghi sổ công nợ."
                                            actionLabel="Xác nhận"
                                            onConfirm={handleConfirm}
                                        />
                                    </>
                                )}
                                {invoiceData.status === "Posted" && (
                                    <ActionButton action="edit" onClick={handleEdit}>
                                        Cập nhật thanh toán
                                    </ActionButton>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 max-w-5xl space-y-6">

                <Card className={cn(isGlobalDisabled && "opacity-80")}>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Nguồn hóa đơn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pointer-events-none">
                            <div className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all text-center gap-2",
                                invoiceData.source === "PO" ? "border-primary bg-primary/5" : "border-muted opacity-50"
                            )}>
                                <FileText className={cn("h-6 w-6", invoiceData.source === "PO" ? "text-primary" : "text-muted-foreground")} />
                                <span className="font-medium">Từ Đơn đặt hàng (PO)</span>
                            </div>

                            <div className={cn(
                                "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all text-center gap-2",
                                invoiceData.source === "MANUAL" ? "border-primary bg-primary/5" : "border-muted opacity-50"
                            )}>
                                <Receipt className={cn("h-6 w-6", invoiceData.source === "MANUAL" ? "text-primary" : "text-muted-foreground")} />
                                <span className="font-medium">Hóa đơn thủ công</span>
                            </div>
                        </div>

                        {invoiceData.source === "PO" && (
                            <div className="mt-4">
                                <Label className="mb-2 block">Tham chiếu</Label>
                                <Input value={MOCK_POS.find(p => p.id === invoiceData.referenceId)?.code || invoiceData.referenceId} disabled />
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Header Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Thông tin chung</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="supplier">Nhà cung cấp <span className="text-destructive">*</span></Label>
                                    <Popover open={isSupplierOpen} onOpenChange={setIsSupplierOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant="outline"
                                                role="combobox"
                                                aria-expanded={isSupplierOpen}
                                                className="w-full justify-between font-normal bg-background disabled:opacity-100 disabled:bg-muted"
                                                disabled={isCoreDisabled || invoiceData.source === "PO"}
                                            >
                                                {supplierId
                                                    ? SUPPLIERS.find((s) => s.id === supplierId)?.name
                                                    : "Chọn nhà cung cấp..."}
                                                {!isCoreDisabled && invoiceData.source === "MANUAL" && <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-[300px] p-0">
                                            <Command>
                                                <CommandInput placeholder="Tìm nhà cung cấp..." />
                                                <CommandList>
                                                    <CommandEmpty>Không tìm thấy.</CommandEmpty>
                                                    <CommandGroup>
                                                        {SUPPLIERS.map((supplier) => (
                                                            <CommandItem
                                                                key={supplier.id}
                                                                value={supplier.name}
                                                                onSelect={() => {
                                                                    setSupplierId(supplier.id);
                                                                    setIsSupplierOpen(false);
                                                                }}
                                                            >
                                                                <Check
                                                                    className={cn(
                                                                        "mr-2 h-4 w-4",
                                                                        supplierId === supplier.id ? "opacity-100" : "opacity-0"
                                                                    )}
                                                                />
                                                                {supplier.name}
                                                            </CommandItem>
                                                        ))}
                                                    </CommandGroup>
                                                </CommandList>
                                            </Command>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="invNumber">Số hóa đơn <span className="text-destructive">*</span></Label>
                                    <Input
                                        id="invNumber"
                                        placeholder="VD: INV-00123"
                                        value={invoiceNumber}
                                        onChange={e => setInvoiceNumber(e.target.value)}
                                        disabled={isCoreDisabled}
                                        className="disabled:opacity-100 disabled:bg-muted"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="text-base">Thời gian</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Ngày hóa đơn</Label>
                                    <Input
                                        type="date"
                                        value={invoiceDate}
                                        onChange={e => setInvoiceDate(e.target.value)}
                                        disabled={isCoreDisabled}
                                        className="disabled:opacity-100 disabled:bg-muted"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày hạch toán</Label>
                                    <Input
                                        type="date"
                                        value={accountingDate}
                                        onChange={e => setAccountingDate(e.target.value)}
                                        disabled={isCoreDisabled}
                                        className="disabled:opacity-100 disabled:bg-muted"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Line Items */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base">Chi tiết hóa đơn</CardTitle>
                        {!isCoreDisabled && invoiceData.source === "MANUAL" && (
                            <Button size="sm" variant="outline" onClick={addManualLine}>
                                <Plus className="h-4 w-4 mr-2" /> Thêm dòng
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="font-semibold min-w-[180px]">Sản phẩm</TableHead>
                                    <TableHead className="font-semibold w">ĐVT</TableHead>
                                    {invoiceData.source === "PO" && <TableHead className="text-right font-semibold">SL Gốc</TableHead>}
                                    {invoiceData.source === "PO" && <TableHead className="text-right font-semibold">SL Còn</TableHead>}
                                    <TableHead className="text-right font-semibold">SL Hóa đơn</TableHead>
                                    <TableHead className="text-right font-semibold">Đơn giá</TableHead>
                                    <TableHead className="text-right font-semibold">Thuế %</TableHead>
                                    <TableHead className="text-right font-semibold">Thành tiền</TableHead>
                                    {!isCoreDisabled && <TableHead className="w-[50px]"></TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                            Không có dữ liệu.
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                {invoiceData.source === "MANUAL" ? (
                                                    <Input
                                                        className="h-8 disabled:opacity-100 disabled:bg-transparent disabled:border-none disabled:p-0"
                                                        value={line.description}
                                                        onChange={e => handleLineChange(line.id, "description", e.target.value)}
                                                        disabled={isCoreDisabled}
                                                    />
                                                ) : (
                                                    <div className="flex flex-col">
                                                        <span className="font-medium text-sm">{line.itemCode}</span>
                                                        <span className="text-xs text-muted-foreground truncate max-w-[200px]">{line.description}</span>
                                                    </div>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-normal text-muted-foreground">{line.uom}</Badge>
                                            </TableCell>
                                            {invoiceData.source === "PO" && (
                                                <>
                                                    <TableCell className="text-right text-muted-foreground">{line.quantity}</TableCell>
                                                    <TableCell className="text-right font-medium">{line.remainingQuantity}</TableCell>
                                                </>
                                            )}
                                            <TableCell className={cn(invoiceData.source === "PO" ? "w-[100px]" : "w-[120px]")}>
                                                <Input
                                                    type="number"
                                                    className={cn("h-8 text-right w-full disabled:opacity-100 disabled:bg-transparent disabled:border-none disabled:p-0 font-medium",
                                                        (!isCoreDisabled && line.remainingQuantity !== undefined && line.invoicedQuantity > line.remainingQuantity) ? "border-destructive text-destructive" : ""
                                                    )}
                                                    value={line.invoicedQuantity}
                                                    onChange={e => handleLineChange(line.id, "invoicedQuantity", Number(e.target.value))}
                                                    disabled={isCoreDisabled}
                                                />
                                            </TableCell>
                                            <TableCell className="w-[120px]">
                                                <Input
                                                    type="number"
                                                    className="h-8 text-right w-full disabled:opacity-100 disabled:bg-transparent disabled:border-none disabled:p-0"
                                                    value={line.unitPrice}
                                                    onChange={e => handleLineChange(line.id, "unitPrice", Number(e.target.value))}
                                                    disabled={isCoreDisabled}
                                                />
                                                {line.originalPrice && line.unitPrice !== line.originalPrice && (
                                                    <div className="text-[10px] text-amber-600 text-right mt-1">Gốc: {formatCurrency(line.originalPrice)}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[80px]">
                                                <Select
                                                    value={line.taxRate.toString()}
                                                    onValueChange={(val) => handleLineChange(line.id, "taxRate", Number(val))}
                                                    disabled={isCoreDisabled}
                                                >
                                                    <SelectTrigger className="h-8 text-right bg-transparent border-0 ring-0 focus:ring-0 px-0 justify-end gap-1 w-full disabled:opacity-100">
                                                        <SelectValue />
                                                    </SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="0">0%</SelectItem>
                                                        <SelectItem value="5">5%</SelectItem>
                                                        <SelectItem value="8">8%</SelectItem>
                                                        <SelectItem value="10">10%</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </TableCell>
                                            <TableCell className="text-right font-bold">
                                                {formatCurrency(line.invoicedQuantity * line.unitPrice, currency)}
                                            </TableCell>
                                            {!isCoreDisabled && (
                                                <TableCell>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                                        onClick={() => removeLine(line.id)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Summary & Settlement - Only Editable Field in Posted Mode */}
                <div className="flex justify-end">
                    <div className="w-full md:w-1/3 space-y-4">
                        <Card>
                            <CardContent className="pt-6 space-y-3">
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tổng tiền hàng</span>
                                    <span className="font-medium">{formatCurrency(totals.subtotal, currency)}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-muted-foreground">Tiền thuế</span>
                                    <span className="font-medium">{formatCurrency(totals.tax, currency)}</span>
                                </div>
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-lg">Tổng cộng</span>
                                    <span className="font-bold text-xl text-primary">{formatCurrency(totals.total, currency)}</span>
                                </div>

                                {/* Settlement Fields */}
                                <Separator className="my-2" />
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground">Đã thanh toán</span>
                                    <div className="w-[120px]">
                                        <Input
                                            type="number"
                                            className="h-8 text-right disabled:opacity-100 disabled:bg-transparent disabled:border-none disabled:p-0"
                                            value={amountPaid}
                                            onChange={e => setAmountPaid(Number(e.target.value))}
                                            disabled={isSettlementDisabled}
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-between text-sm pt-1 font-medium">
                                    <span className={remainingAmount > 0 ? "text-destructive" : "text-emerald-600"}>Còn phải trả</span>
                                    <span className={remainingAmount > 0 ? "text-destructive" : "text-emerald-600"}>{formatCurrency(remainingAmount, currency)}</span>
                                </div>

                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
