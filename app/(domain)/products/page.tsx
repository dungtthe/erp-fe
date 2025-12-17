"use client";

import {
  Filter,
  Loader2,
  MoreHorizontal,
  Search
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import ActionButton from "@/my-components/btn/ActionButton";

// Types and Enums
export enum ProductType {
  FinishedProduct = 1,
  SemiFinished = 2,
  RawMaterial = 3,
  Consumable = 4,
}

type Product = {
  id: string;
  name: string;
  code: string;
  image?: string;
  productType: ProductType;
  costPrice: number;
  productVariantNumber: number;
};

type PagedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};

const PRODUCT_TYPE_LABELS: Record<ProductType, string> = {
  [ProductType.FinishedProduct]: "Thành phẩm",
  [ProductType.SemiFinished]: "Bán thành phẩm",
  [ProductType.RawMaterial]: "Nguyên vật liệu",
  [ProductType.Consumable]: "Vật tư tiêu hao",
};

const PRODUCT_TYPE_COLORS: Record<ProductType, string> = {
  [ProductType.FinishedProduct]: "bg-blue-100 text-blue-700 hover:bg-blue-100/80",
  [ProductType.SemiFinished]: "bg-amber-100 text-amber-700 hover:bg-amber-100/80",
  [ProductType.RawMaterial]: "bg-slate-100 text-slate-700 hover:bg-slate-100/80",
  [ProductType.Consumable]: "bg-purple-100 text-purple-700 hover:bg-purple-100/80",
};

export default function ProductsPage() {
  // State
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [productType, setProductType] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 20,
    totalCount: 0,
    totalPages: 1,
  });

  // Debounce search term to avoid too many API calls
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch Data
  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const body: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        searchTerm: debouncedSearchTerm,
      };



      const response = await api.post<PagedResult<Product>>("products", body);

      if (response.success && response.data) {
        setProducts(response.data.items);
        setPagination((prev) => ({
          ...prev,
          totalCount: response.data!.totalCount,
          totalPages: response.data!.totalPages,
        }));
      }
    } catch (error) {
      console.error("Failed to fetch products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [pagination.page, pagination.pageSize, debouncedSearchTerm]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Handlers
  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 })); // Reset to page 1 on search
  };

  const handleTypeChange = (value: string) => {
    setProductType(value);
  };

  const filteredProducts = products.filter((product) => {
    if (productType === "all") return true;
    return product.productType === parseInt(productType);
  });

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="mx-auto max-w-[1280px] p-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-[1.3] text-gray-900">
            Danh sách sản phẩm
          </h1>
        </div>

        {/* Controls Section */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm sản phẩm..."
                className="h-10 w-full border-gray-200 pl-9 rounded-lg focus-visible:ring-blue-600"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={productType} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-10 w-[180px] rounded-lg border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Loại sản phẩm" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value={ProductType.FinishedProduct.toString()}>Thành phẩm</SelectItem>
                <SelectItem value={ProductType.SemiFinished.toString()}>Bán thành phẩm</SelectItem>
                <SelectItem value={ProductType.RawMaterial.toString()}>Nguyên vật liệu</SelectItem>
                <SelectItem value={ProductType.Consumable.toString()}>Vật tư tiêu hao</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center gap-3">
            <ActionButton action="create" href="/products/create">
              Add Product
            </ActionButton>
          </div>
        </div>

        {/* Content Section */}
        <Card className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
          <div className="w-full overflow-auto">
            <table className="w-full caption-bottom text-sm">
              <thead className="border-b border-gray-200 bg-gray-50/50">
                <tr className="border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted">
                  <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[80px]">
                    STT
                  </th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[300px]">
                    Thông tin sản phẩm
                  </th>
                  <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Loại sản phẩm
                  </th>
                  <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Giá vốn
                  </th>
                  <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Biến thể
                  </th>
                  <th className="h-12 px-6 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[50px]">
                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {isLoading ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center">
                      <div className="flex justify-center items-center gap-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Đang tải dữ liệu...
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="h-24 text-center text-muted-foreground">
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => {
                    const stt = (pagination.page - 1) * pagination.pageSize + index + 1;
                    return (
                      <tr
                        key={product.id}
                        className="border-b border-gray-100 transition-colors hover:bg-gray-50 data-[state=selected]:bg-muted"
                      >
                        <td className="p-4 align-middle px-3 text-muted-foreground font-medium text-sm">
                          {stt.toString().padStart(2, '0')}
                        </td>
                        <td className="p-4 align-middle px-6">
                          <div className="flex items-center gap-4">
                            <Avatar className="h-10 w-10 rounded-lg border border-gray-100">
                              <AvatarImage
                                src={product.image}
                                alt={product.name}
                                className="object-cover"
                              />
                              <AvatarFallback className="rounded-lg bg-gray-50 text-xs font-medium text-gray-500">
                                {product.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex flex-col">
                              <span className="text-sm font-medium text-gray-900">
                                {product.name}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {product.code}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-4 align-middle px-3">
                          <Badge
                            className={cn(
                              "font-medium border-0 px-2.5 py-0.5",
                              PRODUCT_TYPE_COLORS[product.productType] || "bg-gray-100 text-gray-700"
                            )}
                          >
                            {PRODUCT_TYPE_LABELS[product.productType] || "N/A"}
                          </Badge>
                        </td>
                        <td className="p-4 align-middle px-6 text-right">
                          <span className="text-sm font-medium text-gray-900">
                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.costPrice)}
                          </span>
                        </td>
                        <td className="p-4 align-middle px-6 text-right">
                          <span className="text-sm text-gray-600">
                            {product.productVariantNumber} biến thể
                          </span>
                        </td>
                        <td className="p-4 align-middle px-6 text-center">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                className="h-8 w-8 p-0 text-muted-foreground hover:text-gray-900"
                              >
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-[160px]">
                              <DropdownMenuLabel>Thao tác</DropdownMenuLabel>
                              <DropdownMenuItem>Xem chi tiết</DropdownMenuItem>
                              <DropdownMenuItem>Chỉnh sửa</DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem className="text-red-600 focus:text-red-600">
                                Xóa sản phẩm
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {products.length > 0 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
              <div className="text-xs text-muted-foreground">
                Hiển thị <strong>{(pagination.page - 1) * pagination.pageSize + 1}-{Math.min(pagination.page * pagination.pageSize, pagination.totalCount)}</strong> của <strong>{pagination.totalCount}</strong> sản phẩm
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={pagination.page <= 1}
                  onClick={() => handlePageChange(pagination.page - 1)}
                >
                  <span className="sr-only">Previous</span>
                  <span aria-hidden="true">«</span>
                </Button>

                {/* Simple pagination logic: show current page */}
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(p => p === 1 || p === pagination.totalPages || Math.abs(p - pagination.page) <= 1) // Show first, last, and neighbors
                  .map((p, i, arr) => {
                    const isGap = i > 0 && p - arr[i - 1] > 1;
                    return (
                      <div key={p} className="flex items-center">
                        {isGap && <span className="px-1 text-muted-foreground">...</span>}
                        <Button
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-8 w-8 p-0",
                            pagination.page === p
                              ? "bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white"
                              : ""
                          )}
                          onClick={() => handlePageChange(p)}
                        >
                          {p}
                        </Button>
                      </div>
                    );
                  })}

                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  disabled={pagination.page >= pagination.totalPages}
                  onClick={() => handlePageChange(pagination.page + 1)}
                >
                  <span className="sr-only">Next</span>
                  <span aria-hidden="true">»</span>
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
