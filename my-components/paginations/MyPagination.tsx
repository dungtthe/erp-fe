"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { Pagination, PaginationContent, PaginationEllipsis, PaginationItem, PaginationLink } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

export interface PaginationData {
  page: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface MyPaginationProps {
  paginationData: PaginationData;
  onPageChange: (page: number) => void;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
}

export default function MyPagination({ paginationData, onPageChange, className, previousLabel = "Trước", nextLabel = "Sau" }: MyPaginationProps) {
  const { page: currentPage, totalPages, hasNextPage, hasPreviousPage } = paginationData;

  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const showEllipsis = totalPages > 7;

    if (!showEllipsis) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage <= 3) {
        for (let i = 2; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push("ellipsis");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push("ellipsis");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("ellipsis");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  if (totalPages <= 1) {
    return null;
  }

  return (
    <Pagination className={className}>
      <PaginationContent>
        <PaginationItem>
          <PaginationLink
            onClick={() => {
              if (hasPreviousPage) {
                onPageChange(currentPage - 1);
              }
            }}
            className={cn("gap-1 px-2.5 mr-3 sm:pl-2.5", !hasPreviousPage ? "pointer-events-none opacity-50" : "cursor-pointer")}
            aria-label="Go to previous page"
          >
            <ChevronLeftIcon className="h-4 w-4" />
            <span className="hidden sm:block">{previousLabel}</span>
          </PaginationLink>
        </PaginationItem>

        {getPageNumbers().map((pageNum, index) => {
          if (pageNum === "ellipsis") {
            return (
              <PaginationItem key={`ellipsis-${index}`}>
                <PaginationEllipsis />
              </PaginationItem>
            );
          }

          return (
            <PaginationItem key={pageNum}>
              <PaginationLink onClick={() => onPageChange(pageNum as number)} isActive={currentPage === pageNum} className="cursor-pointer">
                {pageNum}
              </PaginationLink>
            </PaginationItem>
          );
        })}

        <PaginationItem>
          <PaginationLink
            onClick={() => {
              if (hasNextPage) {
                onPageChange(currentPage + 1);
              }
            }}
            className={cn("gap-1 px-2.5 ml-2 sm:pr-2.5", !hasNextPage ? "pointer-events-none opacity-50" : "cursor-pointer")}
            aria-label="Go to next page"
          >
            <span className="hidden sm:block">{nextLabel}</span>
            <ChevronRightIcon className="h-4 w-4" />
          </PaginationLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
