import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import DataTable from "@/components/data-table/data-table"
import { useLocation, useNavigate } from "react-router-dom"
import useDebounce from "@/hooks/use-debounce"
import { exportExcel, getAll } from "@/service/registration-service"
import type { RegistrationPeriod } from "@/models/registraion-period"
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status"
import {
    Eye,
    MoreHorizontal,
    FileText,
    Trash2,
    PlusCircle,
    Ban,
    Search,
    Filter,
    Calendar,
    RefreshCw,
    CalendarCheck,
    CalendarX,
    CalendarClock,
    CalendarOff,
    Download,
    Edit,
    X,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { format, set } from "date-fns"
import { vi } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Label } from "@/components/ui/label"
import Loading from "@/components/loading/loading"

const AdminRegistrationPeriods = () => {
    const location = useLocation()
    const navigate = useNavigate()

    const params = new URLSearchParams(location.search)
    const initialPage = Number(params.get("p")) || 1
    const initialSize = Number(params.get("s")) || 10
    const initialQuery = params.get("q") || ""
    const initialStatus = (params.get("status") as RegistrationPeriodStatus) || RegistrationPeriodStatus.ALL
    const initialSort = params.get("sort") || "createdAt"
    const initialOrder = params.get("order") || "desc"
    const initialTab = params.get("tab") || RegistrationPeriodStatus.ALL
    const initialStartDate = params.get("startDate") || ""
    const initialEndDate = params.get("endDate") || ""

    const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([])
    const [totalItems, setTotalItems] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(initialSize)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [statusFilter, setStatusFilter] = useState<RegistrationPeriodStatus>(initialStatus)
    const [sortField, setSortField] = useState(initialSort)
    const [sortOrder, setSortOrder] = useState(initialOrder)
    const [loading, setLoading] = useState(true)
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [activeTab, setActiveTab] = useState(initialTab)
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [selectedPeriod, setSelectedPeriod] = useState<RegistrationPeriod | null>(null)
    const [startDate, setStartDate] = useState<string>(initialStartDate);
    const [endDate, setEndDate] = useState<string>(initialEndDate);

    const isUpdatingUrl = useRef(false)
    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    const BASE_URL = import.meta.env.VITE_BASE_URL;

    const fetchData = async (params: {
        p: number
        s: number
        q: string
        status: RegistrationPeriodStatus
        sort: string
        order: string
        startDate: string
        endDate: string
    }) => {
        setLoading(true)
        try {
            const response = await getAll({
                p: params.p,
                s: params.s,
                sort: params.sort,
                order: params.order,
                q: params.q,
                status: params.status !== RegistrationPeriodStatus.ALL ? params.status : undefined,
                startDate: params.startDate,
                endDate: params.endDate,
            })

            setRegistrationPeriods(response.data.data)
            setTotalItems(response.data.totalItems)
        } catch (error) {
            console.error("Error fetching registration periods:", error)
            toast({
                title: "Có lỗi trong quá trình lấy dữ liệu!",
                description: "Không thể tải dữ liệu đợt đăng ký. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    useEffect(() => {
        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            status: statusFilter,
            sort: sortField,
            order: sortOrder,
            startDate: startDate,
            endDate: endDate,
        })
    }, [currentPage, itemsPerPage, debouncedSearchQuery, statusFilter, sortField, sortOrder, startDate, endDate])

    const updateUrl = (params: Record<string, string | number>) => {
        const searchParams = new URLSearchParams(location.search)
        Object.entries(params).forEach(([key, value]) => {
            if (value) {
                searchParams.set(key, value.toString())
            } else {
                searchParams.delete(key)
            }
        })

        isUpdatingUrl.current = true
        navigate({ search: searchParams.toString() }, { replace: true })
    }

    const handleSearchChange = (e) => {
        const value = e.target.value
        setSearchQuery(value)
        setCurrentPage(1)
        updateUrl({ q: value, p: 1 })
    }

    const handleTabChange = (value) => {
        setActiveTab(value)
        setStatusFilter(value)
        setCurrentPage(1)
        updateUrl({ status: value, p: 1 })
    }

    const handleSortChange = (field, order) => {
        setSortField(field)
        setSortOrder(order)
        updateUrl({ sort: field, order })
    }

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber)
        updateUrl({ p: pageNumber })
    }

    const handlePageSizeChange = (newPageSize) => {
        setItemsPerPage(newPageSize)
        setCurrentPage(1)
        updateUrl({ s: newPageSize, p: 1 })
    }

    const handleSelectionChange = (keys: string[], rows: any[]) => {
        setSelectedRowKeys(keys)
        setSelectedRows(rows)
    }

    const handleMultipleBlock = () => {
        toast({
            title: "Đã khóa đợt đăng ký",
            description: `Đã khóa ${selectedRowKeys.length} đợt đăng ký thành công.`,
            variant: "default",
        })

        setSelectedRowKeys([])
        setSelectedRows([])

        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            status: statusFilter,
            sort: sortField,
            order: sortOrder,
            startDate: startDate,
            endDate: endDate,
        })
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            status: statusFilter,
            sort: sortField,
            order: sortOrder,
            startDate: startDate,
            endDate: endDate,
        })
        setIsRefreshing(false)
    }

    const handleViewDetails = (record) => {
        setSelectedPeriod(record)
        navigate(`${record.id}`)
    }

    const formatDate = (dateString) => {
        if (!dateString) return "Chưa xác định"
        try {
            return format(new Date(dateString), "dd/MM/yyyy", { locale: vi })
        } catch (error) {
            return "Ngày không hợp lệ"
        }
    }

    const getStatusBadge = (status) => {
        switch (status) {
            case RegistrationPeriodStatus.OPEN:
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang mở
                    </Badge>
                )
            case RegistrationPeriodStatus.CLOSED:
                return (
                    <Badge variant="outline" className="bg-red-50 text-red-600 border-red-200">
                        Đã đóng
                    </Badge>
                )
            case RegistrationPeriodStatus.REVIEWING:
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                        Chờ duyệt
                    </Badge>
                )
            case RegistrationPeriodStatus.CANCELLED:
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Đã hủy
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case RegistrationPeriodStatus.OPEN:
                return <CalendarCheck className="h-4 w-4 text-green-600" />
            case RegistrationPeriodStatus.CLOSED:
                return <CalendarX className="h-4 w-4 text-red-600" />
            case RegistrationPeriodStatus.REVIEWING:
                return <CalendarClock className="h-4 w-4 text-yellow-600" />
            case RegistrationPeriodStatus.CANCELLED:
                return <CalendarOff className="h-4 w-4 text-gray-600" />
            default:
                return <Calendar className="h-4 w-4" />
        }
    }

    const columns = [
        {
            key: "title",
            title: "Thông tin đợt đăng ký",
            width: "300px",
            sortable: true,
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="font-medium">{record.title}</div>
                    <div className="text-sm text-muted-foreground">
                        ID: {record.id} {record.decisionNumber && `• QĐ: ${record.decisionNumber}`}
                    </div>
                </div>
            ),
        },
        {
            key: "period",
            title: "Thời gian",
            width: "150px",
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Bắt đầu:</span> {formatDate(record.startDate)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Kết thúc:</span> {formatDate(record.endDate)}
                    </div>
                </div>
            ),
        },
        {
            key: "status",
            title: "Trạng thái",
            width: "100px",
            sortable: true,
            render: (_, record) => (
                <div className="flex items-center gap-2">
                    {getStatusIcon(record.status)}
                    {getStatusBadge(record.status)}
                </div>
            ),
        },
        {
            key: "decisionFile",
            title: "Tài liệu",
            width: "60px",
            align: "center" as "center",
            render: (_, record) =>
                record.decisionFile ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href={`${BASE_URL}files/${record.decisionFile}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <FileText className="h-4 w-4" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Xem quyết định</p>
                            </TooltipContent>
                        </Tooltip>
                    </TooltipProvider>
                ) : (
                    <span className="text-xs text-muted-foreground">Không có</span>
                ),
        },
        {
            key: "actions",
            title: "Thao tác",
            width: "50px",
            align: "right" as "right",
            render: (_, record) => (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                            <span className="sr-only">Mở menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[200px]">
                        <DropdownMenuItem onClick={() => handleViewDetails(record)} className="cursor-pointer">
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />

                        {record.status === RegistrationPeriodStatus.OPEN && (
                            <DropdownMenuItem
                                onClick={() => {
                                    toast({
                                        title: "Đã đóng đợt đăng ký",
                                        description: "Đợt đăng ký đã được đóng thành công.",
                                        variant: "default",
                                    })
                                }}
                                className="cursor-pointer text-red-600"
                            >
                                <CalendarX className="mr-2 h-4 w-4" />
                                Đóng đợt đăng ký
                            </DropdownMenuItem>
                        )}

                        {record.status === RegistrationPeriodStatus.CLOSED && (
                            <DropdownMenuItem
                                onClick={() => {
                                    toast({
                                        title: "Đã mở lại đợt đăng ký",
                                        description: "Đợt đăng ký đã được mở lại thành công.",
                                        variant: "default",
                                    })
                                }}
                                className="cursor-pointer text-green-600"
                            >
                                <CalendarCheck className="mr-2 h-4 w-4" />
                                Mở lại đợt đăng ký
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    const handleExportExcel = async () => {
        try {
            setLoading(true)
            const response = await exportExcel({
                q: debouncedSearchQuery,
                status: activeTab,
                sort: sortField,
                order: sortOrder,
                startDate: startDate,
                endDate: endDate,
            });

            if (response.status !== 200) {
                toast({
                    title: "Có lỗi trong quá trình xuất file!",
                    variant: "error",
                });
                return;
            }

            // Tạo tên file dựa trên ngày giờ hiện tại
            const now = new Date();
            const timestamp = now.toISOString().replace(/[:T-]/g, "").slice(0, 14);
            const fileName = `registrations_${timestamp}.xlsx`;

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

    const handleCancelLoading = () => {
        setLoading(false);
    };

    return (
        <div className="space-y-6">
            {loading && <Loading onCancel={handleCancelLoading} />}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý đợt đăng ký</h1>
                    <p className="text-muted-foreground mt-1">Quản lý các đợt đăng ký đề tài nghiên cứu khoa học</p>
                </div>
                <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportExcel}
                    >
                        <Download className="h-4 w-4" />
                        Xuất Excel
                    </Button>
                    <Button size="sm" onClick={() => navigate("add")}>
                        <PlusCircle className="h-4 w-4" />
                        Thêm mới
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex items-center justify-between">
                    <TabsList className="grid grid-cols-5 w-full max-w-md">
                        <TabsTrigger value={RegistrationPeriodStatus.ALL} className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Tất cả</span>
                            <Badge variant="secondary" className="ml-1">
                                {totalItems}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value={RegistrationPeriodStatus.OPEN} className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-green-600" />
                            <span>Đang mở</span>
                        </TabsTrigger>
                        <TabsTrigger value={RegistrationPeriodStatus.CLOSED} className="flex items-center gap-2">
                            <CalendarX className="h-4 w-4 text-red-600" />
                            <span>Đã đóng</span>
                        </TabsTrigger>
                        <TabsTrigger value={RegistrationPeriodStatus.REVIEWING} className="flex items-center gap-2">
                            <CalendarClock className="h-4 w-4 text-yellow-600" />
                            <span>Chờ duyệt</span>
                        </TabsTrigger>
                        <TabsTrigger value={RegistrationPeriodStatus.CANCELLED} className="flex items-center gap-2">
                            <CalendarOff className="h-4 w-4 text-gray-600" />
                            <span>Đã hủy</span>
                        </TabsTrigger>
                    </TabsList>

                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                </div>

                <TabsContent value={activeTab} className="mt-4">
                    <Card>
                        <CardContent className="p-6">
                            <div className="flex flex-col items-center md:flex-row gap-4 mb-4">
                                <div className="relative flex flex-col gap-1">
                                    <Label htmlFor="search-input">Tìm kiếm</Label>
                                    <Input
                                        id="search-input"
                                        className="border-primary"
                                        type="text"
                                        placeholder="Tìm kiếm theo tiêu đề..."
                                        value={searchQuery}
                                        onChange={handleSearchChange}
                                    />
                                </div>

                                <div className="relative flex flex-col gap-1">
                                    <Label htmlFor="start-date">Ngày bắt đầu</Label>
                                    <div className="relative">
                                        <Input
                                            id="start-date"
                                            className="border-primary pr-6"
                                            type="date"
                                            placeholder="Ngày bắt đầu"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                        />
                                        {startDate && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setStartDate('')}
                                            >
                                                <X className="h-4 w-4 text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                <div className="relative flex flex-col gap-1">
                                    <Label htmlFor="end-date">Ngày kết thúc</Label>
                                    <div className="relative">
                                        <Input
                                            id="end-date"
                                            className="border-primary pr-6"
                                            type="date"
                                            placeholder="Ngày kết thúc"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                        />
                                        {endDate && (
                                            <button
                                                type="button"
                                                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                                onClick={() => setEndDate('')}
                                            >
                                                <X className="h-4 w-4 text-red-500" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Nút Search
                                <div className="h-10 flex items-center">
                                    <Button
                                        onClick={handleSearchByDate}
                                        disabled={loading}
                                    >
                                        <Search className="h-4 w-4" />
                                        Tìm kiếm
                                    </Button>
                                </div> */}

                                <div className="h-10 flex flex-1 justify-end items-center">
                                    {selectedRowKeys.length > 0 ? (
                                        <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                            <span className="text-sm min-w-[200px]">
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
                                        <div className="min-w-[200px]"></div>
                                    )}
                                </div>
                            </div>

                            <DataTable
                                minHeight="auto"
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
                                emptyMessage="Không tìm thấy đợt đăng ký nào"
                            />
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    )
}

export default AdminRegistrationPeriods

