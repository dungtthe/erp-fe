"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import ProductList, { ProductListProps } from "./ProductList";
import { ReactNode } from "react";

interface ProductListDialogProps extends ProductListProps {
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
    trigger?: ReactNode;
    title?: string;
}

export default function ProductListDialog({
    open,
    onOpenChange,
    trigger,
    title = "Danh sách sản phẩm",
    ...productListProps
}: ProductListDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="max-w-[90vw] w-full lg:max-w-5xl h-[90vh] flex flex-col p-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle>{title}</DialogTitle>
                </DialogHeader>
                <div className="flex-1 overflow-y-auto px-6 pb-6">
                    <ProductList {...productListProps} />
                </div>
            </DialogContent>
        </Dialog>
    );
}
