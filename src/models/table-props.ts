import { Column } from "@/models/column";

export interface DataTableProps {
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

    // Selection props
    selectable?: boolean;
    selectedRowKeys?: string[];
    onSelectionChange?: (selectedRowKeys: string[], selectedRows: any[]) => void;

    // Sorting props
    onSortChange?: (sortBy: string, order: string) => void;
}