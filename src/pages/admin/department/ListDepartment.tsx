import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/data-table/data-table";
import { useLocation, useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/use-debounce";
import { Column } from "@/models/column";
import { Button } from "@/components/ui/button";
import { Badge, Ban, CirclePlus, Eye, Lock, MoreHorizontal, Trash2, Unlock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { getAll } from "@/service/department-service";
import { Department } from "@/models/department";
import CreateDepartmentModal from "@/pages/admin/department/CreateDepartmentModal";
import DepartmentDetailModal from "@/pages/admin/department/DepartmentDetailModal";
import { Tooltip } from "@/components/ui/tooltip";

const ListDepartment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 5;
    const initialQuery = params.get("q") || "";
    const initialSort = params.get("sort") || "createdAt";
    const initialOrder = params.get("order") || "desc";

    const [departments, setDepartments] = useState<Department[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(initialSize);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [sortField, setSortField] = useState(initialSort);
    const [sortOrder, setSortOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const isUpdatingUrl = useRef(false);

    const fetchData = async (params: {
        p: number;
        s: number;
        q: string;
        sort: string;
        order: string;
    }) => {
        setLoading(true);
        try {
            const response = await getAll({
                p: params.p,
                s: params.s,
                sort: params.sort,
                order: params.order,
                q: params.q,
            });

            setDepartments(response.data.data);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            console.error("Error fetching registration periods:", error);
            toast({
                title: "Có lỗi trong quá trình lấy dữ liệu!",
                variant: "error",
            })
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortField,
            order: sortOrder,
        });
    }, [currentPage, itemsPerPage, debouncedSearchQuery, sortField, sortOrder]);

    const updateUrl = (params: Record<string, string | number>) => {
        const searchParams = new URLSearchParams(location.search);
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.set(key, value.toString());
            } else {
                searchParams.delete(key);
            }
        });

        isUpdatingUrl.current = true;
        navigate({ search: searchParams.toString() }, { replace: true });
    };

    const handleSortChange = (field: string, order: string) => {
        setSortField(field);
        setSortOrder(order);

        console.log(`Sorting by ${field} in ${order} order`);
    };

    const handlePageChange = (pageNumber) => {
        console.log(
            `Fetching page ${pageNumber} with ${itemsPerPage} items per page`
        );
        setCurrentPage(pageNumber);
    };

    const handlePageSizeChange = (newPageSize) => {
        console.log(`Changing page size to ${newPageSize}`);

        const firstItemIndex = (currentPage - 1) * itemsPerPage + 1;
        const newCurrentPage = Math.max(1, Math.ceil(firstItemIndex / newPageSize));

        setItemsPerPage(newPageSize);
        setCurrentPage(newCurrentPage);
    };

    const handleViewDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setIsDetailModalOpen(true);
    };

    const getStatusBadge = (status: boolean | string) => {
        switch (status) {
            case true:
                return (
                    <div className="flex items-center justify-center">
                        <Lock className="h-6 w-6 text-rose-500" />
                    </div>
                );
            case false:
                return (
                    <div className="flex items-center justify-center">
                        <Unlock className="h-6 w-6 text-green-500" />
                    </div>
                );
            default:
                return (
                    <div className="flex items-center justify-center">
                        <Unlock className="h-6 w-6 text-green-500" />
                    </div>
                );
        }
    };

    const columns: Column[] = [
        { key: "name", title: "Tên khoa", sortable: true, width: "200px" },
        { key: "description", title: "Mô tả", width: "150px" },
        { key: "phoneNumber", title: "Số điện thoại", width: "100px" },
        { key: "email", title: "Email", width: "150px" },
        { key: "status", title: "Trạng thái", width: "80px", render: (_, record) => getStatusBadge(record.delFlag) },
        {
            key: "actions",
            title: "Thao tác",
            width: "80px",
            align: "center" as "center",
            render: (_, record) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                handleViewDepartment(record);
                            }}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);
        updateUrl({ q: value, p: 1 });
    };

    const handleMultipleBlock = () => {
        console.log("Selected rows:", selectedRows);
        setSelectedRowKeys([]);
        setSelectedRows([]);
    }

    const handleDepartmentAdded = () => {
        fetchData({
            p: 1,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortField,
            order: sortOrder,
        });
    };

    const handleDepartmentUpdated = () => {
        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortField,
            order: sortOrder,
        });
    }

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Danh sách khoa</h1>

                <Button
                    onClick={() => setIsAddModalOpen(true)}
                >
                    <CirclePlus /> Thêm mới khoa
                </Button>
            </div>
            <Card>
                <CardContent className="mt-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Input
                                className="border-primary"
                                type="text"
                                placeholder="Tìm kiếm theo tiêu đề..."
                                value={searchQuery}
                                onChange={handleSearchChange}
                            />
                        </div>

                        <div className="h-10 flex flex-1 justify-end items-center">
                            {selectedRowKeys.length > 0 ? (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                    <span className="text-sm min-w-[220px]">
                                        Đã chọn{" "}
                                        <span className="font-bold"> {selectedRowKeys.length}</span>{" "}
                                        dòng
                                    </span>
                                    <Button variant="destructive" onClick={handleMultipleBlock}>
                                        <Ban className="h-4 w-4" />
                                        {selectedRowKeys.length > 1 ? "Khóa tất cả" : "Khóa"}
                                    </Button>
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedRowKeys([]);
                                            setSelectedRows([]);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hủy chọn
                                    </Button>
                                </div>
                            ) : (
                                <div className="min-w-[260px]"></div>
                            )}
                        </div>
                    </div>

                    <DataTable
                        minHeight="auto"
                        maxHeight="550px"
                        loading={loading}
                        columns={columns}
                        data={departments}
                        itemsPerPage={itemsPerPage}
                        pagination={true}
                        currentPage={currentPage}
                        totalItems={departments.length}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        onSortChange={handleSortChange}
                    />
                </CardContent>
            </Card>

            <CreateDepartmentModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onDepartmentAdded={handleDepartmentAdded}
            />

            {selectedDepartment && (
                <DepartmentDetailModal
                    open={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    department={selectedDepartment}
                    onDepartmentUpdated={handleDepartmentUpdated}
                    readOnly={true}
                />
            )}
        </div>
    );
};

export default ListDepartment;
