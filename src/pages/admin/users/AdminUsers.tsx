import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Eye, MoreHorizontal, Search, Trash2, UserPlus, UserX } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import DataTable from "@/components/data-table/data-table"
import { useLocation, useNavigate } from "react-router-dom"
import useDebounce from "@/hooks/use-debounce"
import { Column } from "@/models/column"
import mockupUsers from "@/models/mockup-user"

const pageSizeOptions = [5, 10, 15, 20]

const AdminUsers = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [statusFilter, setStatusFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [selectedRows, setSelectedRows] = useState<any[]>([]);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const fetchData = async () => {
    setLoading(true);
    // fetch users from API
    setUsers(mockupUsers);
    setTotalItems(mockupUsers.length);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [currentPage, itemsPerPage, sortField, sortOrder]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    if (query) {
      setSearchQuery(query);
    }
  }, [location.search]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (debouncedSearchQuery) {
      params.set("q", debouncedSearchQuery);
    } else {
      params.delete("q");
    }
    navigate({ search: params.toString() }, { replace: true });
  }, [debouncedSearchQuery, navigate]);

  const indexOfLastUser = currentPage * itemsPerPage
  const indexOfFirstUser = indexOfLastUser - itemsPerPage
  const currentUsers = users.slice(indexOfFirstUser, Math.min(indexOfLastUser, users.length))

  const handleSortChange = (field: string, order: string) => {
    setSortField(field);
    setSortOrder(order);

    console.log(`Sorting by ${field} in ${order} order`);
  };

  const handleStatusFilterChange = (status) => {
    setStatusFilter(status)
    setCurrentPage(1)
  }

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value)
    setCurrentPage(1)
  }

  const handlePageChange = (pageNumber) => {
    console.log(`Fetching page ${pageNumber} with ${itemsPerPage} items per page`)
    setCurrentPage(pageNumber)
  }

  const handlePageSizeChange = (newPageSize) => {
    console.log(`Changing page size to ${newPageSize}`)

    const firstItemIndex = (currentPage - 1) * itemsPerPage + 1
    const newCurrentPage = Math.max(1, Math.ceil(firstItemIndex / newPageSize))

    setItemsPerPage(newPageSize)
    setCurrentPage(newCurrentPage)
  }

  const handleViewUser = (user) => {
    setSelectedUser(user)
  }

  const handleBlockUser = (userId) => {
    console.log(`Blocking user with ID: ${userId}`)
  }

  const handleUnblockUser = (userId) => {
    console.log(`Unblocking user with ID: ${userId}`)
  }

  const handleSelectionChange = (keys: string[], rows: any[]) => {
    setSelectedRowKeys(keys)
    setSelectedRows(rows)
    console.log("Selected users:", rows)
  }

  const handleBatchBlock = () => {
    console.log(selectedRows)
    setSelectedRowKeys([])
    setSelectedRows([])
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Hoạt động</Badge>
      case "blocked":
        return <Badge className="bg-red-500">Đã chặn</Badge>
      case "inactive":
        return <Badge className="bg-gray-500">Không hoạt động</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  // Define table columns
  const columns: Column[] = [
    {
      key: "id",
      title: "STT",
      width: "40px",
      sortable: true,
    },
    {
      key: "name",
      title: "Tên",
      width: "150px",
      sortable: true,
    },
    {
      key: "email",
      title: "Email",
      width: "200px",
    },
    {
      key: "role",
      title: "Vai trò",
      width: "120px",
    },
    {
      key: "status",
      title: "Trạng thái",
      width: "120px",
      render: (_, record) => getStatusBadge(record.status),
    },
    {
      key: "lastActive",
      title: "Hoạt động cuối",
      width: "120px",
    },
    {
      key: "actions",
      title: "Thao tác",
      width: "60px",
      align: "center",
      render: (_, record) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Mở menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <Dialog>
              <DialogTrigger asChild>
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    handleViewUser(record)
                  }}
                >
                  <Eye className="mr-2 h-4 w-4" />
                  Xem chi tiết
                </DropdownMenuItem>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Thông tin người dùng</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  {selectedUser && (
                    <div className="grid grid-cols-4 items-center gap-4">
                      <div className="font-medium">ID:</div>
                      <div className="col-span-3">{selectedUser.id}</div>

                      <div className="font-medium">Tên:</div>
                      <div className="col-span-3">{selectedUser.name}</div>

                      <div className="font-medium">Email:</div>
                      <div className="col-span-3">{selectedUser.email}</div>

                      <div className="font-medium">Vai trò:</div>
                      <div className="col-span-3">{selectedUser.role}</div>

                      <div className="font-medium">Trạng thái:</div>
                      <div className="col-span-3">{getStatusBadge(selectedUser.status)}</div>

                      <div className="font-medium">Hoạt động cuối:</div>
                      <div className="col-span-3">{selectedUser.lastActive}</div>
                    </div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {record.status !== "blocked" ? (
              <DropdownMenuItem onSelect={() => handleBlockUser(record.id)} className="text-red-600">
                <UserX className="mr-2 h-4 w-4" />
                Chặn người dùng
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem onSelect={() => handleUnblockUser(record.id)} className="text-green-600">
                <UserPlus className="mr-2 h-4 w-4" />
                Bỏ chặn người dùng
              </DropdownMenuItem>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ]

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý người dùng</h1>

        <Button>
          <UserPlus className="h-4 w-4" />
          Thêm mới
        </Button>
      </div>

      <Card>
        <CardContent className="mt-4">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Tìm kiếm theo tên, email, vai trò..."
                className="pl-8"
                value={searchQuery}
                onChange={handleSearchChange}
              />
            </div>
            <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Lọc theo trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả người dùng</SelectItem>
                <SelectItem value="active">Đang hoạt động</SelectItem>
                <SelectItem value="blocked">Đã chặn</SelectItem>
                <SelectItem value="inactive">Không hoạt động</SelectItem>
              </SelectContent>
            </Select>

            <div className="h-10 flex flex-1 justify-end items-center">
              {selectedRowKeys.length > 0 ? (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <span className="text-sm min-w-[220px]">
                    Đã chọn <span className="font-bold"> {selectedRowKeys.length}</span> người dùng
                  </span>
                  <Button variant="destructive" onClick={handleBatchBlock}>
                    <UserX className="h-4 w-4" />
                    Chặn tất cả
                  </Button>
                  <Button
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
            minHeight="550px"
            loading={loading}
            columns={columns}
            data={currentUsers}
            itemsPerPage={itemsPerPage}
            pagination={true}
            currentPage={currentPage}
            totalItems={users.length}
            pageSizeOptions={pageSizeOptions}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
            selectable={true}
            selectedRowKeys={selectedRowKeys}
            onSelectionChange={handleSelectionChange}
            onSortChange={handleSortChange}
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminUsers

