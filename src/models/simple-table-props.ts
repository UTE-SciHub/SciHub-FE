import { Column } from "@/models/column";

export interface SimpleDataTableProps {
    columns: Column[];
    data: any[];
    emptyMessage?: string;
    rowKey?: string | ((record: any) => string);
    maxHeight?: string;
    minHeight?: string;
    loading?: boolean;

    // Pagination props
    pagination?: boolean;
    currentPage?: number;
    totalItems?: number;
    itemsPerPage?: number;
    pageSizeOptions?: number[];
    onPageChange?: (page: number) => void;
    onPageSizeChange?: (pageSize: number) => void;

    // Sorting props
    onSortChange?: (sortBy: string, order: string) => void;
}