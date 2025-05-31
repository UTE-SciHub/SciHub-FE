import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import DataTable from "@/components/data-table/data-table";
import { useLocation, useNavigate } from "react-router-dom";
import useDebounce from "@/hooks/use-debounce";
import { Column } from "@/models/column";
import { Button } from "@/components/ui/button";
import { Badge, Ban, CirclePlus, Eye, Loader2, Lock, LockIcon, MoreHorizontal, RefreshCw, Trash2, Unlock } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { ResearchType } from "@/models/research-type";
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
import CreateResearchTypeModal from "@/pages/admin/research-type/CreateResearchTypeModal";
import UpdateResearchTypeModal from "@/pages/admin/research-type/UpdateResearchTypeModal";
import { ResearchTypeService } from "@/service/research-type-service";

const ListResearchType = () => {
    const location = useLocation();
    const navigate = useNavigate();

    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 5;
    const initialQuery = params.get("q") || "";
    const initialSort = params.get("sort") || "createdAt";
    const initialOrder = params.get("order") || "desc";
    const initialDelFlag = params.get("delFlag") || "all";

    const [researchTypes, setResearchTypes] = useState<ResearchType[]>([]);
    const [itemsPerPage, setItemsPerPage] = useState(initialSize);
    const [totalItems, setTotalItems] = useState(0);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortType, setSortType] = useState(initialSort);
    const [sortOrder, setSortOrder] = useState(initialOrder);
    const [delFlag, setDelFlag] = useState(initialDelFlag);
    const [loading, setLoading] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedResearchType, setSelectedResearchType] = useState<ResearchType | null>(null);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<ResearchType[]>([]);
    const [statusChangeConfirm, setStatusChangeConfirm] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [batchAction, setBatchAction] = useState<"block" | "unblock" | null>(null);
    const [isBatchConfirmOpen, setIsBatchConfirmOpen] = useState(false);

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

            const response = await ResearchTypeService.getAll(requestParams);

            setResearchTypes(response.data.data);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            console.error("Error fetching research types:", error);
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
            sort: sortType,
            order: sortOrder,
            delFlag: delFlag,
        });
    }, [currentPage, itemsPerPage, debouncedSearchQuery, sortType, sortOrder, delFlag]);

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

    const handleDelFlagChange = (value: string) => {
        setDelFlag(value);
        setCurrentPage(1);
        updateUrl({ delFlag: value, p: 1 });
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchQuery(value);
        setCurrentPage(1);
        updateUrl({ q: value, p: 1 });
    };

    const handleSortChange = (type: string, order: string) => {
        setSortType(type);
        setSortOrder(order);
        updateUrl({ sort: type, order });
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

    const handleViewResearchType = (researchType: ResearchType) => {
        setIsDetailModalOpen(false);
        setTimeout(() => {
            setSelectedResearchType(researchType);
            setIsDetailModalOpen(true);
        }, 0);
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
            <div className="flex">
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
        { key: "name", title: "Tên loại hình", width: "100px", sortable: true },
        { key: "description", title: "Mô tả", width: "150px" },
        { key: "delFlag", title: "Trạng thái", width: "80px", render: (_, record) => getStatusBadge(record.delFlag) },
        { key: "createdAt", title: "Ngày tạo", width: "150px", sortable: true },
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
                                handleViewResearchType(record);
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
                                <Lock className="mr-2 h-4 w-4" />
                                Khóa
                            </DropdownMenuItem>
                        )}
                    </DropdownMenuContent>
                </DropdownMenu>
            ),
        },
    ];

    const handleResearchTypeAdded = () => {
        fetchData({
            p: 1,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortType,
            order: sortOrder,
            delFlag: delFlag,
        });
    };

    const handleRefresh = () => {
        fetchData({
            p: currentPage,
            s: itemsPerPage,
            q: debouncedSearchQuery,
            sort: sortType,
            order: sortOrder,
            delFlag: delFlag,
        });
    };

    const openConfirmLock = async (record: ResearchType, newStatus: boolean) => {
        setSelectedResearchType(record);
        setIsActive(newStatus);
        setStatusChangeConfirm(true);
    };

    const handleStatusChange = async () => {
        setLoading(true);

        try {
            const response = await ResearchTypeService.updateStatus(selectedResearchType?.id!, isActive);
            if (response.status === 200 && response.data.code === 1000) {
                toast({
                    title: `Đã ${isActive ? "mở khóa" : "khóa"} thành công!`,
                    variant: "success",
                });
                handleRefresh();
            } else {
                toast({
                    title: `Có lỗi trong quá trình ${isActive ? "mở khóa" : "khóa"}!`,
                    variant: "error",
                });
            }
        } catch (error) {
            console.error("Error updating status:", error);
            toast({
                title: `Có lỗi trong quá trình ${isActive ? "mở khóa" : "khóa"}!`,
                variant: "error",
            });
        } finally {
            setLoading(false);
            setStatusChangeConfirm(false);
        }
    };

    const handleBatchAction = async () => {
        if (!batchAction) return;

        setLoading(true);
        try {
            const promises = selectedRows.map((row: ResearchType) =>
                ResearchTypeService.updateStatus(row.id!, batchAction === "block")
            );
            const responses = await Promise.all(promises);

            const failed = responses.some((res) => res.status !== 200 || res.data.code !== 1000);
            if (failed) {
                throw new Error("Có lỗi trong quá trình xử lý một số loại hình");
            }

            toast({
                title: `Đã ${batchAction === "block" ? "khóa" : "mở khóa"} ${selectedRowKeys.length} loại hình thành công!`,
                variant: "success",
            });

            handleRefresh();
            setSelectedRowKeys([]);
            setSelectedRows([]);
        } catch (error) {
            console.error("Error during batch action:", error);
            toast({
                title: `Có lỗi trong quá trình ${batchAction === "block" ? "khóa" : "mở khóa"} các loại hình!`,
                variant: "error",
            });
        } finally {
            setLoading(false);
            setIsBatchConfirmOpen(false);
            setBatchAction(null);
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Danh sách loại hình nghiên cứu</h1>
                    <p className="text-muted-foreground mt-1">Quản lý các loại hình nghiên cứu của đề tài</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)}>
                    <CirclePlus /> Thêm loại hình
                </Button>
            </div>
            <Card>
                <CardContent className="mt-4">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                        <div className="relative flex-1">
                            <Input
                                className="border-primary"
                                type="text"
                                placeholder="Tìm kiếm theo tên..."
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
                        <div className="h-10 flex flex-1 justify-end items-center">
                            {selectedRowKeys.length > 0 ? (
                                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                                    <span className="text-sm min-w-[220px]">
                                        Đã chọn <span className="font-bold">{selectedRowKeys.length}</span> loại hình
                                    </span>
                                    <Button
                                        size="sm"
                                        variant="destructive"
                                        onClick={() => {
                                            setBatchAction("block");
                                            setIsBatchConfirmOpen(true);
                                        }}
                                    >
                                        <LockIcon className="h-4 w-4" />
                                        {selectedRows.length > 1 ? "Khóa tất cả" : "Khóa"}
                                    </Button>
                                    <Button
                                        size="sm"
                                        className="bg-green-500 text-white hover:bg-green-600"
                                        onClick={() => {
                                            setBatchAction("unblock");
                                            setIsBatchConfirmOpen(true);
                                        }}
                                    >
                                        <Unlock className="h-4 w-4" />
                                        {selectedRows.length > 1 ? "Mở khóa tất cả" : "Mở khóa"}
                                    </Button>
                                    <Button
                                        size="sm"
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
                        data={researchTypes}
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

            <CreateResearchTypeModal
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onResearchTypeAdded={handleResearchTypeAdded}
            />

            {selectedResearchType && (
                <UpdateResearchTypeModal
                    open={isDetailModalOpen}
                    onOpenChange={setIsDetailModalOpen}
                    researchType={selectedResearchType}
                    onResearchTypeUpdated={handleResearchTypeAdded}
                />
            )}

            <AlertDialog open={statusChangeConfirm} onOpenChange={setStatusChangeConfirm}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{isActive ? "Mở khóa loại hình" : "Khóa loại hình"}</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn {isActive ? "mở khóa" : "khóa"} loại hình{" "}
                            <span className="font-medium">{selectedResearchType?.name}</span>?
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
                            {batchAction === "block" ? "Khóa các loại hình" : "Mở khóa các loại hình"}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc muốn {batchAction === "block" ? "khóa" : "mở khóa"}{" "}
                            <span className="font-medium">{selectedRowKeys.length}</span> loại hình đã chọn?
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
                            className={batchAction === "block" ? "bg-destructive" : "bg-green-500"}
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {loading ? "Đang xử lý..." : "Xác nhận"}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default ListResearchType;