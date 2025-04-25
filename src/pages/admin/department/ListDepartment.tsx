import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/data-table/data-table";
import { useLocation, useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/use-debounce";
import { Column } from "@/models/column";
import { Button } from "@/components/ui/button";
import { Badge, Ban, CirclePlus, Download, Eye, Lock, MoreHorizontal, RefreshCw, Trash2, Unlock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Department } from "@/models/department";
import CreateDepartmentModal from "@/pages/admin/department/CreateDepartmentModal";
import DepartmentDetailModal from "@/pages/admin/department/DepartmentDetailModal";
import DepartmentImage from "@/pages/admin/department/DepartmentImage";
import { DepartmentService } from "@/service/department-service";

const ListDepartment = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 5;
    const initialQuery = params.get("q") || "";
    const initialSort = params.get("sort") || "createdAt";
    const initialOrder = params.get("order") || "desc";
    const initialDelFlag = params.get("delFlag") || "all";

    const [departments, setDepartments] = useState<Department[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(initialSize);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortField, setSortField] = useState(initialSort);
    const [sortOrder, setSortOrder] = useState(initialOrder);
    const [delFlag, setDelFlag] = useState<string>(initialDelFlag);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const isUpdatingUrl = useRef(false);

    const fetchData = async (params: {
        p: number;
        s: number;
        q: string;
        sort: string;
        order: string;
        delFlag?: string;
    }) => {
        setLoading(true);
        try {
            const requestParams: {
                p: number;
                s: number;
                sort: string;
                order: string;
                q?: string;
                delFlag?: boolean;
            } = {
                p: params.p,
                s: params.s,
                sort: params.sort,
                order: params.order,
                q: params.q,
                delFlag: params.delFlag === "all" ? undefined : params.delFlag === "true",
            };

            const response = await DepartmentService.getAll(requestParams);

            setDepartments(response.data.data);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            console.error("Error fetching departments:", error);
            toast({
                title: "Có lỗi trong quá trình lấy dữ liệu!",
                variant: "error",
            });
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
            delFlag: delFlag,
        });
    }, [currentPage, itemsPerPage, debouncedSearchQuery, sortField, sortOrder, delFlag]);

    const updateUrl = (params: Record<string, string | number>) => {
        const searchParams = new URLSearchParams(location.search);
        Object.entries(params).forEach(([key, value]) => {
            if (value && (key !== "delFlag" || value !== "all")) {
                searchParams.set(key, value.toString());
            } else {
                searchParams.delete(key);
            }
        });

        isUpdatingUrl.current = true;
        navigate({ search: searchParams.toString() }, { replace: true });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);
        updateUrl({ q: value, p: 1 });
    };

    const handleDelFlagChange = (value: string) => {
        setDelFlag(value);
        setCurrentPage(1);
        updateUrl({ delFlag: value, p: 1 });
    };

    const handleSortChange = (field: string, order: string) => {
        setSortField(field);
        setSortOrder(order);
        updateUrl({ sort: field, order });
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        updateUrl({ p: pageNumber });
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setItemsPerPage(newPageSize);
        setCurrentPage(1);
        updateUrl({ s: newPageSize, p: 1 });
    };

    const handleViewDepartment = (department: Department) => {
        setSelectedDepartment(department);
        setIsDetailModalOpen(true);
    };

    const getStatusBadge = (status: boolean | string) => {
        const isLocked = status === true;
        const badgeConfig = {
            text: isLocked ? "Khóa" : "Mở khóa",
            bgColor: isLocked ? "bg-rose-100" : "bg-green-100",
            textColor: isLocked ? "text-rose-700" : "text-green-700",
            icon: isLocked ? <Lock className="h-4 w-4" /> : <Unlock className="h-4 w-4" />,
        };

        return (
            <div className="flex items-center justify-center">
                <span
                    className={`
                        inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium
                        ${badgeConfig.bgColor} ${badgeConfig.textColor}
                        transition-colors duration-200 hover:${badgeConfig.bgColor.replace("100", "200")}
                    `}
                >
                    {badgeConfig.icon}
                    {badgeConfig.text}
                </span>
            </div>
        );
    };

    const columns: Column[] = [
        {
            key: "imageUrl",
            title: "Logo",
            width: "40px",
            render: (_, record) => (
                <div className="flex items-center gap-4">
                    <DepartmentImage imageUrl={record.imageUrl} name={record.name} size="md" />
                </div>
            ),
        },
        { key: "name", title: "Tên khoa", width: "200px", sortable: true },
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
    ];

    const handleDepartmentAdded = () => {
        fetchData({
            p: 1,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortField,
            order: sortOrder,
            delFlag: delFlag,
        });
    };

    const handleRefresh = () => {
        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortField,
            order: sortOrder,
            delFlag: delFlag,
        });
    };

    const handleExportExcel = async () => {
        try {
            setLoading(true)
            const response = await DepartmentService.exportExcel({
                q: debouncedSearchQuery,
                delFlag: delFlag === "all" ? undefined : delFlag === "true",
            });

            if (response.status !== 200) {
                toast({
                    title: "Có lỗi trong quá trình xuất file!",
                    variant: "error",
                });
                return;
            }

            const now = new Date();
            const timestamp = now.toISOString().replace(/[:T-]/g, "").slice(0, 14);
            const fileName = `users_${timestamp}.xlsx`;

            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            });
            const url = window.URL.createObjectURL(blob);

            const link = document.createElement("a");
            link.href = url;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();

            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            toast({
                title: "Xuất file thành công",
                variant: "success",
            });
        } catch (error) {
            toast({
                title: "Đã xảy ra lỗi không mong muốn!",
                description: error.message || "Vui lòng thử lại sau.",
                variant: "error",
            });
            console.error("Export Excel Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Danh sách khoa</h1>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <Button variant="outline" onClick={handleExportExcel}>
                        <Download className="h-4 w-4" />
                        Xuất excel
                    </Button>
                    <Button onClick={() => setIsAddModalOpen(true)}>
                        <CirclePlus className="h-4 w-4" /> Thêm mới khoa
                    </Button>
                </div>

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
                        <div className="w-40">
                            <Select value={delFlag} onValueChange={handleDelFlagChange}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Chọn trạng thái" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả</SelectItem>
                                    <SelectItem value="false">Mở khóa</SelectItem>
                                    <SelectItem value="true">Khóa</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
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
                        totalItems={totalItems}
                        selectedRowKeys={selectedRowKeys}
                        onPageChange={handlePageChange}
                        onSelectionChange={(newSelectedRowKeys) => setSelectedRowKeys(newSelectedRowKeys)}
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
                    onDepartmentUpdated={handleRefresh}
                    readOnly={true}
                />
            )}
        </div>
    );
};

export default ListDepartment;