"use client";

import { format } from "date-fns";
import {
    Ban,
    Calendar as CalendarIcon,
    CheckCircle,
    ChevronLeft,
    Edit,
    Plus,
    Send,
    Trash2,
    XCircle
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import * as React from "react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
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
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
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

type POStatus = "Draft" | "Pending Approval" | "Approved" | "Rejected" | "Cancelled";

export default function PurchaseOrderDetailPage() {
    const router = useRouter();
    const params = useParams();
    const id = params?.id as string;

    const [isSubmitting, setIsSubmitting] = React.useState(false);
    const [isEditing, setIsEditing] = React.useState(false);
    const [status, setStatus] = React.useState<POStatus>("Draft");

    const [showCancelDialog, setShowCancelDialog] = React.useState(false);
    const [cancelReason, setCancelReason] = React.useState("");
    const [showRejectDialog, setShowRejectDialog] = React.useState(false);
    const [rejectReason, setRejectReason] = React.useState("");

    const [supplierId, setSupplierId] = React.useState<string>("s1");
    const [currency, setCurrency] = React.useState<string>("VND");
    const [poDate, setPoDate] = React.useState<Date>(new Date());
    const [deliveryDate, setDeliveryDate] = React.useState<Date | undefined>(new Date(new Date().setDate(new Date().getDate() + 7)));
    const [paymentTermId, setPaymentTermId] = React.useState<string>("pt1");
    const [referenceNumber, setReferenceNumber] = React.useState("PO-2024-001");
    const [notes, setNotes] = React.useState("Giao hàng trong giờ hành chính");

    const [lines, setLines] = React.useState<POLineItem[]>([
        {
            id: "l1",
            itemId: "i1",
            itemCode: "ITEM-001",
            itemName: "Steel Sheet 5mm",
            description: "Industrial steel sheet, 5mm thickness",
            quantity: 10,
            uom: "Sheet",
            unitPrice: 120,
            total: 1200
        }
    ]);

    const subtotal = lines.reduce((acc, line) => acc + (line.quantity * line.unitPrice), 0);
    const grandTotal = subtotal;

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

    const handleSave = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        toast.success("Đơn đặt hàng đã được cập nhật!");
        setIsSubmitting(false);
        setIsEditing(false);
    };

    const handleCancelPO = async () => {
        if (!cancelReason.trim()) {
            toast.error("Vui lòng nhập lý do hủy.");
            return;
        }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus("Cancelled");
        toast.success("Đơn đặt hàng đã bị hủy.");
        setIsSubmitting(false);
        setShowCancelDialog(false);
        setCancelReason("");
    };

    const handleSubmitForApproval = async () => {
        if (!validateForm()) return;
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus("Pending Approval");
        toast.success("Đã gửi duyệt đơn hàng!");
        setIsSubmitting(false);
        setIsEditing(false);
    };

    const handleApprove = async () => {
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus("Approved");
        toast.success("Đơn hàng đã được duyệt!");
        setIsSubmitting(false);
    };

    const handleReject = async () => {
        if (!rejectReason.trim()) {
            toast.error("Vui lòng nhập lý do từ chối.");
            return;
        }
        setIsSubmitting(true);
        await new Promise(resolve => setTimeout(resolve, 1000));
        setStatus("Rejected");
        toast.success("Đơn hàng đã bị từ chối!");
        setIsSubmitting(false);
        setShowRejectDialog(false);
        setRejectReason("");
    };

    return (
        <div className="min-h-screen bg-muted/40 p-6 flex flex-col gap-6">
            <div className="flex items-center gap-4">
                <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => router.back()}>
                    <ChevronLeft className="h-5 w-5" />
                    <span className="sr-only">Back</span>
                </Button>
                <div className="flex flex-col gap-1">
                    <h1 className="flex-1 shrink-0 whitespace-nowrap text-xl font-semibold tracking-tight sm:grow-0">
                        Chi tiết đơn đặt hàng <span className="text-muted-foreground">#{id}</span>
                    </h1>
                    <div className="flex items-center gap-2">
                        <Badge variant={
                            status === "Draft" ? "secondary" :
                                status === "Pending Approval" ? "secondary" :
                                    status === "Approved" ? "default" :
                                        status === "Rejected" ? "destructive" : "outline"
                        } className={
                            status === "Pending Approval" ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-100" :
                                status === "Approved" ? "bg-green-100 text-green-800 hover:bg-green-100" : ""
                        }>
                            {status === "Draft" && "Nháp"}
                            {status === "Pending Approval" && "Chờ duyệt"}
                            {status === "Approved" && "Đã duyệt"}
                            {status === "Rejected" && "Từ chối"}
                            {status === "Cancelled" && "Đã hủy"}
                        </Badge>
                    </div>
                </div>

                <div className="hidden items-center gap-2 md:ml-auto md:flex">
                    {/* View Mode Actions */}
                    {!isEditing && status === "Draft" && (
                        <>
                            <Button variant="outline" className="gap-2" onClick={() => setIsEditing(true)}>
                                <Edit className="h-4 w-4" /> Chỉnh sửa
                            </Button>
                            <Button variant="destructive" className="gap-2" onClick={() => setShowCancelDialog(true)}>
                                <Ban className="h-4 w-4" /> Hủy bỏ
                            </Button>
                            <Button className="gap-2" onClick={handleSubmitForApproval}>
                                <Send className="h-4 w-4" /> Gửi duyệt
                            </Button>
                        </>
                    )}

                    {/* Edit Mode Actions */}
                    {isEditing && (
                        <>
                            <Button variant="outline" onClick={() => setIsEditing(false)}>
                                Hủy chỉnh sửa
                            </Button>
                            <ActionButton action="save" onClick={handleSave} disabled={isSubmitting}>
                                Lưu thay đổi
                            </ActionButton>
                        </>
                    )}

                    {/* Pending Approval Actions */}
                    {status === "Pending Approval" && (
                        <>
                            <Button variant="destructive" className="gap-2" onClick={() => setShowRejectDialog(true)}>
                                <XCircle className="h-4 w-4" /> Từ chối
                            </Button>
                            <Button className="gap-2 bg-green-600 hover:bg-green-700" onClick={handleApprove}>
                                <CheckCircle className="h-4 w-4" /> Duyệt
                            </Button>
                        </>
                    )}


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
                                    <Select value={supplierId} onValueChange={handleSupplierChange} disabled={!isEditing}>
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
                                        readOnly={!isEditing}
                                        className={!isEditing ? "bg-muted" : ""}
                                    />
                                </div>

                                <div className="grid gap-3">
                                    <Label className="after:content-['*'] after:ml-0.5 after:text-red-500">Ngày đặt hàng</Label>
                                    <Popover>
                                        <PopoverTrigger asChild disabled={!isEditing}>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !poDate && "text-muted-foreground",
                                                    !isEditing && "bg-muted opacity-100"
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

                                <div className="grid gap-3">
                                    <Label>Ngày giao hàng dự kiến</Label>
                                    <Popover>
                                        <PopoverTrigger asChild disabled={!isEditing}>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "w-full pl-3 text-left font-normal",
                                                    !deliveryDate && "text-muted-foreground",
                                                    !isEditing && "bg-muted opacity-100"
                                                )}
                                            >
                                                {deliveryDate ? (
                                                    format(deliveryDate, "dd/MM/yyyy")
                                                ) : (
                                                    <span>Chọn ngày</span>
                                                )}
                                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={deliveryDate}
                                                onSelect={(d) => setDeliveryDate(d)}
                                                disabled={(date) =>
                                                    date < poDate
                                                }
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid gap-3">
                                    <Label>Tiền tệ</Label>
                                    <Input value={currency} readOnly className="bg-muted" />
                                </div>


                                <div className="grid gap-3 sm:col-span-2">
                                    <Label htmlFor="notes">Ghi chú</Label>
                                    <Textarea
                                        id="notes"
                                        className={cn("min-h-20", !isEditing && "bg-muted")}
                                        placeholder="Ghi chú đơn hàng..."
                                        value={notes}
                                        onChange={e => setNotes(e.target.value)}
                                        readOnly={!isEditing}
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
                            {isEditing && (
                                <Button size="sm" variant="secondary" onClick={handleAddItem} className="gap-1">
                                    <Plus className="h-4 w-4" />
                                    Thêm sản phẩm
                                </Button>
                            )}
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
                                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
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
                                                            disabled={!isEditing}
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
                                                            value={line.quantity}
                                                            onChange={(e) => {
                                                                const val = parseInt(e.target.value);
                                                                handleUpdateLine(line.id, 'quantity', isNaN(val) ? 0 : val);
                                                            }}
                                                            readOnly={!isEditing}
                                                            className={!isEditing ? "bg-muted h-8 w-24" : "h-8 w-24"}
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
                                                            value={line.unitPrice}
                                                            onChange={(e) => handleUpdateLine(line.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                                            readOnly={!isEditing}
                                                            className={!isEditing ? "bg-muted h-8 w-24" : "h-8 w-24"}
                                                        />
                                                    </TableCell>
                                                    <TableCell className="text-right font-medium pt-3 text-sm">
                                                        {line.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                                                    </TableCell>
                                                    <TableCell>
                                                        {isEditing && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-8 w-8 text-destructive hover:text-destructive/90"
                                                                onClick={() => handleRemoveItem(line.id)}
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        )}
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

            {/* Cancel PO Dialog */}
            <Dialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Hủy đơn đặt hàng</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn hủy đơn hàng này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="cancel-reason" className="after:content-['*'] after:ml-0.5 after:text-red-500">Lý do hủy</Label>
                            <Textarea
                                id="cancel-reason"
                                placeholder="Nhập lý do hủy đơn hàng..."
                                value={cancelReason}
                                onChange={(e) => setCancelReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCancelDialog(false)}>Đóng</Button>
                        <Button variant="destructive" onClick={handleCancelPO} disabled={isSubmitting || !cancelReason.trim()}>
                            Xác nhận hủy
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Reject PO Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Từ chối duyệt đơn hàng</DialogTitle>
                        <DialogDescription>
                            Vui lòng nhập lý do từ chối đơn hàng này.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <Label htmlFor="reject-reason" className="after:content-['*'] after:ml-0.5 after:text-red-500">Lý do từ chối</Label>
                            <Textarea
                                id="reject-reason"
                                placeholder="Nhập lý do từ chối..."
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowRejectDialog(false)}>Đóng</Button>
                        <Button variant="destructive" onClick={handleReject} disabled={isSubmitting || !rejectReason.trim()}>
                            Từ chối
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
