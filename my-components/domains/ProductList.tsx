"use client";

import { useRouter } from "next/navigation";
import Image from "next/image";

import { AspectRatio } from "@/components/ui/aspect-ratio";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { GetImageUrl } from "@/helpers/URLUtil";
import { cn } from "@/lib/utils";
import DetailIcon from "@/my-components/icons/DetailIcon";
import MyPagination from "@/my-components/paginations/MyPagination";
import { PRODUCT_TYPE_COLORS, PRODUCT_TYPE_LABELS } from "@/resources/ProductResource";
import { Product } from "../../app/(domain)/products/_services/productService";

export interface ProductListProps {
    products: Product[];
    pagination: {
        page: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
    };
    onPageChange: (newPage: number) => void;
    onSelect?: (product: Product) => void;
}

import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ProductList({ products, pagination, onPageChange, onSelect }: ProductListProps) {
    const router = useRouter();

    return (
        <Card className="px-5">
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>STT</TableHead>
                            <TableHead>Hình ảnh</TableHead>
                            <TableHead>Tên sản phẩm</TableHead>
                            <TableHead>Mã sản phẩm</TableHead>
                            <TableHead>Loại sản phẩm</TableHead>
                            <TableHead>Số biến thể</TableHead>
                            <TableHead className="w-0">Hành động</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {products.map((item, index) => (
                            <TableRow key={item.id}>
                                <TableCell>{(pagination.page - 1) * pagination.pageSize + index + 1}</TableCell>
                                <TableCell className="pr-10">
                                    <div className="rounded-sm overflow-hidden">
                                        <AspectRatio ratio={16 / 9}>
                                            <Image src={GetImageUrl(item.image ?? "")} alt={item.name} fill className="object-cover" />
                                        </AspectRatio>
                                    </div>
                                </TableCell>

                                <TableCell>{item.name}</TableCell>
                                <TableCell>{item.code}</TableCell>
                                <TableCell>
                                    <Badge className={cn("font-medium border-0 px-2.5 py-0.5", PRODUCT_TYPE_COLORS[item.productType])}>{PRODUCT_TYPE_LABELS[item.productType]}</Badge>
                                </TableCell>
                                <TableCell>{item.productVariantNumber}</TableCell>
                                <TableCell>
                                    <div className="flex items-center justify-center">
                                        {onSelect ? (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                onClick={() => onSelect(item)}
                                                className="text-primary hover:text-primary/80 hover:bg-primary/10"
                                            >
                                                <CheckCircle2 className="h-5 w-5" />
                                            </Button>
                                        ) : (
                                            <DetailIcon onClick={() => router.push(`/products/${item.id}`)} />
                                        )}
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
                    onPageChange={onPageChange}
                />
            </CardFooter>
        </Card>
    );
}
