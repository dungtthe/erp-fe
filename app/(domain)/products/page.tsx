"use client";

import { Filter, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import ActionButton from "@/my-components/btn/ActionButton";
import ProductList from "@/my-components/domains/ProductList";
import { ProductType } from "@/resources/ProductResource";
import { getProducts, Product } from "./_services/productService";

export default function ProductsPage() {

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [productType, setProductType] = useState<string>("all");
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 3,
    totalCount: 0,
    totalPages: 1,
  });

  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const body: any = {
        page: pagination.page,
        pageSize: pagination.pageSize,
        searchTerm: debouncedSearchTerm,
      };

      const response = await getProducts(body);

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

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPagination((prev) => ({ ...prev, page: newPage }));
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleTypeChange = (value: string) => {
    setProductType(value);
  };

  return (
    <div className="min-h-screen bg-muted/40">
      <div className="mx-auto  p-6">
        {/* Header Section */}
        <div className="mb-6 flex flex-col gap-1">
          <h1 className="text-2xl font-semibold leading-[1.3] text-foreground">Danh sách sản phẩm</h1>
        </div>

        {/* Controls Section */}
        <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Tìm kiếm sản phẩm..." className="h-10 w-full pl-9 rounded-lg bg-background focus-visible:ring-ring" value={searchTerm} onChange={handleSearchChange} />
            </div>
            <Select value={productType} onValueChange={handleTypeChange}>
              <SelectTrigger className="h-10 w-[180px] rounded-lg border-input bg-background">
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
              Thêm sản phẩm
            </ActionButton>
          </div>
        </div>

        {/* Content Section */}
        <ProductList products={products} pagination={pagination} onPageChange={handlePageChange} />
      </div>
    </div>
  );
}
