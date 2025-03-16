import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import Pagination from "@/components/pagination/pagination";
import { DataTableProps } from "@/models/table-props";

const DataTable: React.FC<DataTableProps> = ({
    columns,
    data,
    emptyMessage = "Không có dữ liệu",
    rowKey = "id",
    loading = false,
    maxHeight,
    minHeight,

    // Pagination props with defaults
    pagination = false,
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    pageSizeOptions = [5, 10, 15, 20],
    onPageChange = () => { },
    onPageSizeChange = () => { },

    // Selection props
    selectable = false,
    selectedRowKeys = [],
    onSelectionChange = () => { },

    // Sorting props
    onSortChange = () => { },
}) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [sortBy, setSortBy] = useState<string | null>(null);
    const [order, setOrder] = useState<string | null>(null);

    // Initialize sorting state from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const initialSortBy = params.get("sort");
        const initialOrder = params.get("order");
        if (initialSortBy && initialOrder) {
            setSortBy(initialSortBy);
            setOrder(initialOrder);
        }
    }, [location.search]);

    // Internal state for selected rows
    const [internalSelectedRowKeys, setInternalSelectedRowKeys] = useState<string[]>(selectedRowKeys || []);

    // Update internal state when prop changes
    useEffect(() => {
        setInternalSelectedRowKeys(selectedRowKeys);
    }, [selectedRowKeys]);

    // Function to get the key for each row
    const getRowKey = (record: any, index: number): string => {
        if (typeof rowKey === "function") {
            return rowKey(record);
        }
        return record[rowKey]?.toString() || `row-${index}`;
    };

    // Calculate pagination values
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const maxPageButtons = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2));
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1);

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1);
    }

    const handleSelectAll = (checked: boolean) => {
        if (checked) {
            // Select all rows on the current page
            const allKeys = data.map((record, index) => getRowKey(record, index));
            const newSelectedRowKeys = [...new Set([...internalSelectedRowKeys, ...allKeys])];
            setInternalSelectedRowKeys(newSelectedRowKeys);
            onSelectionChange(newSelectedRowKeys, data);
        } else {
            // Deselect all rows on the current page
            const allKeys = data.map((record, index) => getRowKey(record, index));
            const newSelectedRowKeys = internalSelectedRowKeys.filter((key) => !allKeys.includes(key));
            setInternalSelectedRowKeys(newSelectedRowKeys);
            onSelectionChange(newSelectedRowKeys, data.filter((item, idx) => newSelectedRowKeys.includes(getRowKey(item, idx))));
        }
    };

    const handleSelectRow = (checked: boolean, record: any, index: number) => {
        const key = getRowKey(record, index);
        let newSelectedRowKeys: string[];
        let selectedRows: any[];

        if (checked) {
            newSelectedRowKeys = [...internalSelectedRowKeys, key];
        } else {
            newSelectedRowKeys = internalSelectedRowKeys.filter((k) => k !== key);
        }

        selectedRows = data.filter((item, idx) => newSelectedRowKeys.includes(getRowKey(item, idx)));

        setInternalSelectedRowKeys(newSelectedRowKeys);
        onSelectionChange(newSelectedRowKeys, selectedRows);
    };

    const allSelected =
        data.length > 0 && data.every((record, index) => internalSelectedRowKeys.includes(getRowKey(record, index)));

    const someSelected =
        data.length > 0 &&
        data.some((record, index) => internalSelectedRowKeys.includes(getRowKey(record, index))) &&
        !allSelected;

    const handleSort = (field: string) => {
        let newOrder = "asc";
        if (sortBy === field && order === "asc") {
            newOrder = "desc";
        }
        setSortBy(field);
        setOrder(newOrder);
        onSortChange(field, newOrder);

        const params = new URLSearchParams(location.search);
        params.set("sort", field);
        params.set("order", newOrder);
        navigate({ search: params.toString() }, { replace: true });
    };

    const displayColumns = selectable
        ? [
            {
                key: "selection",
                title: (
                    <Checkbox
                        checked={allSelected}
                        data-state={someSelected ? "indeterminate" : allSelected ? "checked" : "unchecked"}
                        onCheckedChange={handleSelectAll}
                        aria-label="Select all"
                    />
                ),
                width: "40px",
                render: (_, record, index) => (
                    <Checkbox
                        checked={internalSelectedRowKeys.includes(getRowKey(record, index))}
                        onCheckedChange={(checked) => handleSelectRow(!!checked, record, index)}
                        aria-label={`Select row ${index + 1}`}
                    />
                ),
            },
            ...columns,
        ]
        : columns;

    return (
        <div className="space-y-4">
            <div className="border rounded-md">
                <div className="overflow-auto">
                    <Table className="relative w-full" maxHeight={maxHeight} minHeight={minHeight}>
                        <TableHeader>
                            <TableRow>
                                {displayColumns.map((column) => (
                                    <TableHead
                                        key={column.key}
                                        style={{ width: column.width }}
                                        align={column.align}
                                        onClick={() => column.sortable && handleSort(column.key)}
                                        className={column.sortable ? "cursor-pointer" : ""}
                                    >
                                        {column.title}
                                        {column.sortable && (
                                            <span>{sortBy === column.key ? (order === "asc" ? " 🔼" : " 🔽") : " ⬍"}</span>
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={displayColumns.length} className="text-center py-6 text-muted-foreground">
                                        Đang tải...
                                    </TableCell>
                                </TableRow>
                            ) : data.length > 0 ? (
                                data.map((record, index) => (
                                    <TableRow
                                        key={getRowKey(record, index)}
                                        className={internalSelectedRowKeys.includes(getRowKey(record, index)) ? "bg-gray-200" : ""}
                                    >
                                        {displayColumns.map((column) => (
                                            <TableCell
                                                key={`${getRowKey(record, index)}-${column.key}`}
                                                style={{ width: column.width }}
                                                className={
                                                    column.align === "right"
                                                        ? "text-right"
                                                        : column.align === "center"
                                                            ? "text-center"
                                                            : ""
                                                }
                                            >
                                                {column.render ? column.render(record[column.key], record, index) : record[column.key]}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={displayColumns.length} className="text-center py-6 text-muted-foreground">
                                        {emptyMessage}
                                    </TableCell>
                                </TableRow>
                            )}

                            {itemsPerPage &&
                                data.length > 0 &&
                                data.length < itemsPerPage &&
                                Array(itemsPerPage - data.length)
                                    .fill(0)
                                    .map((_, index) => (
                                        <TableRow key={`empty-${index}`} className="h-[53px]">
                                            <TableCell colSpan={displayColumns.length}></TableCell>
                                        </TableRow>
                                    ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {pagination && (
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    startPage={startPage}
                    endPage={endPage}
                    onPageChange={onPageChange}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    pageSizeOptions={pageSizeOptions}
                    onPageSizeChange={onPageSizeChange}
                />
            )}
        </div>
    );
};

export default DataTable;