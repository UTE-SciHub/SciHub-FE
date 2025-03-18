import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

const Pagination = ({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  pageSizeOptions = [5, 10, 15, 20],
  onPageSizeChange,
}: PaginationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [inputPage, setInputPage] = useState(currentPage.toString());

  useEffect(() => {
    setInputPage(currentPage.toString());
  }, [currentPage]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    params.set("p", currentPage.toString());
    if (itemsPerPage) {
      params.set("s", itemsPerPage.toString());
    }
    navigate({ search: params.toString() }, { replace: true });
  }, [currentPage, itemsPerPage, navigate, location.search]);

  const handleInputPageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputPage(e.target.value);
  };

  const handleGoToPage = () => {
    const page = parseInt(inputPage, 10);
    if (!isNaN(page) && page >= 1 && page <= totalPages) {
      onPageChange(page);
    } else {
      setInputPage(currentPage.toString());
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      handleGoToPage();
    }
  };

  const getPageNumbers = () => {
    const pages = [];

    pages.push(currentPage);

    if (currentPage > 1) {
      pages.unshift(currentPage - 1);
    }
    if (currentPage < totalPages) {
      pages.push(currentPage + 1);
    }

    pages.sort((a, b) => a - b);

    // Add page 1 and "..." if needed
    if (pages[0] > 2) {
      pages.unshift("...");
      pages.unshift(1);
    } else if (pages[0] === 2) {
      pages.unshift(1);
    }

    if (pages[pages.length - 1] < totalPages - 1) {
      pages.push("...");
      pages.push(totalPages);
    } else if (pages[pages.length - 1] === totalPages - 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = getPageNumbers();

  if (totalPages <= 1 && !onPageSizeChange) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      {onPageSizeChange && itemsPerPage && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-muted-foreground">Hiển thị</span>
          <Select
            value={itemsPerPage.toString()}
            onValueChange={(value) => onPageSizeChange(Number(value))}
          >
            <SelectTrigger className="w-[70px]">
              <SelectValue placeholder={itemsPerPage} />
            </SelectTrigger>
            <SelectContent>
              {pageSizeOptions.map((size) => (
                <SelectItem key={size} value={size.toString()}>
                  {size}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-sm text-muted-foreground">mục mỗi trang</span>
        </div>
      )}

      {/* Item count info */}
      {totalItems && itemsPerPage && totalItems > 0 && (
        <div className="text-sm text-muted-foreground sm:ml-4">
          Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)} đến{" "}
          {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số {totalItems} mục
        </div>
      )}

      {/* Pagination controls */}
      {totalPages > 1 && (
        <div className="flex items-center space-x-2 sm:ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Trang đầu tiên</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>

          {pageNumbers.map((page, index) =>
            typeof page === "number" ? (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            ) : (
              <span key={`ellipsis-${index}`} className="px-2 text-muted-foreground">
                ...
              </span>
            )
          )}

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang tiếp theo</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Trang cuối cùng</span>
          </Button>
        </div>
      )}

      <div className="flex items-center gap-2">
        <Input
          type="number"
          value={inputPage}
          onChange={handleInputPageChange}
          onKeyDown={handleInputKeyDown}
          placeholder="Trang"
          className="w-14"
          min={1}
          max={totalPages}
        />
        <Button size="sm" onClick={handleGoToPage}>Đi</Button>
      </div>
    </div>
  );
};

export default Pagination;