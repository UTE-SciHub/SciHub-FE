import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/data-table/data-table";
import { useLocation, useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/use-debounce";
import { Column } from "@/models/column";
import { Button } from "@/components/ui/button";
import { CirclePlus, Download, Eye, FileText, Loader2, Lock, LockIcon, MoreHorizontal, RefreshCw, Trash, Trash2, Unlock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { Contract, ContractStatus } from "@/models/contract";
import { ContractFilterParams, ContractService } from "@/service/contract-service";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import CreateContractModal from "./CreateContractModal";
import UpdateContractModal from "./UpdateContractModal";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

const ContractList = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 5;
    const initialQuery = params.get("q") || "";
    const initialSort = params.get("sort") || "createdAt";
    const initialOrder = params.get("order") || "desc";
    const initialStatus = params.get("status") || "all";
    const initialDelFlag = params.get("delFlag") || "all";

    const [contracts, setContracts] = useState<Contract[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(initialSize);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortField, setSortField] = useState(initialSort);
    const [sortOrder, setSortOrder] = useState(initialOrder);
    const [statusFilter, setStatusFilter] = useState<string>(initialStatus);
    const [delFlag, setDelFlag] = useState<string>(initialDelFlag);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<Contract[]>([]);
    const [lockConfirmOpen, setLockConfirmOpen] = useState(false);
    const [isLocking, setIsLocking] = useState(false);
    const [batchAction, setBatchAction] = useState<"lock" | "unlock" | null>(null);
    const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);

    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const isUpdatingUrl = useRef(false);

    const fetchData = async (params: {
        p: number;
        s: number;
        q: string;
        sort: string;
        order: string;
        status?: ContractStatus;
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
                status?: ContractStatus;
                delFlag?: boolean;
            } = {
                p: params.p,
                s: params.s,
                sort: params.sort,
                order: params.order,
                q: params.q,
                status: params.status,
                delFlag: params.delFlag === "all" ? undefined : params.delFlag === "true",
            };

            const response = await ContractService.findAll(requestParams);

            setContracts(response.data.data);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            console.error("Error fetching research fields:", error);
            toast({
                title: "Có lỗi trong quá trình lấy dữ liệu!",
                variant: "error",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!isUpdatingUrl.current) {
            fetchData({
                p: currentPage,
                s: itemsPerPage,
                q: debouncedSearchQuery,
                sort: sortField,
                order: sortOrder,
                status: statusFilter !== "all" ? statusFilter as ContractStatus : undefined,
                delFlag: delFlag,
            });
        }
    }, [currentPage, itemsPerPage, debouncedSearchQuery, sortField, sortOrder, statusFilter, delFlag]);

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
    };

    const handleStatusFilterChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
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

    const handleViewContract = (contract: Contract) => {
        setIsDetailModalOpen(false);
        setTimeout(() => {
            setSelectedContract(contract);
            setIsDetailModalOpen(true);
        }, 0);
    };

    const getStatusBadge = (status: ContractStatus) => {
        switch (status) {
            case ContractStatus.PENDING:
                return <Badge variant="outline">Chờ ký</Badge>;
            case ContractStatus.SIGNED:
                return <Badge variant="default">Đã ký</Badge>;
            case ContractStatus.CANCELLED:
                return <Badge variant="destructive">Hủy</Badge>;
        }
    }

    const columns: Column[] = [
        { key: "code", title: "Mã hợp đồng", width: "100px", sortable: true },
        { key: "name", title: "Tên hợp đồng", width: "100px", sortable: true },
        { key: "signedDate", title: "Ngày ký", width: "150px", sortable: true },
        { key: "status", title: "Trạng thái", width: "80px", render: (_, record) => getStatusBadge(record.status) },
        {
            key: "contractPath",
            title: "File hợp đồng",
            width: "60px",
            render: (_, record) =>
                record.contractPath ? (
                    <TooltipProvider>
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <a
                                    href={record.contractPath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center h-8 w-8 rounded-md bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                                >
                                    <FileText className="h-4 w-4" />
                                </a>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Xem hợp đồng</p>
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
            width: "80px",
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
                                handleViewContract(record);
                            }}
                        >
                            <Eye className="mr-2 h-4 w-4" />
                            Xem chi tiết
                        </DropdownMenuItem>
                        {record.delFlag ? (
                            <DropdownMenuItem
                                className="text-green-500"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    openConfirmLock(record, false);
                                }}
                            >
                                <Unlock className="mr-2 h-4 w-4" />
                                Mở khóa
                            </DropdownMenuItem>
                        ) : (
                            <DropdownMenuItem
                                className="text-destructive"
                                onSelect={(e) => {
                                    e.preventDefault();
                                    openConfirmLock(record, true);
                                }}
                            >
                                <Trash className="mr-2 h-4 w-4" />
                                Xóa
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

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

    const openConfirmLock = async (record: Contract, newStatus: boolean) => {
        setSelectedContract(record);
        setIsLocking(newStatus);
        setLockConfirmOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Danh sách hợp đồng</h1>
                    <p className="text-muted-foreground mt-1">Quản lý các hợp đồng của đề tài</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <CirclePlus /> Tạo hợp đồng
                </Button>
            </div>
            <Card>
                <CardContent className="mt-4">
                    <div className="flex flex-col items-end md:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="search-query" className="text-sm font-medium">Tìm kiếm</label>
                                <Input
                                    id="search-query"
                                    className="border-primary"
                                    type="text"
                                    placeholder="Tìm kiếm theo tên..."
                                    value={searchQuery}
                                    onChange={handleSearchChange}
                                />
                            </div>
                        </div>
                        <div className="w-40">
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="status-filter" className="text-sm font-medium">Trạng thái hợp đồng</label>
                                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                                    <SelectTrigger id="status-filter">
                                        <SelectValue placeholder="Trạng thái hợp đồng" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value={ContractStatus.PENDING}>Chờ ký</SelectItem>
                                        <SelectItem value={ContractStatus.SIGNED}>Đã ký</SelectItem>
                                        <SelectItem value={ContractStatus.CANCELLED}>Đã hủy</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="w-40">
                            <div className="flex flex-col space-y-1.5">
                                <label htmlFor="lock-filter" className="text-sm font-medium">Trạng thái khóa</label>
                                <Select value={delFlag} onValueChange={handleDelFlagChange}>
                                    <SelectTrigger id="lock-filter">
                                        <SelectValue placeholder="Trạng thái khóa" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Tất cả</SelectItem>
                                        <SelectItem value="false">Mở khóa</SelectItem>
                                        <SelectItem value="true">Khóa</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="h-10 flex flex-1 justify-end items-center">
                            {selectedRowKeys.length > 0 ? (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                    <span className="text-sm min-w-[220px]">
                                        Đã chọn <span className="font-bold">{selectedRowKeys.length}</span> hợp đồng
                                    </span>
                                    {/* <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                size="sm"
                                                variant="outline"
                                                className="ml-auto"
                                            >
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setBatchAction("lock");
                                                    setIsBatchConfirmOpen(true);
                                                }}
                                            >
                                                <LockIcon className="mr-2 h-4 w-4" />
                                                {selectedRows.length > 1 ? "Khóa tất cả" : "Khóa"}
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setBatchAction("unlock");
                                                    setIsBatchConfirmOpen(true);
                                                }}
                                            >
                                                <Unlock className="mr-2 h-4 w-4" />
                                                {selectedRows.length > 1 ? "Mở khóa tất cả" : "Mở khóa"}
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu> */}
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => {
                                            setSelectedRowKeys([]);
                                            setSelectedRows([]);
                                        }}
                                        className="text-rose-500 hover:text-rose-600"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Hủy chọn
                                    </Button>
                                </div>
                            ) : (
                                <div className="min-w-[260px]"></div>
                            )}
                        </div>
                        <Button variant="outline" size="sm" onClick={handleRefresh} disabled={loading}>
                            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
                            Làm mới
                        </Button>
                    </div>

                    <DataTable
                        selectable={true}
                        minHeight="auto"
                        maxHeight="550px"
                        loading={loading}
                        columns={columns}
                        data={contracts}
                        itemsPerPage={itemsPerPage}
                        pagination={true}
                        currentPage={currentPage}
                        totalItems={totalItems}
                        selectedRowKeys={selectedRowKeys}
                        onPageChange={handlePageChange}
                        onSelectionChange={(newSelectedRowKeys, newSelectedRows) => {
                            setSelectedRowKeys(newSelectedRowKeys);
                            setSelectedRows(newSelectedRows);
                        }}
                        onPageSizeChange={handlePageSizeChange}
                        onSortChange={handleSortChange}
                    />
                </CardContent>
            </Card>

            <CreateContractModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onContractAdded={handleRefresh}
            />

            {selectedContract && (
                <UpdateContractModal
                    open={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    contract={selectedContract}
                    onContractUpdated={handleRefresh}
                />
            )}

            {/* <AlertDialog open={lockConfirmOpen} onOpenChange={setLockConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isLocking ? "Mở khóa hợp đồng" : "Khóa hợp đồng"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn {isLocking ? "mở khóa" : "khóa"} hợp đồng{" "}
                            <span className="font-medium">{selectedContract?.name}</span>?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleStatusChange();
                            }}
                            disabled={loading}
                            className="bg-primary"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isBatchConfirmOpen} onOpenChange={setIsBatchConfirmOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {batchAction === "lock" ? "Khóa các hợp đồng" : "Mở khóa các hợp đồng"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn {batchAction === "lock" ? "khóa" : "mở khóa"}{" "}
                            <span className="font-medium">{selectedRowKeys.length}</span> hợp đồng đã chọn?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={loading}>Hủy</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={(e) => {
                                e.preventDefault();
                                handleBatchAction();
                            }}
                            disabled={loading}
                            className={batchAction === "lock" ? "bg-destructive" : "bg-green-500"}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog> */}
        </div>
    );
};

export default ContractList;