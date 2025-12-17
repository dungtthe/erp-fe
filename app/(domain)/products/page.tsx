"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Search,
  Filter,
  MoreHorizontal,
  ArrowUpDown,
  Plus,
  Download,
  Settings,
} from "lucide-react";

import ActionButton from "@/my-components/btn/ActionButton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

// Mock Data
type Product = {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: "active" | "draft" | "archived";
  image?: string;
};

const PRODUCTS: Product[] = [
  {
    id: "PROD-001",
    name: "Premium Ergonomic Chair",
    sku: "FUR-CH-001",
    category: "Furniture",
    price: 249.0,
    stock: 45,
    status: "active",
    image: "/placeholder-chair.jpg",
  },
  {
    id: "PROD-002",
    name: "Wireless Mechanical Keyboard",
    sku: "TEC-KB-002",
    category: "Electronics",
    price: 129.5,
    stock: 12,
    status: "active",
  },
  {
    id: "PROD-003",
    name: "Minimalist Desk Lamp",
    sku: "LIG-DL-003",
    category: "Lighting",
    price: 45.0,
    stock: 0,
    status: "archived",
  },
  {
    id: "PROD-004",
    name: "Smart Noise-Cancelling Headphones",
    sku: "TEC-AU-004",
    category: "Electronics",
    price: 299.0,
    stock: 8,
    status: "draft",
  },
  {
    id: "PROD-005",
    name: "Ceramic Coffee Mug Set",
    sku: "KIT-CW-005",
    category: "Kitchenware",
    price: 24.99,
    stock: 150,
    status: "active",
  },
];

export default function ProductsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const statusColors = {
    active: { bg: "bg-green-100", text: "text-green-600", label: "Active" },
    draft: { bg: "bg-amber-100", text: "text-amber-600", label: "Draft" },
    archived: { bg: "bg-gray-100", text: "text-gray-600", label: "Archived" },
  };

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
                placeholder="Search products..."
                className="h-10 w-full border-gray-200 pl-9 rounded-lg focus-visible:ring-blue-600"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-10 w-[160px] rounded-lg border-gray-200">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-muted-foreground" />
                  <SelectValue placeholder="Status" />
                </div>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
                  <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[0px]">
                    STT
                  </th>
                  <th className="h-12 px-6 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[300px]">
                    Thông tin sản phẩm
                  </th>
                  <th className="h-12 px-3 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Loại sản phẩm
                  </th>
                  <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Giá bán
                  </th>
                  <th className="h-12 px-6 text-right align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0">
                    Biến thể
                  </th>
                  <th className="h-12 px-6 text-center align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 w-[50px]">

                  </th>
                </tr>
              </thead>
              <tbody className="[&_tr:last-child]:border-0">
                {PRODUCTS.map((product, index) => (
                  <tr
                    key={product.id}
                    className="border-b border-gray-100 transition-colors hover:bg-gray-50 data-[state=selected]:bg-muted"
                  >
                    <td className="p-4 align-middle px-3 text-muted-foreground font-medium text-sm">
                      {(index + 1).toString().padStart(2, '0')}
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
                            {product.sku}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 align-middle px-6">
                      <span className="text-sm text-gray-600">
                        {product.category}
                      </span>
                    </td>
                    <td className="p-4 align-middle px-6 text-right">
                      <span className="text-sm font-medium text-gray-900">
                        ${product.price.toFixed(2)}
                      </span>
                    </td>
                    <td className="p-4 align-middle px-6 text-right">
                      <span
                        className={cn(
                          "text-sm",
                          product.stock === 0
                            ? "text-red-500 font-medium"
                            : "text-gray-600"
                        )}
                      >
                        {product.stock} biến thể
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
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem>View details</DropdownMenuItem>
                          <DropdownMenuItem>Edit product</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600 focus:text-red-600">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Mock */}
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50">
            <div className="text-xs text-muted-foreground">
              Showing <strong>1-5</strong> of <strong>5</strong> products
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-8 w-8 p-0" disabled>
                <span className="sr-only">Previous</span>
                <span aria-hidden="true">«</span>
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0 bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white">
                1
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                2
              </Button>
              <Button variant="outline" size="sm" className="h-8 w-8 p-0">
                <span className="sr-only">Next</span>
                <span aria-hidden="true">»</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
