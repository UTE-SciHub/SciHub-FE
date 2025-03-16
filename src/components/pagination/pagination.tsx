import { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  startPage: number;
  endPage: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  pageSizeOptions?: number[];
  onPageSizeChange?: (pageSize: number) => void;
}

const Pagination = ({
  currentPage: propCurrentPage,
  totalPages,
  startPage,
  endPage,
  onPageChange,
  totalItems,
  itemsPerPage: propItemsPerPage,
  pageSizeOptions = [5, 10, 15, 20],
  onPageSizeChange,
}: PaginationProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const isUserAction = useRef(false);

  // State nội bộ
  const [currentPage, setCurrentPage] = useState(propCurrentPage);
  const [itemsPerPage, setItemsPerPage] = useState(propItemsPerPage || 5);

  const normalizePageSize = (size: number) => {
    const validSizes = pageSizeOptions;
    if (size < 5) return 5;
    return validSizes.includes(size)
      ? size
      : validSizes.reduce((prev, curr) =>
        Math.abs(curr - size) < Math.abs(prev - size) ? curr : prev
      );
  };

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const pageFromUrl = parseInt(params.get("p") || "1", 10);
    const sizeFromUrl = parseInt(params.get("s") || propItemsPerPage?.toString() || "5", 10);

    const normalizedSize = normalizePageSize(sizeFromUrl);
    const maxPage = Math.ceil((totalItems || 0) / normalizedSize);
    const normalizedPage = Math.max(1, Math.min(pageFromUrl, maxPage));

    if (!isUserAction.current) {
      if (normalizedPage !== currentPage || normalizedSize !== itemsPerPage) {
        setCurrentPage(normalizedPage);
        setItemsPerPage(normalizedSize);

        if (normalizedPage !== propCurrentPage) {
          onPageChange(normalizedPage);
        }
        if (onPageSizeChange && normalizedSize !== propItemsPerPage) {
          onPageSizeChange(normalizedSize);
        }
      }
    } else {
      const urlPage = parseInt(params.get("p") || "1", 10);
      const urlSize = parseInt(params.get("s") || itemsPerPage.toString(), 10);

      if (currentPage !== urlPage || itemsPerPage !== urlSize) {
        params.set("p", currentPage.toString());
        params.set("s", itemsPerPage.toString());
        navigate({ search: params.toString() }, { replace: true });
      }
      isUserAction.current = false;
    }
  }, [
    location.search,
    totalItems,
    propItemsPerPage,
    propCurrentPage,
    onPageChange,
    onPageSizeChange,
    currentPage,
    itemsPerPage,
    navigate,
  ]);

  const handlePageChange = (page: number) => {
    isUserAction.current = true;
    setCurrentPage(page);
    onPageChange(page);
  };

  const handleSizeChange = (size: number) => {
    isUserAction.current = true;
    const normalizedSize = normalizePageSize(size);
    const newMaxPage = Math.ceil((totalItems || 0) / normalizedSize);

    setItemsPerPage(normalizedSize);
    if (onPageSizeChange) {
      onPageSizeChange(normalizedSize);
    }

    if (currentPage > newMaxPage) {
      setCurrentPage(newMaxPage);
      onPageChange(newMaxPage);
    }
  };

  const pageNumbers = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

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
            onValueChange={(value) => handleSizeChange(Number(value))}
          >
            <SelectTrigger className="h-8 w-[70px]">
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

      {totalItems && itemsPerPage && totalItems > 0 && (
        <div className="text-sm text-muted-foreground sm:ml-4">
          Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, totalItems)}{" "}
          đến {Math.min(currentPage * itemsPerPage, totalItems)} trong tổng số{" "}
          {totalItems} mục
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center space-x-2 sm:ml-auto">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
          >
            <ChevronsLeft className="h-4 w-4" />
            <span className="sr-only">Trang đầu tiên</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
            <span className="sr-only">Trang trước</span>
          </Button>

          {pageNumbers.map((page) => (
            <Button
              key={page}
              variant={currentPage === page ? "default" : "outline"}
              size="icon"
              onClick={() => handlePageChange(page)}
            >
              {page}
            </Button>
          ))}

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
            <span className="sr-only">Trang tiếp theo</span>
          </Button>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
          >
            <ChevronsRight className="h-4 w-4" />
            <span className="sr-only">Trang cuối cùng</span>
          </Button>
        </div>
      )}
    </div>
  );
};

export default Pagination;