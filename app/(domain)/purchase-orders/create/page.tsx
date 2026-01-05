"use client";

import { format } from "date-fns";
import {
    Calendar as CalendarIcon,
    ChevronLeft,
    Plus,
    Trash2
} from "lucide-react";
import { useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { Separator } from "@/components/ui/separator";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import ActionButton from "@/my-components/btn/ActionButton";


interface Supplier {
    id: string;
    name: string;
}

interface Item {
    id: string;
    code: string;
    name: string;
    description: string;
    uom: string;
    standardPrice: number;
}



interface PaymentTerm {
    id: string;
    name: string;
}

const MOCK_SUPPLIERS: Supplier[] = [
    { id: "s1", name: "Acme Corp" },
    { id: "s2", name: "Globex Corporation" },
    { id: "s3", name: "Soylent Corp" },
    { id: "s4", name: "VinaSteel" },
];

const MOCK_ITEMS: Item[] = [
    { id: "i1", code: "ITEM-001", name: "Steel Sheet 5mm", description: "Industrial steel sheet, 5mm thickness", uom: "Sheet", standardPrice: 120 },
    { id: "i2", code: "ITEM-002", name: "Aluminum Rod", description: "Aluminum alloy rod 20mm", uom: "Meter", standardPrice: 45 },
    { id: "i3", code: "ITEM-003", name: "Copper Wire", description: "Insulated copper wire", uom: "Roll", standardPrice: 80 },
    { id: "i4", code: "ITEM-004", name: "Plastic Resins", description: "Polypropylene pellets", uom: "kg", standardPrice: 12 },
];

const MOCK_PAYMENT_TERMS: PaymentTerm[] = [
    { id: "pt1", name: "Net 30" },
    { id: "pt2", name: "Net 60" },
    { id: "pt3", name: "Immediate" },
];

const TAX_RATES = [
    { value: 0, label: "0%" },
    { value: 0.05, label: "5%" },
    { value: 0.08, label: "8%" },
    { value: 0.1, label: "10%" },
];


interface POLineItem {
    id: string;
    itemId: string;
    itemCode: string;
    itemName: string;
    description: string;
    quantity: number;
    uom: string;
    unitPrice: number;
    total: number;
}

export default function CreatePurchaseOrderPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = React.useState(false);

    const [supplierId, setSupplierId] = React.useState<string>("");
    const [currency, setCurrency] = React.useState<string>("VND");
    const [poDate, setPoDate] = React.useState<Date>(new Date());
    const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(undefined);
    const [paymentTermId, setPaymentTermId] = React.useState<string>("");
    const [referenceNumber, setReferenceNumber] = React.useState("");
    const [notes, setNotes] = React.useState("");

    const [lines, setLines] = React.useState<POLineItem[]>([]);

    const subtotal = lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    const totalTax = lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    const grandTotal = subtotal + totalTax;


    const handleSupplierChange = (val: string) => {
        setSupplierId(val);
    };

    const handleAddItem = () => {
        const newLine: POLineItem = {
            id: Math.random().toString(36).substr(2, 9),
            itemId: "",
            itemCode: "",
            itemName: "",
            description: "",
            quantity: 1,
            uom: "",
            unitPrice: 0,
            total: 0,
        };
        setLines([...lines, newLine]);
    };

    const handleRemoveItem = (id: string) => {
        setLines(lines.filter(l => l.id !== id));
    };

    const handleUpdateLine = (id: string, field: keyof POLineItem, value: any) => {
        setLines(prevLines => prevLines.map(line => {
            if (line.id !== id) return line;

            const updatedLine = { ...line, [field]: value };

            if (field === 'itemId') {
                const item = MOCK_ITEMS.find(i => i.id === value);
                if (item) {
                    updatedLine.itemCode = item.code;
                    updatedLine.itemName = item.name;
                    updatedLine.description = item.description;
                    updatedLine.uom = item.uom;
                    updatedLine.unitPrice = item.standardPrice;
                }
            }

            updatedLine.total = updatedLine.quantity * updatedLine.unitPrice;

            return updatedLine;
        }));
    };

    const validateForm = () => {
        if (!supplierId) {
            toast.error("Vui lòng chọn Nhà cung cấp.");
            return false;
        }
        if (!poDate) {
            toast.error("Ngày đặt hàng là bắt buộc.");
            return false;
        }

        if (deliveryDate && deliveryDate < poDate) {
            toast.error("Ngày giao hàng dự kiến không được trước Ngày đặt hàng.");
            return false;
        }
        if (lines.length === 0) {
            toast.error("Vui lòng thêm ít nhất một sản phẩm.");
            return false;
        }

        for (const line of lines) {
            if (!line.itemId) {
                toast.error("Tất cả các dòng phải có sản phẩm được chọn.");
                return false;
            }
            if (line.quantity <= 0 || !Number.isInteger(line.quantity)) {
                toast.error(`Số lượng cho sản phẩm ${line.itemCode} phải là số nguyên lớn hơn 0.`);
                return false;
            }
            if (line.unitPrice < 0) {
                toast.error(`Đơn giá cho sản phẩm ${line.itemCode} không được âm.`);
                return false;
            }
        }

        return true;
    };

    const handleSaveDraft = async () => {
        if (!validateForm()) return;

        setIsSubmitting(true);

        await new Promise(resolve => setTimeout(resolve, 1000));

        toast.success("Đơn đặt hàng đã được lưu nháp!");
        setIsSubmitting(false);

        router.push("/purchase-orders");
    };

    return (
        <div className="min-h-screen bg-muted/40 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                </Button>
                <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                    Tạo đơn đặt hàng
                </h1>
                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    <ActionButton action="cancel" onClick={() => router.push("/purchase-orders")}>
                        Hủy
                    </ActionButton>
                    <ActionButton action="save" onClick={handleSaveDraft} disabled={isSubmitting}>
                        Lưu
                    </ActionButton >
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-[1fr_250px] lg:grid-cols-3 lg:gap-8">
                <div className="grid auto-rows-max items-start gap-4 lg:col-span-2 lg:gap-8">

                    {/* Header Info Card */}
                    <Card>
                        <CardHeader>
                            <CardTitle>Thông tin chung</CardTitle>
                            <CardDescription>
                                Chi tiết về nhà cung cấp và lịch giao hàng.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6 sm:grid-cols-2">
                                <div className="grid gap-3">
                                    <Label htmlFor="supplier" className="after:content-['*'] after:ml-0.5 after:text-red-500">Nhà cung cấp</Label>
                                    <Select value={supplierId} onValueChange={handleSupplierChange}>
                                        <SelectTrigger id="supplier" className="bg-background">
                                            <SelectValue placeholder="Chọn nhà cung cấp" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {MOCK_SUPPLIERS.map(s => (
                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-3">
                                    <Label htmlFor="reference">Số tham chiếu</Label>
                                    <Input
                                        id="reference"
                                        placeholder="Ví dụ: QUOTE-123"
                                        value={referenceNumber}
                                        onChange={e => setReferenceNumber(e.target.value)}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Ngày đặt hàng</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !poDate && "text-muted-foreground"
                                                )}
                                            >
                                                {poDate ? (
                                                    format(poDate, "dd/MM/yyyy")
                                                ) : (
                                                    <span>Chọn ngày</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={poDate}
                                                onSelect={(d) => d && setPoDate(d)}
                                                disabled={(date) =>
                                                    date > new Date() || date < new Date("1900-01-01")
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid gap-3 sm:col-span-2">
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                        id="notes"
                                        className="min-h-20"
                                        placeholder="Ghi chú đơn hàng..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Line Items Card */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="space-y-1">
                                <CardTitle>Chi tiết sản phẩm</CardTitle>
                                <CardDescription>
                                    Thêm sản phẩm vào đơn hàng này.
                                </CardDescription>
                            </div>
                            <Button size="sm" variant="secondary" onClick={handleAddItem} className="gap-1">
                                <Plus className="h-4 w-4" />
                                Thêm sản phẩm
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="min-h-[200px] overflow-auto border rounded-md">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead className="min-w-[180px] font-semibold">Sản phẩm</TableHead>
                                            <TableHead className=" font-semibold">Số lượng</TableHead>
                                            <TableHead className=" font-semibold">ĐVT</TableHead>
                                            <TableHead className="font-semibold">Đơn giá</TableHead>
                                            <TableHead className=" text-right font-semibold">Thành tiền</TableHead>
                                            <TableHead className=" font-semibold"></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {lines.length === 0 ? (
                                            <TableRow>
                                                <TableCell colSpan={9} className="h-24 text-center text-muted-foreground">
                                                    Chưa có sản phẩm nào. Nhấn "Thêm sản phẩm" để bắt đầu.
                                                </TableCell>
                                            </TableRow>
                                        ) : (
                                            lines.map((line) => (
                                                <TableRow key={line.id} className="align-top">
                                                    <TableCell>
                                                        <Select
                                                            value={line.itemId}
                                                            onValueChange={(val) => handleUpdateLine(line.id, 'itemId', val)}
                                                        >
                                                            <SelectTrigger className="h-8">
                                                                <SelectValue placeholder="Chọn sản phẩm" />
                                                            </SelectTrigger>
                                                            <SelectContent>
                                                                {MOCK_ITEMS.map(i => (
                                                                    <SelectItem key={i.id} value={i.id}>{i.code}</SelectItem>
                                                                ))}
                                                            </SelectContent>
                                                        </Select>
                                                    </TableCell>


                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="1"
                                                            step="1"
                                                            className="h-8 w-24"
                                                            value={line.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                handleUpdateLine(line.id, 'quantity', isNaN(val) ? 0 : val);
                                                            }}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-sm text-muted-foreground pt-3">
                                                        {line.uom}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Input
                                                            type="number"
                                                            min="0"
                                                            step="0.01"
                                                            className="h-8 w-24"
                                                            value={line.unitPrice}
                                                            onChange={(e) => handleUpdateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium pt-3 text-sm">
                                                        {line.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button
                                                            variant="ghost"
                                                            size="icon"
                                                            className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                            onClick={() => handleRemoveItem(line.id)}
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        )}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar Summary */}
                <div className="grid auto-rows-max items-start gap-4 lg:gap-8">
                    <Card x-chunk="dashboard-07-chunk-3">
                        <CardHeader>
                            <CardTitle>Tổng đơn hàng</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-6">
                                <div className="grid gap-3">
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Tạm tính</span>
                                        <span>
                                            {subtotal.toLocaleString('en-US', { style: 'currency', currency: currency })}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-muted-foreground">Tổng thuế</span>
                                        <span>
                                            {totalTax.toLocaleString('en-US', { style: 'currency', currency: currency })}
                                        </span>
                                    </div>
                                    <Separator className="my-2" />
                                    <div className="flex items-center justify-between font-semibold text-lg">
                                        <span>Tổng cộng</span>
                                        <span>
                                            {grandTotal.toLocaleString('en-US', { style: 'currency', currency: currency })}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                        <CardFooter className="flex flex-col gap-2 border-t bg-muted/50 px-6 py-3">
                            <div className="text-xs text-muted-foreground w-full text-center">
                                Giá trị được tính theo {currency}.
                            </div>
                        </CardFooter>
                    </Card>
                </div>
            </div>
        </div>
    );
}
