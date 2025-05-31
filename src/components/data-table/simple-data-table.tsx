import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Pagination from "@/components/pagination/pagination"
import type { SimpleDataTableProps } from "@/models/simple-table-props"

const SimpleDataTable: React.FC<SimpleDataTableProps> = ({
    columns,
    data,
    emptyMessage = "Không có dữ liệu",
    rowKey = "id",
    loading = false,

    // Pagination props with defaults
    pagination = false,
    currentPage = 1,
    totalItems = 0,
    itemsPerPage = 10,
    pageSizeOptions = [5, 10, 15, 20],
    onPageChange = () => { },
    onPageSizeChange = () => { },

    // Sorting props
    onSortChange = () => { },

    // Height props
    maxHeight = "auto",
    minHeight = "auto",
}) => {
    const navigate = useNavigate()
    const location = useLocation()
    const [sortBy, setSortBy] = useState<string | null>(null)
    const [order, setOrder] = useState<string | null>(null)

    // Initialize sorting state from URL parameters
    useEffect(() => {
        const params = new URLSearchParams(location.search)
        const initialSortBy = params.get("sort")
        const initialOrder = params.get("order")
        if (initialSortBy && initialOrder) {
            setSortBy(initialSortBy)
            setOrder(initialOrder)
        }
    }, [location.search])

    // Function to get the key for each row
    const getRowKey = (record: any, index: number): string => {
        if (typeof rowKey === "function") {
            return rowKey(record)
        }
        return record[rowKey]?.toString() || `row-${index}`
    }

    // Calculate pagination values
    const totalPages = Math.ceil(totalItems / itemsPerPage)
    const maxPageButtons = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPageButtons / 2))
    const endPage = Math.min(totalPages, startPage + maxPageButtons - 1)

    if (endPage - startPage + 1 < maxPageButtons) {
        startPage = Math.max(1, endPage - maxPageButtons + 1)
    }

    const handleSort = (field: string) => {
        let newOrder = "asc"
        if (sortBy === field && order === "asc") {
            newOrder = "desc"
        }
        setSortBy(field)
        setOrder(newOrder)
        onSortChange(field, newOrder)

        const params = new URLSearchParams(location.search)
        params.set("sort", field)
        params.set("order", newOrder)
        navigate({ search: params.toString() }, { replace: true })
    }

    // Add a default column for the index
    const displayColumns = [
        {
            key: "index",
            title: "STT",
            width: "10px",
            render: (_, __, index) => (currentPage - 1) * itemsPerPage + index + 1,
        },
        ...columns,
    ]

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
                                        {column.sortable && <span>{sortBy === column.key ? (order === "asc" ? " 🔼" : " 🔽") : " ⬍"}</span>}
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
                                    <TableRow key={getRowKey(record, index)} className="">
                                        {displayColumns.map((column) => (
                                            <TableCell
                                                key={`${getRowKey(record, index)}-${column.key}`}
                                                style={{
                                                    width: column.width,
                                                    maxWidth: column.width,
                                                    overflow: "hidden",
                                                    textOverflow: "ellipsis",
                                                    whiteSpace: "nowrap",
                                                }}
                                                className={
                                                    column.align === "right" ? "text-right" : column.align === "center" ? "text-center" : ""
                                                }
                                                title={record[column.key]} // Add tooltip for truncated content
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

                            {pagination &&
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
    )
}

export default SimpleDataTable

