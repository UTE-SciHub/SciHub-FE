import { useEffect, useState, useCallback } from "react";
import { Search, Check, RefreshCcw, HelpCircle, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { Topic } from "@/models/topic";
import { RegistrationService } from "@/service/registration-service";
import { TopicService } from "@/service/topic-service";
import { TopicApplicationRequest, TopicApplicationService } from "@/service/topic-application-service";
import { toast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import useDebounce from "@/hooks/use-debounce";
import useUserStore from "@/store/userStore";
import { RegistrationPeriod } from "@/models/registraion-period";
import { formatDateString } from "@/utils/dateTimeFormat";
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status";
import DataTable from "@/components/data-table/data-table";
import { Column } from "@/models/column";
import { useLocation, useNavigate } from "react-router-dom";
import { TopicStatus } from "@/models/enums/topic-status.enum";

const registrationSchema = z.object({
    plan: z.string().min(10, "Kế hoạch phải có ít nhất 10 ký tự"),
    motivation: z.string().min(10, "Động lực phải có ít nhất 10 ký tự"),
});

type RegistrationFormValues = z.infer<typeof registrationSchema>;

const RegisterCNDTPage = () => {
    const user = useUserStore((state) => state.user);
    const userEmail = user?.email || "";
    const location = useLocation();
    const navigate = useNavigate();

    // Initialize state from URL parameters
    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 10;
    const initialQuery = params.get("q") || "";
    const initialPeriodId = params.get("periodId") || "all";

    // Consolidated filters state
    const [filters, setFilters] = useState({
        searchTerm: initialQuery,
        registrationPeriodId: initialPeriodId,
        currentPage: initialPage,
        itemsPerPage: initialSize,
    });
    const [topics, setTopics] = useState<Topic[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isFilterDialogOpen, setIsFilterDialogOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [deleteApplicationId, setDeleteApplicationId] = useState<string | null>(null);
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
    const [sortColumn, setSortColumn] = useState<string>("createdAt");
    const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

    const debouncedSearchQuery = useDebounce(filters.searchTerm, 300);

    // Form for registration
    const form = useForm<RegistrationFormValues>({
        resolver: zodResolver(registrationSchema),
        defaultValues: {
            plan: "",
            motivation: "",
        },
    });

    // Define columns for DataTable
    const columns: Column[] = [
        {
            key: "topicCode",
            title: "Mã đề tài",
            width: "100px",
            sortable: true,
        },
        {
            key: "vietnameseName",
            title: "Tên đề tài",
            width: "300px",
            sortable: true,
        },
        {
            key: "field",
            title: "Lĩnh vực",
            width: "200px",
            render: (_, record) => record.field?.name || "Chưa phân loại",
        },
        {
            key: "registrationPeriod",
            title: "Đợt nghiên cứu",
            width: "200px",
            render: (_, record) => record.registrationPeriod?.title || "N/A",
        },
        {
            key: "actions",
            title: "Hành động",
            width: "150px",
            render: (_, record) => (
                <div className="flex gap-2">
                    {record.hasApplied ? (
                        <>
                            <Badge
                                className="text-sm bg-green-500 text-white"
                                aria-label={`Đã đăng ký đề tài ${record.vietnameseName}`}
                            >
                                Đã đăng ký
                            </Badge>
                            <Button
                                variant="destructive"
                                size="sm"
                                onClick={() => {
                                    setDeleteApplicationId(record.applicationId!);
                                    setIsDeleteDialogOpen(true);
                                }}
                                disabled={record.applicationStatus !== "PENDING" || !record.applicationId}
                                aria-label={`Xóa đăng ký đề tài ${record.vietnameseName}`}
                            >
                                <Trash2 className="h-4 w-4" />
                                Xóa
                            </Button>
                        </>
                    ) : (
                        <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleRegister(record)}
                            aria-label={`Đăng ký đề tài ${record.vietnameseName}`}
                        >
                            <Check className="h-4 w-4" />
                            Đăng ký
                        </Button>
                    )}
                </div>
            ),
        },
    ];

    // Fetch registration periods once on mount
    useEffect(() => {
        const fetchPeriods = async () => {
            try {
                const response = await RegistrationService.getAll({
                    p: 1,
                    s: 1000,
                    sort: "startDate",
                    order: "desc",
                    status: RegistrationPeriodStatus.OPEN,
                });
                setRegistrationPeriods(response.data.data);
            } catch (error) {
                console.error("Lỗi khi lấy danh sách đợt:", error);
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải danh sách đợt. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                    variant: "error",
                });
            }
        };

        fetchPeriods();
    }, []);

    // Fetch topics
    const fetchTopics = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await TopicApplicationService.getAll({
                p: filters.currentPage,
                s: filters.itemsPerPage,
                sort: sortColumn,
                order: sortDirection,
                q: debouncedSearchQuery,
                status: TopicStatus.IN_CATALOG,
                periodId: filters.registrationPeriodId !== "all" ? filters.registrationPeriodId : undefined,
            });

            setTopics(response.data.data);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đề tài:", error);
            toast({
                title: "Lỗi khi tải dữ liệu",
                description: "Không thể tải danh sách đề tài. Vui lòng thử lại hoặc kiểm tra kết nối.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    }, [filters.currentPage, filters.itemsPerPage, debouncedSearchQuery, filters.registrationPeriodId, sortColumn, sortDirection]);

    useEffect(() => {
        fetchTopics();
    }, [fetchTopics]);

    // Update URL
    const updateUrl = useCallback(() => {
        const searchParams = new URLSearchParams();
        const params: Record<string, string | number | undefined> = {
            p: filters.currentPage,
            s: filters.itemsPerPage,
            q: filters.searchTerm || undefined,
            periodId: filters.registrationPeriodId !== "all" ? filters.registrationPeriodId : undefined,
            sort: sortColumn,
            order: sortDirection,
        };

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                searchParams.set(key, value.toString());
            }
        });

        navigate({ search: searchParams.toString() }, { replace: true });
    }, [filters, sortColumn, sortDirection, navigate]);

    useEffect(() => {
        updateUrl();
    }, [updateUrl]);

    // Handle filter changes
    const updateFilters = useCallback((newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({
            ...prev,
            ...newFilters,
            currentPage: newFilters.currentPage ?? 1,
        }));
    }, []);

    // Handle search input change
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        updateFilters({ searchTerm: e.target.value });
    };

    // Handle search key press (Enter)
    const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
            fetchTopics();
        }
    };

    // Handle registration period filter change
    const handlePeriodChange = (value: string) => {
        updateFilters({ registrationPeriodId: value });
        setIsFilterDialogOpen(false);
    };

    // Handle page change
    const handlePageChange = (pageNumber: number) => {
        updateFilters({ currentPage: pageNumber });
    };

    // Handle page size change
    const handlePageSizeChange = (newPageSize: number) => {
        updateFilters({ itemsPerPage: newPageSize });
    };

    // Handle sort change
    const handleSortChange = (columnKey: string, direction: "asc" | "desc") => {
        setSortColumn(columnKey);
        setSortDirection(direction);
    };

    // Handle refresh
    const handleRefresh = () => {
        setFilters({
            searchTerm: "",
            registrationPeriodId: "all",
            currentPage: 1,
            itemsPerPage: 10,
        });
        setSortColumn("createdAt");
        setSortDirection("desc");
        fetchTopics();
    };

    // Open registration modal
    const handleRegister = (topic: Topic) => {
        setSelectedTopic(topic);
        setIsModalOpen(true);
        form.reset();
    };

    // Submit registration
    const handleSubmitRegistration = async (data: RegistrationFormValues) => {
        if (!selectedTopic) return;

        setIsLoading(true);
        try {
            const request: TopicApplicationRequest = {
                topicId: selectedTopic.id,
                plan: data.plan,
                motivation: data.motivation,
            };

            const response = await TopicApplicationService.apply(request);

            if (response.status === 201 && response.data.code === 1000) {
                toast({
                    title: "Đăng ký thành công",
                    description: "Đã gửi đăng ký làm chủ nhiệm đề tài thành công.",
                    variant: "success",
                });
                setIsModalOpen(false);
                await fetchTopics();
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error: any) {
            console.error("Lỗi khi đăng ký:", error);
            toast({
                title: "Lỗi khi đăng ký",
                description: error.message || "Không thể gửi đăng ký. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    // Delete application
    const handleDelete = async (applicationId: string) => {
        setIsLoading(true);
        try {
            const response = await TopicApplicationService.delete(applicationId);

            if (response.status === 200 || response.status === 204) {
                toast({
                    title: "Xóa đăng ký thành công",
                    description: "Đã xóa đăng ký đề tài thành công.",
                    variant: "success",
                });
                setIsDeleteDialogOpen(false);
                setDeleteApplicationId(null);
                await fetchTopics();
            } else {
                throw new Error("Unexpected response status");
            }
        } catch (error: any) {
            console.error("Lỗi khi xóa đăng ký:", error);
            toast({
                title: "Lỗi khi xóa đăng ký",
                description: error.message || "Không thể xóa đăng ký. Vui lòng thử lại hoặc liên hệ hỗ trợ.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TooltipProvider>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Đăng ký chủ nhiệm đề tài</h1>
                        <p className="text-sm text-muted-foreground">
                            Chọn đề tài trong danh mục để đăng ký làm chủ nhiệm.
                        </p>
                    </div>
                    <Button
                        variant="default"
                        onClick={handleRefresh}
                        aria-label="Làm mới danh sách đề tài"
                    >
                        <RefreshCcw className="w-4 h-4" />
                        Làm mới
                    </Button>
                </div>

                {/* Search and Filter */}
                <div className="flex flex-col gap-4">
                    <div className="flex items-center gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                            <Input
                                placeholder="Tìm kiếm đề tài..."
                                className="pl-9"
                                value={filters.searchTerm}
                                onChange={handleSearchChange}
                                onKeyDown={handleSearchKeyDown}
                                aria-label="Tìm kiếm đề tài theo mã hoặc tên"
                            />
                        </div>
                        <div className="hidden md:block">
                            <Select value={filters.registrationPeriodId} onValueChange={handlePeriodChange}>
                                <SelectTrigger className="w-[200px]">
                                    <SelectValue placeholder="Chọn đợt nghiên cứu" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">Tất cả đợt</SelectItem>
                                    {registrationPeriods.map((period) => (
                                        <SelectItem key={period.id} value={period.id}>
                                            {period.title} ({formatDateString(period.startDate)} - {formatDateString(period.endDate)})
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="md:hidden">
                            <Dialog open={isFilterDialogOpen} onOpenChange={setIsFilterDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" aria-label="Mở bộ lọc">
                                        Bộ lọc
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Bộ lọc</DialogTitle>
                                    </DialogHeader>
                                    <Select value={filters.registrationPeriodId} onValueChange={handlePeriodChange}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Chọn đợt nghiên cứu" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">Tất cả đợt</SelectItem>
                                            {registrationPeriods.map((period) => (
                                                <SelectItem key={period.id} value={period.id}>
                                                    {period.title} ({formatDateString(period.startDate)} - {formatDateString(period.endDate)})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </DialogContent>
                            </Dialog>
                        </div>
                    </div>
                </div>

                {/* Topics Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Danh sách đề tài có thể ứng tuyển chủ nhiệm</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <DataTable
                            minHeight="auto"
                            loading={isLoading}
                            columns={columns}
                            data={topics}
                            itemsPerPage={filters.itemsPerPage}
                            pagination={true}
                            currentPage={filters.currentPage}
                            totalItems={totalItems}
                            onPageChange={handlePageChange}
                            onPageSizeChange={handlePageSizeChange}
                            selectable={false}
                            selectedRowKeys={[]}
                            onSelectionChange={() => { }}
                            onSortChange={handleSortChange}
                            emptyMessage="Không tìm thấy đề tài nào"
                        />
                    </CardContent>
                </Card>

                {/* Registration Modal */}
                <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                    <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                        <DialogHeader className="flex items-center justify-between">
                            <DialogTitle>Đăng ký chủ nhiệm đề tài</DialogTitle>
                        </DialogHeader>
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(handleSubmitRegistration)} className="space-y-4">
                                <div>
                                    <p className="font-medium">Tên đề tài:</p>
                                    <p className="text-sm">{selectedTopic?.vietnameseName}</p>
                                </div>
                                <div>
                                    <p className="font-medium">Mã đề tài:</p>
                                    <p className="text-sm">{selectedTopic?.topicCode}</p>
                                </div>
                                <FormField
                                    control={form.control}
                                    name="plan"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormLabel>Kế hoạch thực hiện</FormLabel>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Mô tả chi tiết kế hoạch thực hiện đề tài, bao gồm các bước và thời gian dự kiến.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Textarea
                                                        placeholder="Mô tả kế hoạch thực hiện đề tài..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                        aria-label="Kế hoạch thực hiện đề tài"
                                                    />
                                                    <p className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                                                        {field.value.length}/1000
                                                    </p>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="motivation"
                                    render={({ field }) => (
                                        <FormItem>
                                            <div className="flex items-center gap-2">
                                                <FormLabel>Động lực tham gia</FormLabel>
                                                <Tooltip>
                                                    <TooltipTrigger asChild>
                                                        <HelpCircle className="h-4 w-4 text-muted-foreground" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        Giải thích lý do bạn muốn làm chủ nhiệm đề tài này và động lực cá nhân.
                                                    </TooltipContent>
                                                </Tooltip>
                                            </div>
                                            <FormControl>
                                                <div className="relative">
                                                    <Textarea
                                                        placeholder="Lý do và động lực tham gia làm chủ nhiệm..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                        aria-label="Động lực tham gia làm chủ nhiệm"
                                                    />
                                                    <p className="absolute bottom-2 right-2 text-sm text-muted-foreground">
                                                        {field.value.length}/1000
                                                    </p>
                                                </div>
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <DialogFooter>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        aria-label="Hủy đăng ký"
                                    >
                                        Hủy
                                    </Button>
                                    <Button type="submit" disabled={isLoading} aria-label="Gửi đăng ký">
                                        <Check className="h-4 w-4" />
                                        {isLoading ? "Đang gửi..." : "Gửi đăng ký"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </Form>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                    <DialogContent className="max-w-md p-4 sm:p-6">
                        <DialogHeader>
                            <DialogTitle>Xác nhận xóa đăng ký</DialogTitle>
                        </DialogHeader>
                        <p className="text-sm text-muted-foreground">
                            Bạn có chắc chắn muốn xóa đăng ký đề tài này? Hành động này không thể hoàn tác.
                        </p>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setIsDeleteDialogOpen(false);
                                    setDeleteApplicationId(null);
                                }}
                                aria-label="Hủy xóa đăng ký"
                            >
                                Hủy
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={() => {
                                    if (deleteApplicationId) {
                                        handleDelete(deleteApplicationId);
                                    }
                                }}
                                disabled={isLoading}
                                aria-label="Xác nhận xóa đăng ký"
                            >
                                <Trash2 className="h-4 w-4" />
                                {isLoading ? "Đang xóa..." : "Xóa"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </TooltipProvider>
    );
};

export default RegisterCNDTPage;