import { useEffect, useRef, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  Eye,
  FileDown,
  FilePlusIcon,
  Filter,
  MoreHorizontal,
  Search,
  Trash2,
  UserPlus,
  Users,
  UserX,
  RefreshCw,
  Mail,
  Phone,
  Download,
} from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DataTable from "@/components/data-table/data-table"
import { useLocation, useNavigate } from "react-router-dom"
import useDebounce from "@/hooks/use-debounce"
import type { Column } from "@/models/column"
import { toast } from "@/hooks/use-toast"
import CreateMultipleAccountsModal from "@/pages/admin/users/MultipleCreateModal"
import CreateUserModal from "@/pages/admin/users/CreateUserModal"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { format, formatDistanceToNow } from "date-fns"
import { vi } from "date-fns/locale"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { User } from "@/models/user"
import Loading from "@/components/loading/loading"
import ImportUsersModal from "@/pages/admin/users/ImportUserModal"
import UserDetailModal from "@/pages/admin/users/UserDetailModal"
import { UserStatus } from "@/models/enums/user-status"
import { getInitialsAvt } from "@/utils/common"
import { formatTimeAgo } from "@/utils/dateTimeFormat"
import { UserService } from "@/service/user-service"
import { Roles, getAllRoles, getRoleLabel } from "@/models/enums/roles.enum"

const AdminUsers = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const params = new URLSearchParams(location.search)
  const initialPage = Number(params.get("p")) || 1
  const initialSize = Number(params.get("s")) || 10
  const initialQuery = params.get("q") || ""
  const initialSort = params.get("sort") || "createdAt"
  const initialOrder = params.get("order") || "desc"
  const initialTab = params.get("tab") || ""
  const initialRole = params.get("role") === "all" ? undefined : params.get("role") || undefined

  const [users, setUsers] = useState<User[]>([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [statusFilter, setStatusFilter] = useState(initialTab)
  const [itemsPerPage, setItemsPerPage] = useState(initialSize)
  const [totalItems, setTotalItems] = useState(0)
  const [searchQuery, setSearchQuery] = useState(initialQuery)
  const [currentPage, setCurrentPage] = useState(initialPage)
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])
  const [selectedRows, setSelectedRows] = useState<any[]>([])
  const [sortField, setSortField] = useState(initialSort)
  const [sortOrder, setSortOrder] = useState(initialOrder)
  const [loading, setLoading] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [activeTab, setActiveTab] = useState(initialTab)
  const [roleFilter, setRoleFilter] = useState<string | undefined>(initialRole)

  const debouncedSearchQuery = useDebounce(searchQuery, 300)
  const isUpdatingUrl = useRef(false)
  const [isCreateMultipleModalOpen, setIsCreateMultipleModalOpen] = useState(false)
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)

  const fetchData = async (params: {
    p: number
    s: number
    q: string
    sort: string
    order: string
    tab?: string
    role?: string
  }) => {
    setLoading(true)
    try {
      const response = await UserService.getUsers({
        p: params.p,
        s: params.s,
        sort: params.sort,
        order: params.order,
        q: params.q,
        tab: params.tab,
        role: params.role,
      })

      setUsers(response.data.data)
      setTotalItems(response.data.totalItems)
    } catch (error) {
      console.error("Error fetching users:", error)
      toast({
        title: "Có lỗi trong quá trình lấy dữ liệu!",
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
      sort: sortField,
      order: sortOrder,
      tab: activeTab,
      role: roleFilter,
    })
  }, [currentPage, itemsPerPage, debouncedSearchQuery, sortField, sortOrder, activeTab, roleFilter])

  const updateUrl = (params: Record<string, string | number>) => {
    const searchParams = new URLSearchParams(location.search)
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.set(key, value.toString())
      } else {
        searchParams.delete(key)
      }
    })

    isUpdatingUrl.current = true
    navigate({ search: searchParams.toString() }, { replace: true })
  }

  const handleSortChange = (field: string, order: string) => {
    setSortField(field)
    setSortOrder(order)
    updateUrl({ sort: field, order })
  }

  const handleTabChange = (value: string) => {
    setActiveTab(value)
    setCurrentPage(1)
    updateUrl({ tab: value, p: 1 })
  }

  const handleSearchChange = (e) => {
    const value = e.target.value
    setSearchQuery(value)
    setCurrentPage(1)
    updateUrl({ q: value, p: 1 })
  }

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
    updateUrl({ p: pageNumber })
  }

  const handlePageSizeChange = (newPageSize) => {
    const firstItemIndex = (currentPage - 1) * itemsPerPage + 1
    const newCurrentPage = Math.max(1, Math.ceil(firstItemIndex / newPageSize))

    setItemsPerPage(newPageSize)
    setCurrentPage(newCurrentPage)
    updateUrl({ s: newPageSize, p: newCurrentPage })
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
    setIsDetailModalOpen(true)
  }

  const handleBlockUser = (userId) => {
    toast({
      title: "Đã chặn người dùng",
      description: `Người dùng với ID ${userId} đã bị chặn thành công.`,
      variant: "default",
    })

    fetchData({
      p: currentPage,
      s: itemsPerPage,
      q: debouncedSearchQuery,
      sort: sortField,
      order: sortOrder,
      tab: activeTab,
      role: roleFilter,
    })
  }

  const handleUnblockUser = (userId) => {
    toast({
      title: "Đã bỏ chặn người dùng",
      description: `Người dùng với ID ${userId} đã được bỏ chặn thành công.`,
      variant: "success",
    })

    fetchData({
      p: currentPage,
      s: itemsPerPage,
      q: debouncedSearchQuery,
      sort: sortField,
      order: sortOrder,
      tab: activeTab,
      role: roleFilter,
    })
  }

  const handleSelectionChange = (keys: string[], rows: any[]) => {
    setSelectedRowKeys(keys)
    setSelectedRows(rows)
  }

  const handleBatchBlock = () => {
    toast({
      title: "Đã chặn người dùng",
      description: `Đã chặn ${selectedRowKeys.length} người dùng thành công.`,
      variant: "default",
    })

    setSelectedRowKeys([])
    setSelectedRows([])

    fetchData({
      p: currentPage,
      s: itemsPerPage,
      q: debouncedSearchQuery,
      sort: sortField,
      order: sortOrder,
      tab: activeTab,
      role: roleFilter,
    })
  }

  const handleRefresh = () => {
    fetchData({
      p: currentPage,
      s: itemsPerPage,
      q: debouncedSearchQuery,
      sort: sortField,
      order: sortOrder,
      tab: activeTab,
      role: roleFilter,
    })
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<
      string,
      { label: string; className: string }
    > = {
      ACTIVE: {
        label: "Hoạt động",
        className: "bg-green-50 text-green-600 border-green-200",
      },
      BLOCKED: {
        label: "Đã khóa",
        className: "bg-red-50 text-red-600 border-red-200",
      },
      STUDENT: {
        label: "Sinh viên",
        className: "bg-blue-50 text-blue-600 border-blue-200",
      },
      TEACHER: {
        label: "Giảng viên",
        className: "bg-purple-50 text-purple-600 border-purple-200",
      },
      ADMIN: {
        label: "Quản trị viên",
        className: "bg-yellow-50 text-yellow-600 border-yellow-200",
      },
      BGH: {
        label: "Ban giám hiệu",
        className: "bg-pink-50 text-pink-600 border-pink-200",
      },
      PQLKHHTQT: {
        label: "P.QLKH & HTQT",
        className: "bg-indigo-50 text-indigo-600 border-indigo-200",
      },
      BCNKHOA: {
        label: "BCN Khoa",
        className: "bg-orange-50 text-orange-600 border-orange-200",
      },
    }

    const badge = statusMap[status]
    return (
      <Badge
        variant="outline"
        className={badge?.className || "bg-gray-50 text-gray-800 border-gray-200"}
      >
        {badge?.label || status}
      </Badge>
    )
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "ADMIN":
        return <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100">Quản trị viên</Badge>
      case "TEACHER":
        return <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100">Giảng viên</Badge>
      case "STUDENT":
        return <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Sinh viên</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700 hover:bg-gray-100">{role}</Badge>
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Chưa có"
    try {
      const date = new Date(dateString)
      return format(date, "dd/MM/yyyy HH:mm")
    } catch (error) {
      return "Ngày không hợp lệ"
    }
  }

  const columns: Column[] = [
    {
      key: "name",
      title: "Tên tài khoản",
      width: "250px",
      sortable: true,
      render: (_, record) => (
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border">
            <AvatarImage src={record?.imageUrl} alt={record.name} />
            <AvatarFallback className="bg-primary/10 text-primary">{getInitialsAvt(record.name)}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-medium">{record.name || "Chưa cập nhật"}</div>
            <div className="text-sm text-muted-foreground">{record.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "role",
      title: "Vai trò",
      width: "150px",
      render: (_, record) => {
        const badgeRole = roleFilter
          ? record.roles?.find((r) => r.name === roleFilter)?.name
          : record.roles?.[0]?.name
        return getRoleBadge(badgeRole || "Chưa cập nhật")
      },
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "120px",
      sortable: true,
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      key: "lastLogin",
      title: "Đăng nhập gần nhất",
      width: "180px",
      render: (value) => (
        <div className="flex flex-col">
          <span>{formatDate(value)}</span>
          <span className="text-xs text-muted-foreground">{formatTimeAgo(value)}</span>
        </div>
      ),
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "80px",
      align: "center",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[200px]">
            <DropdownMenuItem onClick={() => handleViewUser(record)} className="cursor-pointer">
              <Eye className="mr-2 h-4 w-4" />
              Xem chi tiết
            </DropdownMenuItem>

            <DropdownMenuSeparator />

            {record.status !== "blocked" ? (
              <DropdownMenuItem onClick={() => handleBlockUser(record.id)} className="text-red-600 cursor-pointer">
                <UserX className="mr-2 h-4 w-4" />
                Chặn người dùng
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onClick={() => handleUnblockUser(record.id)} className="text-green-600 cursor-pointer">
                <UserPlus className="mr-2 h-4 w-4" />
                Bỏ chặn người dùng
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  const handleAccountsCreated = () => {
    fetchData({
      p: currentPage,
      s: itemsPerPage,
      q: debouncedSearchQuery,
      sort: sortField,
      order: sortOrder,
      tab: activeTab,
      role: roleFilter,
    })
    setIsCreateMultipleModalOpen(false)
    setIsCreateUserModalOpen(false)
    setIsImportModalOpen(false)
    setIsDetailModalOpen(false)
  }

  const handleExportExcel = async () => {
    try {
      setIsLoading(true)
      const response = await UserService.exportExcel({
        q: debouncedSearchQuery,
        status: activeTab,
        sort: sortField,
        order: sortOrder,
      })

      if (response.status !== 200) {
        toast({
          title: "Có lỗi trong quá trình xuất file!",
          variant: "error",
        })
        return
      }

      const now = new Date()
      const timestamp = now.toISOString().replace(/[:T-]/g, "").slice(0, 14)
      const fileName = `users_${timestamp}.xlsx`

      const blob = new Blob([response.data], {
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      })
      const url = window.URL.createObjectURL(blob)

      const link = document.createElement("a")
      link.href = url
      link.download = fileName
      document.body.appendChild(link)
      link.click()

      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Xuất file thành công",
        variant: "success",
      })
    } catch (error) {
      toast({
        title: "Đã xảy ra lỗi không mong muốn!",
        description: error.message || "Vui lòng thử lại sau.",
        variant: "error",
      })
      console.error("Export Excel Error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const userCounts = {
    all: totalItems,
    active: 0,
    blocked: 0,
  }

  const handleUserStatusChange = async (userId: string, status: UserStatus): Promise<Boolean> => {
    setIsLoading(true)
    try {
      const response = await UserService.changeStatus(userId, status)
      if (response.status === 200) {
        toast({
          title: `Thay đổi trạng thái thành công`,
          description: `Người dùng với ID ${userId} đã được cập nhật trạng thái thành công.`,
          variant: "success",
        })
        return true
      } else {
        toast({
          title: response.data.message || "Có lỗi trong quá trình thay đổi trạng thái",
          variant: "error",
        })
        return false
      }
    } catch (error) {
      console.error("Error changing user status:", error)
      toast({
        title: "Có lỗi trong quá trình thay đổi trạng thái",
        variant: "error",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (userId: string) => {
    const response = await UserService.resetPassword(userId)

    if (response.status === 200 || response.data.code === 1000) {
      toast({
        title: "Đặt lại mật khẩu thành công",
        description: `Mật khẩu đã được đặt lại cho người dùng với ID ${userId}`,
        variant: "success",
      })
    } else {
      toast({
        title: response.data.message || "Có lỗi trong quá trình đặt lại mật khẩu",
        variant: "error",
      })
    }
  }

  const handleCancelLoading = () => {
    setIsLoading(false)
  }

  const handleRoleChange = (value: string) => {
    const roleValue = value === "all" ? undefined : value
    setRoleFilter(roleValue)
    setCurrentPage(1)
    updateUrl({ role: roleValue, p: 1 })
  }

  return (
    <div className="space-y-6">
      {isLoading && <Loading onCancel={handleCancelLoading} />}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quản lý tài khoản</h1>
          <p className="text-muted-foreground mt-1">Quản lý và theo dõi tất cả tài khoản người dùng trong hệ thống</p>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto justify-end">
          <Button variant="outline" size="sm" onClick={() => setIsImportModalOpen(true)}>
            <FilePlusIcon className="h-4 w-4" />
            Tạo bằng file
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsCreateMultipleModalOpen(true)}>
            <Users className="h-4 w-4" />
            Tạo nhiều
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel}>
            <Download className="h-4 w-4" />
            Xuất excel
          </Button>
          <Button size="sm" onClick={() => setIsCreateUserModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Tạo mới
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange}>
        <div className="flex items-center justify-between">
          <TabsList className="grid grid-cols-3 max-w-md">
            <TabsTrigger value="" className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Tất cả</span>
              <Badge variant="secondary" className="ml-1">
                {userCounts.all}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="ACTIVE" className="flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full bg-green-500 p-0 mr-1" />
              <span>Hoạt động</span>
            </TabsTrigger>
            <TabsTrigger value="BLOCKED" className="flex items-center gap-2">
              <Badge variant="outline" className="w-2 h-2 rounded-full bg-red-500 p-0 mr-1" />
              <span>Đã chặn</span>
            </TabsTrigger>
          </TabsList>

          <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Làm mới
          </Button>
        </div>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 mb-4">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm theo mã, tên, email..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select
                  value={roleFilter ?? "all"}
                  onValueChange={handleRoleChange}
                >
                  <SelectTrigger className="w-full md:w-[180px]">
                    <SelectValue placeholder="Lọc theo vai trò" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tất cả vai trò</SelectItem>
                    {getAllRoles().map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="h-10 flex flex-1 justify-end items-center">
                  {selectedRowKeys.length > 0 ? (
                    <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                      <span className="text-sm min-w-[220px]">
                        Đã chọn{" "}
                        <span className="font-bold"> {selectedRowKeys.length}</span>{" "}
                        người dùng
                      </span>
                      <Button size="sm" variant="destructive" onClick={handleBatchBlock}>
                        <UserX className="h-4 w-4" />
                        Chặn tất cả
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedRowKeys([])
                          setSelectedRows([])
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
                loading={loading}
                columns={columns}
                data={users}
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
                emptyMessage="Không tìm thấy người dùng nào"
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <CreateUserModal
        open={isCreateUserModalOpen}
        onOpenChange={setIsCreateUserModalOpen}
        onUserCreated={handleAccountsCreated}
      />

      <CreateMultipleAccountsModal
        open={isCreateMultipleModalOpen}
        onOpenChange={setIsCreateMultipleModalOpen}
        onAccountsCreated={handleAccountsCreated}
      />

      <ImportUsersModal
        open={isImportModalOpen}
        onOpenChange={() => setIsImportModalOpen(false)}
        onImportComplete={handleAccountsCreated}
      />

      <UserDetailModal
        open={isDetailModalOpen}
        onOpenChange={(open) => {
          if (!open) handleAccountsCreated()
          setIsDetailModalOpen(open)
        }}
        user={selectedUser}
        onStatusChange={handleUserStatusChange}
        onResetPassword={handleResetPassword}
      />
    </div>
  )
}

export default AdminUsers