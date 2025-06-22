import type React from "react"

import { useEffect, useRef, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
    Download,
    FileText,
    MoreHorizontal,
    RefreshCw,
    Trash2,
    Users,
    Calendar,
    Edit,
    Eye,
    CalendarCheck,
    CalendarX,
    CalendarClock,
    Ban,
    PlusCircle,
    Text,
    Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent } from "@/components/ui/card"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import Loading from "@/components/loading/loading"
import useDebounce from "@/hooks/use-debounce"
import DataTable from "@/components/data-table/data-table"
import { CouncilType, getCouncilTypeBadgeClass, getCouncilTypeText } from "@/models/council"
import { CouncilService } from "@/service/council-service"
import useUserStore from "@/store/userStore"
import { formatDateString } from "@/utils/dateTimeFormat"
import CouncilGrid from "@/pages/admin/council/CouncilGrid"

// Enum for council status
enum CouncilStatus {
    ALL = "all",
    ACTIVE = "active",
    UPCOMING = "upcoming",
    COMPLETED = "completed",
}

export default function CouncilManagementPage() {
    const location = useLocation()
    const navigate = useNavigate()
    const user = useUserStore((state) => state.user)
    // Kiểm tra vai trò ADMIN
    const isAdmin = user?.roles?.some((role) => role.name === "ADMIN") || false
    const isChairman = user?.roles?.some((role) => role.name === "CHAIRMAN") || false

    // Parse URL parameters
    const params = new URLSearchParams(location.search)
    const initialPage = Number(params.get("p")) || 1
    const initialSize = Number(params.get("s")) || 10
    const initialQuery = params.get("q") || ""
    const initialStatus = params.get("status") || CouncilStatus.ALL
    const initialType = params.get("type") || "all"
    const initialSort = params.get("sort") || "createdAt"
    const initialOrder = params.get("order") || "desc"
    const initialStartDate = params.get("startDate") || ""
    const initialEndDate = params.get("endDate") || ""
    const initialDelFlag = params.get("delFlag") ? params.get("delFlag") === "true" : undefined

    // States
    const [councils, setCouncils] = useState([])
    const [totalItems, setTotalItems] = useState(0)
    const [itemsPerPage, setItemsPerPage] = useState(initialSize)
    const [currentPage, setCurrentPage] = useState(initialPage)
    const [searchQuery, setSearchQuery] = useState(initialQuery)
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus)
    const [typeFilter, setTypeFilter] = useState<string>(initialType)
    const [sortField, setSortField] = useState(initialSort)
    const [sortOrder, setSortOrder] = useState(initialOrder)
    const [startDate, setStartDate] = useState<string>(initialStartDate)
    const [endDate, setEndDate] = useState<string>(initialEndDate)
    const [delFlag, setDelFlag] = useState<boolean | undefined>(initialDelFlag)
    const [loading, setLoading] = useState(true)
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
    const [selectedRows, setSelectedRows] = useState<any[]>([])
    const [isRefreshing, setIsRefreshing] = useState(false)
    const [activeTab, setActiveTab] = useState(initialStatus)
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [councilToDelete, setCouncilToDelete] = useState<number | null>(null)
    const [isExportDialogOpen, setIsExportDialogOpen] = useState(false)

    const [exportFormat, setExportFormat] = useState("excel")
    const [exportAll, setExportAll] = useState(true)
    const [exportSelected, setExportSelected] = useState(false)
    const [exportFiltered, setExportFiltered] = useState(true)
    const [includeMembers, setIncludeMembers] = useState(true)
    const [includeTopics, setIncludeTopics] = useState(true)

    const isUpdatingUrl = useRef(false)
    const debouncedSearchQuery = useDebounce(searchQuery, 300)

    // Fetch councils data
    const fetchCouncils = async (params: {
        p: number
        s: number
        q: string
        status: string
        type: string
        sort: string
        order: string
        delFlag?: boolean
    }) => {
        setLoading(true)
        try {
            const response = await CouncilService.getAll({
                page: params.p,
                size: params.s,
                q: params.q,
                type: params.type !== "all" ? params.type : undefined,
                status: params.status !== CouncilStatus.ALL ? params.status : undefined,
                sort: params.sort,
                order: params.order,
                delFlag: params.delFlag,
                isAdmin,
            })

            setCouncils(response.data.data)
            setTotalItems(response.data.totalItems)
        } catch (error) {
            console.error("Error fetching councils:", error)
            toast({
                title: "Lỗi khi tải dữ liệu",
                description: "Không thể tải danh sách hội đồng. Vui lòng thử lại sau.",
                variant: "error",
            })
        } finally {
            setLoading(false)
            setIsRefreshing(false)
        }
    }

    // Update URL parameters
    const updateUrl = (params: Record<string, string | number | boolean | undefined>) => {
        const searchParams = new URLSearchParams(location.search)
        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                searchParams.set(key, value.toString())
            } else {
                searchParams.delete(key)
            }
        })

        isUpdatingUrl.current = true
        navigate({ search: searchParams.toString() }, { replace: true })
    }

    // Load data when parameters change
    useEffect(() => {
        fetchCouncils({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            status: statusFilter,
            type: typeFilter,
            sort: sortField,
            order: sortOrder,
            delFlag,
        })
    }, [
        currentPage,
        itemsPerPage,
        debouncedSearchQuery,
        statusFilter,
        typeFilter,
        sortField,
        sortOrder,
        startDate,
        endDate,
        delFlag,
        isAdmin,
    ])

    // Event handlers
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        setSearchQuery(value)
        setCurrentPage(1)
        updateUrl({ q: value, p: 1 })
    }

    const handleTabChange = (value: string) => {
        setActiveTab(value)
        setStatusFilter(value)
        setCurrentPage(1)
        let newDelFlag: boolean | undefined
        if (value === CouncilStatus.ACTIVE || value === CouncilStatus.UPCOMING) {
            newDelFlag = false
        } else if (value === CouncilStatus.COMPLETED) {
            newDelFlag = true
        } else {
            newDelFlag = undefined
        }
        setDelFlag(newDelFlag)
        updateUrl({ status: value, p: 1, delFlag: newDelFlag })
    }

    const handleTypeChange = (value: string) => {
        setTypeFilter(value)
        setCurrentPage(1)
        updateUrl({ type: value, p: 1 })
    }

    const handleSortChange = (field: string, order: string) => {
        setSortField(field)
        setSortOrder(order)
        updateUrl({ sort: field, order })
    }

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber)
        updateUrl({ p: pageNumber })
    }

    const handlePageSizeChange = (newPageSize: number) => {
        setItemsPerPage(newPageSize)
        setCurrentPage(1)
        updateUrl({ s: newPageSize, p: 1 })
    }

    const handleSelectionChange = (keys: string[], rows: any[]) => {
        setSelectedRowKeys(keys)
        setSelectedRows(rows)
    }

    const handleMultipleBlock = async () => {
        if (selectedRowKeys.length === 0) return

        try {
            await Promise.all(
                selectedRowKeys.map(async (id) => {
                    await CouncilService.delete(Number(id))
                }),
            )

            toast({
                title: "Đã khóa hội đồng",
                description: `Đã khóa ${selectedRowKeys.length} hội đồng thành công.`,
                variant: "default",
            })

            setSelectedRowKeys([])
            setSelectedRows([])

            await fetchCouncils({
                p: currentPage,
                s: itemsPerPage,
                q: debouncedSearchQuery,
                status: statusFilter,
                type: typeFilter,
                sort: sortField,
                order: sortOrder,
                delFlag,
            })
        } catch (error) {
            console.error("Lỗi khi khóa hội đồng:", error)
            toast({
                title: "Lỗi",
                description: "Không thể khóa các hội đồng. Vui lòng thử lại.",
                variant: "error",
            })
        }
    }

    const handleRefresh = () => {
        setIsRefreshing(true)
        fetchCouncils({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            status: statusFilter,
            type: typeFilter,
            sort: sortField,
            order: sortOrder,
            delFlag,
        })
    }

    const handleViewDetails = (record) => {
        // Check if the current user is a chairman of this specific council
        const isCurrentUserChairmanOfThisCouncil = user?.id && record.councilMembers?.some(
            (member) => member.user.id === user.id && member.role === "CHAIRMAN"
        );

        if (isCurrentUserChairmanOfThisCouncil) {
            navigate(`/admin/councils/${record.id}`); // Navigate to council detail page
        } else {
            navigate(`/admin/councils/${record.id}/topics`); // Navigate to topics for evaluation
        }
    }

    const handleDeleteCouncil = async () => {
        if (!councilToDelete) return

        try {
            await CouncilService.delete(councilToDelete)
            toast({
                title: "Thành công",
                description: "Đã xóa hội đồng thành công",
                variant: "success",
            })
            fetchCouncils({
                p: currentPage,
                s: itemsPerPage,
                q: debouncedSearchQuery,
                status: statusFilter,
                type: typeFilter,
                sort: sortField,
                order: sortOrder,
                delFlag,
            })
        } catch (error) {
            console.error("Lỗi khi xóa hội đồng:", error)
            toast({
                title: "Lỗi",
                description: "Không thể xóa hội đồng. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsDeleteDialogOpen(false)
            setCouncilToDelete(null)
        }
    }

    const handleExport = async () => {
        if (exportFormat !== "excel") {
            toast({
                title: "Chỉ hỗ trợ xuất Excel",
                description: "Hiện tại chỉ hỗ trợ xuất dữ liệu sang định dạng Excel.",
                variant: "error",
            })
            return
        }

        toast({
            title: "Đang xuất dữ liệu",
            description: "Đang xuất dữ liệu sang định dạng Excel",
        })

        try {
            const params: any = {
                includeMembers,
                includeTopics,
                isAdmin,
            }

            // Determine which data to export
            if (exportSelected && selectedRowKeys.length > 0) {
                params.selectedIds = selectedRowKeys.map(Number)
            } else if (exportFiltered) {
                params.q = debouncedSearchQuery
                params.type = typeFilter !== "all" ? typeFilter : undefined
                params.status = statusFilter !== CouncilStatus.ALL ? statusFilter : undefined
                params.sort = sortField
                params.order = sortOrder
                params.startDate = startDate
                params.endDate = endDate
                params.delFlag = delFlag
            } else if (exportAll) {
                params.q = ""
                params.type = undefined
                params.status = undefined
                params.delFlag = undefined
            }

            const response = await CouncilService.exportToExcel(params)

            // Create a blob and trigger download
            const blob = new Blob([response.data], {
                type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
            })
            const url = window.URL.createObjectURL(blob)
            const link = document.createElement("a")
            link.href = url
            link.setAttribute("download", "councils.xlsx")
            document.body.appendChild(link)
            link.click()
            link.remove()

            toast({
                title: "Thành công",
                description: "Đã xuất dữ liệu sang định dạng Excel thành công",
            })
        } catch (error) {
            console.error("Lỗi khi xuất dữ liệu:", error)
            toast({
                title: "Lỗi",
                description: "Không thể xuất dữ liệu. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsExportDialogOpen(false)
        }
    }

    const handleCancelLoading = () => {
        setLoading(false)
    }

    const getCouncilStatus = (council) => {
        const now = new Date()
        const startDate = new Date(council.startDate)
        const endDate = new Date(council.endDate)

        if (now < startDate) {
            return "Sắp diễn ra"
        } else if (now > endDate) {
            return "Đã kết thúc"
        } else {
            return "Đang hoạt động"
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return (
                    <Badge variant="outline" className="bg-green-50 text-green-600 border-green-200">
                        Đang hoạt động
                    </Badge>
                )
            case "Sắp diễn ra":
                return (
                    <Badge variant="outline" className="bg-yellow-50 text-yellow-600 border-yellow-200">
                        Sắp diễn ra
                    </Badge>
                )
            case "Đã kết thúc":
                return (
                    <Badge variant="outline" className="bg-gray-50 text-gray-600 border-gray-200">
                        Đã kết thúc
                    </Badge>
                )
            default:
                return <Badge variant="outline">{status}</Badge>
        }
    }

    const getStatusIcon = (status: string) => {
        switch (status) {
            case "Đang hoạt động":
                return <CalendarCheck className="h-4 w-4 text-green-600" />
            case "Sắp diễn ra":
                return <CalendarClock className="h-4 w-4 text-yellow-600" />
            case "Đã kết thúc":
                return <CalendarX className="h-4 w-4 text-gray-600" />
            default:
                return <Calendar className="h-4 w-4" />
        }
    }

    // Define table columns
    const columns = [
        {
            key: "name",
            title: "Thông tin hội đồng",
            width: "300px",
            sortable: true,
            render: (_, record) => (
                <div className="space-y-1">
                    <div
                        className="font-medium text-primary hover:underline cursor-pointer"
                        onClick={() => handleViewDetails(record)}
                    >
                        {record.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        ID: {record.id} {record.decisionNumber && `• QĐ: ${record.decisionNumber}`}
                    </div>
                </div>
            ),
        },
        {
            key: "type",
            title: "Loại hội đồng",
            width: "150px",
            render: (_, record) => (
                <Badge variant="outline" className={getCouncilTypeBadgeClass(record.type)}>
                    {getCouncilTypeText(record.type)}
                </Badge>
            ),
        },
        {
            key: "period",
            title: "Thời gian",
            width: "180px",
            render: (_, record) => (
                <div className="space-y-1">
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Bắt đầu:</span> {formatDateString(record.startDate)}
                    </div>
                    <div className="flex items-center gap-1 text-sm">
                        <span className="font-medium">Kết thúc:</span> {formatDateString(record.endDate)}
                    </div>
                </div>
            ),
        },
        {
            key: "members",
            title: "Thành viên",
            width: "120px",
            render: (_, record) => (
                <div className="flex items-center">
                    <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{record.councilMembers?.length || 0} thành viên</span>
                </div>
            ),
        },
        {
            key: "chairman",
            title: "Chủ tịch",
            width: "200px",
            render: (_, record) => {
                const chairman = record.councilMembers?.find((member) => member.role === "CHAIRMAN")

                return chairman ? (
                    <div className="space-y-1">
                        <div className="font-medium">{chairman.user.name}</div>
                        <div className="text-sm text-muted-foreground">{chairman.user.email}</div>
                    </div>
                ) : (
                    <span className="text-muted-foreground">Chưa có</span>
                )
            },
        },
        {
            key: "status",
            title: "Trạng thái",
            width: "120px",
            sortable: true,
            render: (_, record) => {
                const status = getCouncilStatus(record)
                return (
                    <div className="flex items-center gap-2">
                        {getStatusIcon(status)}
                        {getStatusBadge(status)}
                    </div>
                )
            },
        },
        {
            key: "decisionFile",
            title: "Tài liệu",
            width: "60px",
            align: "center" as const,
            render: (_, record) =>
                record.decisionFile ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href={record.decisionFile}
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
            align: "right" as const,
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
                        {!isAdmin && (
                            <DropdownMenuItem onClick={() => handleViewDetails(record)} className="cursor-pointer">
                                <Text className="mr-2 h-4 w-4" />
                                Đánh giá chủ nhiệm
                            </DropdownMenuItem>
                        )}
                        {isAdmin && (
                            <>
                                <DropdownMenuItem
                                    onClick={() => navigate(`/admin/councils/edit/${record.id}`)}
                                    className="cursor-pointer"
                                >
                                    <Edit className="mr-2 h-4 w-4" />
                                    Chỉnh sửa
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() => {
                                        setCouncilToDelete(record.id)
                                        setIsDeleteDialogOpen(true)
                                    }}
                                    className="cursor-pointer text-red-600"
                                >
                                    <Trash2 className="mr-2 h-4 w-4" />
                                    Xóa hội đồng
                                </DropdownMenuItem>
                            </>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ]

    return (
        <div className="space-y-6">
            {loading && <Loading onCancel={handleCancelLoading} />}

            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Quản lý Hội đồng</h1>
                    <p className="text-muted-foreground mt-1">
                        {isAdmin
                            ? "Quản lý danh sách các hội đồng xét duyệt, nghiệm thu và đánh giá"
                            : "Danh sách các hội đồng bạn tham gia"}
                    </p>
                </div>
                {isAdmin && (
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
                        <Button variant="outline" size="sm" onClick={() => setIsExportDialogOpen(true)}>
                            <Download className="h-4 w-4" />
                            Xuất danh sách
                        </Button>
                        <Button size="sm" onClick={() => navigate("/admin/councils/create")}>
                            <PlusCircle className="h-4 w-4" />
                            Thêm mới
                        </Button>
                    </div>
                )}
            </div>

            <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
                <div className="flex items-center justify-between">
                    <TabsList className="grid grid-cols-3 w-full max-w-md">
                        <TabsTrigger value={CouncilStatus.ALL} className="flex items-center gap-2">
                            <Calendar className="h-4 w-4" />
                            <span>Tất cả</span>
                            <Badge variant="secondary" className="ml-1">
                                {totalItems}
                            </Badge>
                        </TabsTrigger>
                        <TabsTrigger value={CouncilStatus.ACTIVE} className="flex items-center gap-2">
                            <CalendarCheck className="h-4 w-4 text-green-600" />
                            <span>Đang hoạt động</span>
                        </TabsTrigger>
                        <TabsTrigger value={CouncilStatus.COMPLETED} className="flex items-center gap-2">
                            <CalendarX className="h-4 w-4 text-rose-600" />
                            <span>Đã kết thúc</span>
                        </TabsTrigger>
                    </TabsList>

                    <Button variant="outline" size="sm" onClick={handleRefresh} disabled={isRefreshing}>
                        <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
                        Làm mới
                    </Button>
                </div>

                <Card className="mt-4">
                    <CardContent className="p-6">
                        <div className="flex flex-col md:flex-row gap-4 mb-6">
                            <div className="relative flex-1 max-w-md">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    className="pl-10"
                                    type="text"
                                    placeholder="Tìm kiếm theo tên hội đồng hoặc số quyết định..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>

                            <div>
                                <Select value={typeFilter} onValueChange={handleTypeChange}>
                                    <SelectTrigger className="w-[180px]">
                                        <SelectValue placeholder="Loại hội đồng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value={CouncilType.SELECT_CNDT}>Hội đồng xét duyệt</SelectItem>
                                        <SelectItem value={CouncilType.EVALUATE_TOPIC}>Hội đồng đánh giá</SelectItem>
                                        <SelectItem value={CouncilType.ACCEPTANCE_JURY}>Hội đồng nghiệm thu</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            {isAdmin && selectedRowKeys.length > 0 && (
                                <div className="flex items-center gap-2 ml-auto">
                                    <span className="text-sm">
                                        Đã chọn <span className="font-bold">{selectedRowKeys.length}</span> hội đồng
                                    </span>
                                    <Button variant="destructive" size="sm" onClick={handleMultipleBlock}>
                                        <Ban className="h-4 w-4 mr-2" />
                                        Khóa đã chọn
                                    </Button>
                                </div>
                            )}
                        </div>

                        {isAdmin ? (
                            <DataTable
                                minHeight="auto"
                                loading={loading}
                                columns={columns}
                                data={councils}
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
                        ) : (
                            <CouncilGrid councils={councils} loading={loading} currentUser={user}/>
                        )}
                    </CardContent>
                </Card>
            </Tabs>

            {isAdmin && (
                <Dialog open={isExportDialogOpen} onOpenChange={setIsExportDialogOpen}>
                    <DialogContent className="sm:max-w-[500px]">
                        <DialogHeader>
                            <DialogTitle>Xuất danh sách hội đồng</DialogTitle>
                            <DialogDescription>Chọn định dạng và tùy chọn xuất dữ liệu</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Định dạng</h4>
                                <Select value={exportFormat} onValueChange={setExportFormat}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Chọn định dạng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="excel">Excel (.xlsx)</SelectItem>
                                        <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                                        <SelectItem value="csv">CSV (.csv)</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Dữ liệu xuất</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="export-all"
                                            checked={exportAll}
                                            onCheckedChange={(checked) => setExportAll(checked === true)}
                                        />
                                        <label
                                            htmlFor="export-all"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Tất cả dữ liệu
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="export-selected"
                                            checked={exportSelected}
                                            onCheckedChange={(checked) => setExportSelected(checked === true)}
                                            disabled={selectedRowKeys.length === 0}
                                        />
                                        <label
                                            htmlFor="export-selected"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Chỉ các hội đồng đã chọn ({selectedRowKeys.length})
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="export-filtered"
                                            checked={exportFiltered}
                                            onCheckedChange={(checked) => setExportFiltered(checked === true)}
                                        />
                                        <label
                                            htmlFor="export-filtered"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Chỉ dữ liệu đã lọc
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium">Bao gồm</h4>
                                <div className="space-y-2">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="include-members"
                                            checked={includeMembers}
                                            onCheckedChange={(checked) => setIncludeMembers(checked === true)}
                                        />
                                        <label
                                            htmlFor="include-members"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Thông tin thành viên
                                        </label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="include-topics"
                                            checked={includeTopics}
                                            onCheckedChange={(checked) => setIncludeTopics(checked === true)}
                                        />
                                        <label
                                            htmlFor="include-topics"
                                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                        >
                                            Thông tin đề tài
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsExportDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button variant="default" onClick={handleExport}>
                                Xuất dữ liệu
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}

            {isAdmin && (
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Xác nhận xóa</DialogTitle>
                            <DialogDescription>
                                Bạn có chắc chắn muốn xóa hội đồng này? Hành động này không thể hoàn tác.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                                Hủy
                            </Button>
                            <Button variant="destructive" onClick={handleDeleteCouncil}>
                                Xóa
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            )}
        </div>
    )
}
