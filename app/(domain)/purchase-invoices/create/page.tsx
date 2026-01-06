"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
    ArrowLeft,
    Check,
    ChevronsUpDown,
    FileText,
    Plus,
    Receipt,
    Trash2
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


// --- Types ---

type InvoiceSource = "PO" | "MANUAL";
type LineType = "ITEM" | "EXPENSE";

interface Supplier {
    id: string;
    name: string;
    currency: string;
    paymentTerms: number; // days
}

interface ReferenceDoc {
    id: string;
    code: string;
    supplierId: string;
    date: string;
    items: InvoiceLine[];
}

interface InvoiceLine {
    id: string;
    itemCode: string;
    description: string;
    uom: string;
    quantity: number; // For PO this is the Ordered Qty
    remainingQuantity?: number; // Valid only for PO
    invoicedQuantity: number;
    unitPrice: number;
    originalPrice?: number; // For price warning
    taxRate: number;
    type: LineType;
}

// --- Mock Data ---

const SUPPLIERS: Supplier[] = [
    { id: "s1", name: "TechParts Solution", currency: "VND", paymentTerms: 30 },
    { id: "s2", name: "Global Office Supplies", currency: "VND", paymentTerms: 15 },
    { id: "s3", name: "Heavy Machinery Co.", currency: "USD", paymentTerms: 45 },
];

const MOCK_POS: ReferenceDoc[] = [
    {
        id: "po-101",
        code: "PO-2024-001",
        supplierId: "s1",
        date: "2024-01-10",
        items: [
            { id: "l1", type: "ITEM", itemCode: "CPU-001", description: "Intel Core i9 Processor", uom: "Unit", quantity: 10, remainingQuantity: 10, invoicedQuantity: 10, unitPrice: 12000000, taxRate: 10 },
            { id: "l2", type: "ITEM", itemCode: "RAM-002", description: "DDR5 32GB 6000MHz", uom: "Unit", quantity: 20, remainingQuantity: 20, invoicedQuantity: 20, unitPrice: 4500000, taxRate: 10 },
        ]
    },
    {
        id: "po-102",
        code: "PO-2024-002",
        supplierId: "s2",
        date: "2024-01-12",
        items: [
            { id: "l3", type: "ITEM", itemCode: "PAP-A4", description: "A4 Paper Ream (Double A)", uom: "Box", quantity: 50, remainingQuantity: 50, invoicedQuantity: 50, unitPrice: 85000, taxRate: 8 },
        ]
    }
];

// --- Helper Functions ---

const formatCurrency = (amount: number, currency: string = "VND") => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency }).format(amount);
};

export default function CreatePurchaseInvoicePage() {
    const router = useRouter();

    // --- State ---

    const [source, setSource] = React.useState<InvoiceSource | null>(null);
    const [selectedReference, setSelectedReference] = React.useState<string | null>(null);
    const [supplierId, setSupplierId] = React.useState<string>("");

    const [invoiceNumber, setInvoiceNumber] = React.useState("");
    const [invoiceDate, setInvoiceDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [accountingDate, setAccountingDate] = React.useState(new Date().toISOString().split('T')[0]);
    const [dueDate, setDueDate] = React.useState("");

    const [lines, setLines] = React.useState<InvoiceLine[]>([]);

    const [isSupplierOpen, setIsSupplierOpen] = React.useState(false);

    // --- Effects ---

    React.useEffect(() => {
        if (supplierId && invoiceDate) {
            const supplier = SUPPLIERS.find(s => s.id === supplierId);
            if (supplier) {
                const date = new Date(invoiceDate);
                date.setDate(date.getDate() + supplier.paymentTerms);
                setDueDate(date.toISOString().split('T')[0]);
            }
        }
    }, [supplierId, invoiceDate]);

    React.useEffect(() => {
        if (source === "PO" && selectedReference) {
            const po = MOCK_POS.find(p => p.id === selectedReference);
            if (po) {
                setSupplierId(po.supplierId);
                setLines(po.items.map(item => ({ ...item, originalPrice: item.unitPrice })));
            }
        } else if (source === "MANUAL") {
            setLines([]);
        }
    }, [source, selectedReference]);

    // --- Handlers ---

    const handleSourceSelect = (newSource: InvoiceSource) => {
        setSource(newSource);
        setSelectedReference(null);
        setSupplierId("");
        setLines([]);
    };

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

    const handleSaveDraft = () => {
        if (!invoiceNumber) {
            alert("Vui lòng nhập số hóa đơn");
            return;
        }
        if (!supplierId) {
            alert("Vui lòng chọn nhà cung cấp");
            return;
        }
        if (lines.length === 0) {
            alert("Vui lòng thêm ít nhất một dòng");
            return;
        }

        if (source === "PO") {
            const invalidLines = lines.filter(l => l.invoicedQuantity > (l.remainingQuantity || 0));
            if (invalidLines.length > 0) {
                alert("Số lượng hóa đơn không được vượt quá số lượng còn lại.");
                return;
            }
        }

        alert("Lưu hóa đơn thành công! (Mock)");
        router.push("/purchase-invoices");
    };

    // --- Calculations ---

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

    return (
        <div className="min-h-screen bg-muted/40 pb-20">

            {/* Top Bar */}
            <div className="sticky top-0 z-20 w-full bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={() => router.back()}>
                            <ArrowLeft className="h-4 w-4" />
                        </Button>
                        <div>
                            <h1 className="text-xl font-semibold">Tạo hóa đơn mua hàng</h1>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <ActionButton action="cancel" onClick={() => router.push("/purchase-invoices")}>Hủy bỏ</ActionButton>
                        <ActionButton action="save" onClick={handleSaveDraft}>Lưu</ActionButton>
                    </div>
                </div>
            </div>

            <div className="container mx-auto p-4 max-w-5xl space-y-6">

                {/* Source Selection */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Nguồn hóa đơn</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <button
                                onClick={() => handleSourceSelect("PO")}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:bg-muted/50 text-center gap-2",
                                    source === "PO" ? "border-primary bg-primary/5" : "border-muted"
                                )}
                            >
                                <FileText className={cn("h-6 w-6", source === "PO" ? "text-primary" : "text-muted-foreground")} />
                                <span className="font-medium">Từ Đơn đặt hàng (PO)</span>
                            </button>

                            <button
                                onClick={() => handleSourceSelect("MANUAL")}
                                className={cn(
                                    "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all hover:bg-muted/50 text-center gap-2",
                                    source === "MANUAL" ? "border-primary bg-primary/5" : "border-muted"
                                )}
                            >
                                <Receipt className={cn("h-6 w-6", source === "MANUAL" ? "text-primary" : "text-muted-foreground")} />
                                <span className="font-medium">Hóa đơn thủ công</span>
                            </button>
                        </div>

                        {/* Reference Selector */}
                        {source === "PO" && (
                            <div className="mt-4 animate-in fade-in slide-in-from-top-2">
                                <Label className="mb-2 block">Chọn Đơn đặt hàng</Label>
                                <Select value={selectedReference || ""} onValueChange={setSelectedReference}>
                                    <SelectTrigger className="w-full bg-background">
                                        <SelectValue placeholder={`Chọn đơn đặt hàng...`} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {MOCK_POS.map(po => (
                                            <SelectItem key={po.id} value={po.id}>
                                                <span className="font-medium mr-2">{po.code}</span>
                                                <span className="text-muted-foreground">- {po.date} - NCC: {SUPPLIERS.find(s => s.id === po.supplierId)?.name}</span>
                                            </SelectItem>
                                        ))}
                                        {MOCK_POS.length === 0 && <div className="p-2 text-sm text-muted-foreground">Không có dữ liệu</div>}
                                    </SelectContent>
                                </Select>
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
                                                className="w-full justify-between font-normal bg-background"
                                                disabled={source !== "MANUAL"}
                                            >
                                                {supplierId
                                                    ? SUPPLIERS.find((s) => s.id === supplierId)?.name
                                                    : "Chọn nhà cung cấp..."}
                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
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
                                    <Input type="date" value={invoiceDate} onChange={e => setInvoiceDate(e.target.value)} />
                                </div>
                                <div className="space-y-2">
                                    <Label>Ngày hạch toán</Label>
                                    <Input type="date" value={accountingDate} onChange={e => setAccountingDate(e.target.value)} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Line Items */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-3">
                        <CardTitle className="text-base">Chi tiết hóa đơn</CardTitle>
                        {source === "MANUAL" && (
                            <Button size="sm" variant="outline" onClick={addManualLine}>
                                <Plus className="h-4 w-4 mr-2" /> Thêm dòng
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader className="bg-muted/50">
                                <TableRow>
                                    <TableHead className="min-w-[180px]">Sản phẩm</TableHead>
                                    <TableHead className="w">ĐVT</TableHead>
                                    {source === "PO" && <TableHead className="text-right">SL Gốc</TableHead>}
                                    {source === "PO" && <TableHead className="text-right">SL Còn</TableHead>}
                                    <TableHead className="text-right">Đơn giá</TableHead>
                                    <TableHead className="text-right">Thuế %</TableHead>
                                    <TableHead className="text-right">Thành tiền</TableHead>
                                    <TableHead className="w-[50px]"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {lines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center text-muted-foreground">
                                            {source
                                                ? "Chưa có dữ liệu."
                                                : "Vui lòng chọn nguồn hóa đơn."}
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    lines.map((line) => (
                                        <TableRow key={line.id}>
                                            <TableCell>
                                                {source === "MANUAL" ? (
                                                    <Input
                                                        className="h-8"
                                                        value={line.description}
                                                        onChange={e => handleLineChange(line.id, "description", e.target.value)}
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
                                            {source === "PO" && (
                                                <>
                                                    <TableCell className="text-right text-muted-foreground">{line.quantity}</TableCell>
                                                    <TableCell className="text-right font-medium">{line.remainingQuantity}</TableCell>
                                                </>
                                            )}
                                            <TableCell className="w-[120px]">
                                                <Input
                                                    type="number"
                                                    className="text-right"
                                                    value={line.unitPrice}
                                                    onChange={e => handleLineChange(line.id, "unitPrice", Number(e.target.value))}
                                                />
                                                {line.originalPrice && line.unitPrice !== line.originalPrice && (
                                                    <div className="text-[10px] text-amber-600 text-right mt-1">Gốc: {formatCurrency(line.originalPrice)}</div>
                                                )}
                                            </TableCell>
                                            <TableCell className="w-[80px]">
                                                <Select
                                                    value={line.taxRate.toString()}
                                                    onValueChange={(val) => handleLineChange(line.id, "taxRate", Number(val))}
                                                >
                                                    <SelectTrigger className="h-8 text-right bg-transparent border-0 ring-0 focus:ring-0 px-0 justify-end gap-1 w-full">
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
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

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
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
