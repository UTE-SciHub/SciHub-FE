import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import DataTable from "@/components/data-table/data-table";
import { useLocation, useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/use-debounce";
import { getAll } from "@/service/registration-service";
import { RegistrationPeriod } from "@/models/registraion-period";
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status";
import { Eye, MoreHorizontal, FileText, Trash2, CirclePlus, Ban } from "lucide-react";
import { toast } from "@/hooks/use-toast";

const AdminRegistrationPeriods = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 10;
    const initialQuery = params.get("q") || "";
    const initialStatus = (params.get("status") as RegistrationPeriodStatus) || RegistrationPeriodStatus.ALL;
    const initialSort = params.get("sort") || "createdAt";
    const initialOrder = params.get("order") || "desc";

    const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(initialSize);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState<RegistrationPeriodStatus>(initialStatus);
    const [sortField, setSortField] = useState(initialSort);
    const [sortOrder, setSortOrder] = useState(initialOrder);
    const [loading, setLoading] = useState(true);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);

    const isUpdatingUrl = useRef(false);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const fetchData = async (params: {
        p: number;
        s: number;
        q: string;
        status: RegistrationPeriodStatus;
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
                status: params.status !== RegistrationPeriodStatus.ALL ? params.status : undefined,
            });

            setRegistrationPeriods(response.data.data);
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
            status: statusFilter,
            sort: sortField,
            order: sortOrder,
        });
    }, [currentPage, itemsPerPage, debouncedSearchQuery, statusFilter, sortField, sortOrder]);

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

    const handleSearchChange = (e) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);
        updateUrl({ q: value, p: 1 });
    };

    const handleStatusFilterChange = (status) => {
        setStatusFilter(status);
        setCurrentPage(1);
        updateUrl({ status, p: 1 });
    };

    const handleSortChange = (field, order) => {
        setSortField(field);
        setSortOrder(order);
        updateUrl({ sort: field, order });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
        updateUrl({ p: pageNumber });
    };

    const handlePageSizeChange = (newPageSize) => {
        setItemsPerPage(newPageSize);
        setCurrentPage(1);
        updateUrl({ s: newPageSize, p: 1 });
    };

    const handleSelectionChange = (keys: string[], rows: any[]) => {
        setSelectedRowKeys(keys);
        setSelectedRows(rows);
        console.log("Selected rows:", rows);
    };

    const handleMultipleBlock = () => {
        console.log("Selected rows:", selectedRows);
        setSelectedRowKeys([]);
        setSelectedRows([]);
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case RegistrationPeriodStatus.OPEN:
                return <Badge className="bg-green-500">Đang mở</Badge>;
            case RegistrationPeriodStatus.CLOSED:
                return <Badge className="bg-red-500">Đã đóng</Badge>;
            case RegistrationPeriodStatus.REVIEWING:
                return <Badge className="bg-yellow-500">Chờ duyệt</Badge>;
            case RegistrationPeriodStatus.CANCELLED:
                return <Badge className="bg-gray-500">Đã hủy</Badge>;
            default:
                return <Badge>{status}</Badge>;
        }
    };

    const columns = [
        { key: "id", title: "ID", sortable: true, width: "150px" },
        { key: "title", title: "Tiêu đề", sortable: true, width: "180px" },
        { key: "decisionNumber", title: "Số quyết định", width: "120px" },
        { key: "startDate", title: "Ngày bắt đầu", sortable: true, width: "120px" },
        { key: "endDate", title: "Ngày kết thúc", sortable: true, width: "120px" },
        {
            key: "status",
            title: "Trạng thái",
            width: "120px",
            render: (_, record) => getStatusBadge(record.status),
        },
        {
            key: "decisionFile",
            title: "File",
            width: "80px",
            align: "center" as "center",
            render: (_, record) =>
                record.decisionFile ? (
                    <a
                        href={record.decisionFile}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center"
                    >
                        <FileText className="mr-2 h-4 w-4" />
                        Xem
                    </a>
                ) : (
                    "Không có file"
                ),
        },
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
                            onSelect={() => console.log("Xem chi tiết:", record)}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold tracking-tight">Quản lý đợt đăng ký</h1>

                <Button
                    onClick={() => navigate("add")}
                >
                    <CirclePlus /> Thêm mới
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
                        <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                            <SelectTrigger className="w-full md:w-[180px] border-primary">
                                <SelectValue placeholder="Lọc theo trạng thái" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALL">Tất cả</SelectItem>
                                <SelectItem value="OPEN">Đang mở</SelectItem>
                                <SelectItem value="CLOSED">Đã đóng</SelectItem>
                                <SelectItem value="REVIEWING">Chờ duyệt</SelectItem>
                                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                            </SelectContent>
                        </Select>

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
                        data={registrationPeriods}
                        itemsPerPage={itemsPerPage}
                        pagination={true}
                        currentPage={currentPage}
                        totalItems={totalItems}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                        selectable={true}
                        selectedRowKeys={selectedRowKeys}
                        onSelectionChange={handleSelectionChange}
                        onSortChange={handleSortChange}
                    />
                </CardContent>
            </Card>
        </div >
    );
};

export default AdminRegistrationPeriods;