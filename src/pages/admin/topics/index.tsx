import { useEffect, useState } from "react";
import { Search, Filter, Download, RefreshCcw, FileText, Clock, CheckCircle, DollarSign, X, ListCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Topic } from "@/models/topic";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import TopicsFilter from "@/pages/admin/topics/TopicFilter";
import TopicsTable from "@/pages/admin/topics/TopicTable";
import { DepartmentService } from "@/service/department-service";
import { ResearchTypeService } from "@/service/research-type-service";
import { ResearchFieldService } from "@/service/research-field-service";
import { CategoryService } from "@/service/category-service";
import { TopicService } from "@/service/topic-service";
import { toast } from "@/hooks/use-toast";
import { Department } from "@/models/department";
import { ResearchType } from "@/models/research-type";
import { ResearchField } from "@/models/research-field";
import { Category } from "@/models/category";
import { getBadge, TopicStatus } from "@/models/enums/topic-status.enum";
import useDebounce from "@/hooks/use-debounce";
import { formatVND } from "@/utils/common";
import { useLocation, useNavigate } from "react-router-dom";
import useUserStore from "@/store/userStore";
import { Roles } from "@/models/enums/roles.enum";
import { RegistrationService } from "@/service/registration-service";
import { RegistrationPeriodStatus } from "@/models/enums/registration-period-status";
import AssignCategoryModal from "@/pages/admin/topics/manage/AssignCategoryModal";
import { RegistrationPeriod } from "@/models/registraion-period";

const TopicsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const user = useUserStore((state) => state.user);
    const roles = (user?.roles || []).map((role: { id: string; name: string }) => role.name);
    const isAdmin = roles.includes(Roles.ADMIN);
    const userEmail = user?.email || "";

    const params = new URLSearchParams(location.search);
    const initialPage = Number(params.get("p")) || 1;
    const initialSize = Number(params.get("s")) || 10;
    const initialQuery = params.get("q") || "";
    const initialStatus = (params.get("status") as TopicStatus) || TopicStatus.ALL;
    const initialSort = params.get("sort") || "createdAt";
    const initialOrder = params.get("order") || "desc";
    const initialDepartmentId = Number(params.get("departmentId")) || 0;
    const initialResearchTypeId = Number(params.get("researchTypeId")) || 0;
    const initialResearchFieldId = Number(params.get("researchFieldId")) || 0;
    const initialCategoryId = Number(params.get("categoryId")) || 0;
    const initialRegistrationPeriodId = params.get("periodId") || "";
    const initialStartDate = params.get("startDate") ? new Date(params.get("startDate")) : undefined;
    const initialEndDate = params.get("endDate") ? new Date(params.get("endDate")) : undefined;
    const initialMinBudget = Number(params.get("minBudget")) || undefined;
    const initialInvestigator = params.get("investigator") || "";

    const [searchTerm, setSearchTerm] = useState(initialQuery);
    const [showFilters, setShowFilters] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [researchTypes, setResearchTypes] = useState<ResearchType[]>([]);
    const [researchFields, setResearchFields] = useState<ResearchField[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [registrationPeriods, setRegistrationPeriods] = useState<RegistrationPeriod[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [totalItems, setTotalItems] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(initialSize);
    const [currentPage, setCurrentPage] = useState(initialPage);
    const [sortField, setSortField] = useState(initialSort);
    const [sortOrder, setSortOrder] = useState(initialOrder);
    const [statusFilter, setStatusFilter] = useState<TopicStatus | string>(initialStatus);
    const [departmentId, setDepartmentId] = useState(initialDepartmentId);
    const [researchTypeId, setResearchTypeId] = useState(initialResearchTypeId);
    const [researchFieldId, setResearchFieldId] = useState(initialResearchFieldId);
    const [categoryId, setCategoryId] = useState(initialCategoryId);
    const [registrationPeriodId, setRegistrationPeriodId] = useState(initialRegistrationPeriodId);
    const [startDate, setStartDate] = useState<Date | undefined>(initialStartDate);
    const [endDate, setEndDate] = useState<Date | undefined>(initialEndDate);
    const [minBudget, setMinBudget] = useState<number | undefined>(initialMinBudget);
    const [budgetDisplay, setBudgetDisplay] = useState<string>(formatVND(initialMinBudget));
    const [investigator, setInvestigator] = useState(initialInvestigator);
    const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
    const [selectedRows, setSelectedRows] = useState<any[]>([]);
    const [appliedFilters, setAppliedFilters] = useState<any>({
        status: initialStatus,
        departmentId: initialDepartmentId,
        researchTypeId: initialResearchTypeId,
        researchFieldId: initialResearchFieldId,
        categoryId: initialCategoryId,
        registrationPeriodId: initialRegistrationPeriodId,
        startDate: initialStartDate,
        endDate: initialEndDate,
        minBudget: initialMinBudget,
        investigator: initialInvestigator,
        searchTerm: initialQuery,
        currentPage: initialPage,
        itemsPerPage: initialSize,
        sortField: initialSort,
        sortOrder: initialOrder,
    });
    const [totalTopics, setTotalTopics] = useState(0);
    const [inProgressCount, setInProgressCount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [totalBudget, setTotalBudget] = useState(0);
    const [statusData, setStatusData] = useState<any[]>([]);
    const [departmentData, setDepartmentData] = useState<any[]>([]);
    const [isAssignCategoryModalOpen, setIsAssignCategoryModalOpen] = useState(false);

    const debouncedSearchQuery = useDebounce(searchTerm, 300);
    const statusColors: { [key in TopicStatus]: string } = {
        [TopicStatus.DRAFT]: "#6366F1",          // Indigo-500
        [TopicStatus.SUBMITTED]: "#3B82F6",      // Blue-500
        [TopicStatus.REVIEWED]: "#60A5FA",       // Blue-400
        [TopicStatus.NEED_REVISION]: "#F59E0B",  // Amber-500
        [TopicStatus.ASSIGNED]: "#EAB308",       // Yellow-500
        [TopicStatus.APPROVED]: "#22C55E",       // Green-500
        [TopicStatus.REJECTED]: "#EF4444",       // Red-500
        [TopicStatus.IN_CATALOG]: "#A855F7",     // Purple-500
        [TopicStatus.IN_PROGRESS]: "#06B6D4",    // Cyan-500
        [TopicStatus.COMPLETED]: "#10B981",      // Emerald-500
        [TopicStatus.CANCELLED]: "#EC4899",      // Pink-500
        [TopicStatus.DELETED]: "#6B7280",        // Gray-500
        [TopicStatus.ALL]: "#9CA3AF",            // Gray-400
    };

    // Lấy danh sách đề tài hợp lệ (SUBMITTED hoặc REVIEWED) để truyền vào modal
    const validSelectedTopicIds = selectedRows
        .filter(row => row.status === TopicStatus.SUBMITTED || row.status === TopicStatus.REVIEWED)
        .map(row => row.id);

    useEffect(() => {
        setBudgetDisplay(formatVND(minBudget));
    }, [minBudget]);

    useEffect(() => {
        setAppliedFilters((prev: any) => ({
            ...prev,
            searchTerm: debouncedSearchQuery,
            currentPage: 1,
        }));
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [departmentResponse, researchTypeResponse, researchFieldResponse, categoryResponse, registrationPeriodResponse, statisticsResponse] = await Promise.all([
                    DepartmentService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    ResearchTypeService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    ResearchFieldService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    CategoryService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "name",
                        order: "asc",
                        delFlag: false,
                    }),
                    RegistrationService.getAll({
                        p: 1,
                        s: 1000,
                        sort: "startDate",
                        order: "desc",
                        status: RegistrationPeriodStatus.OPEN,
                    }),
                    TopicService.getStatistics(),
                ]);

                setDepartments(departmentResponse.data.data);
                setResearchTypes(researchTypeResponse.data.data);
                setResearchFields(researchFieldResponse.data.data);
                setCategories(categoryResponse.data.data);
                setRegistrationPeriods(registrationPeriodResponse.data.data);

                // Update statistics
                setTotalTopics(statisticsResponse.data.totalTopics);
                setInProgressCount(statisticsResponse.data.inProgressCount);
                setCompletedCount(statisticsResponse.data.completedCount);
                setTotalBudget(statisticsResponse.data.totalBudget);

                const statusChartData = statisticsResponse.data.statusDistribution.map((item: any) => ({
                    name: getBadge(item.status),
                    value: item.count,
                    fill: statusColors[item.status] || "#8884d8",
                }));
                setStatusData(statusChartData);

                const departmentChartData = statisticsResponse.data.departmentDistribution.map((item: any) => ({
                    name: item.departmentName,
                    value: item.count,
                }));
                setDepartmentData(departmentChartData);
            } catch (error) {
                console.error("Lỗi khi lấy dữ liệu:", error);
                toast({
                    title: "Lỗi khi tải dữ liệu",
                    description: "Không thể tải dữ liệu. Vui lòng thử lại.",
                    variant: "error",
                });
                setDepartments([]);
                setResearchTypes([]);
                setResearchFields([]);
                setCategories([]);
                setRegistrationPeriods([]);
                setStatusData([]);
                setDepartmentData([]);
            } finally {
                setIsLoading(false);
            }
        };

        fetchData();
    }, []);

    const updateUrl = () => {
        const searchParams = new URLSearchParams();
        const params: Record<string, string | number | Date | undefined> = {
            p: currentPage,
            s: itemsPerPage,
            sort: sortField,
            order: sortOrder,
            q: searchTerm || undefined,
            status: statusFilter !== TopicStatus.ALL ? statusFilter : undefined,
            departmentId: departmentId !== 0 ? departmentId : undefined,
            researchTypeId: researchTypeId !== 0 ? researchTypeId : undefined,
            researchFieldId: researchFieldId !== 0 ? researchFieldId : undefined,
            categoryId: categoryId !== 0 ? categoryId : undefined,
            periodId: registrationPeriodId !== "" ? registrationPeriodId : undefined,
            startDate: startDate,
            endDate: endDate,
            minBudget: minBudget,
            investigator: investigator || undefined,
        };

        const basicFields = [
            "p",
            "s",
            "sort",
            "order",
            "q",
            "status",
        ];

        Object.entries(params).forEach(([key, value]) => {
            if (basicFields.includes(key) && value !== undefined && value !== "") {
                if (value instanceof Date) {
                    searchParams.set(key, value.toISOString().split("T")[0]);
                } else {
                    searchParams.set(key, value.toString());
                }
            }
        });

        navigate({ search: searchParams.toString() }, { replace: true });
    };

    const fetchTopics = async () => {
        setIsLoading(true);
        try {
            const params = {
                p: appliedFilters.currentPage,
                s: appliedFilters.itemsPerPage,
                sort: appliedFilters.sortField,
                order: appliedFilters.sortOrder,
                q: appliedFilters.searchTerm,
                status: appliedFilters.status !== TopicStatus.ALL ? appliedFilters.status : undefined,
                departmentId: appliedFilters.departmentId !== 0 ? appliedFilters.departmentId : undefined,
                researchTypeId: appliedFilters.researchTypeId !== 0 ? appliedFilters.researchTypeId : undefined,
                researchFieldId: appliedFilters.researchFieldId !== 0 ? appliedFilters.researchFieldId : undefined,
                categoryId: appliedFilters.categoryId !== 0 ? appliedFilters.categoryId : undefined,
                periodId: appliedFilters.registrationPeriodId !== "" ? appliedFilters.registrationPeriodId : undefined,
                startDate: appliedFilters.startDate ? appliedFilters.startDate.toISOString().split("T")[0] : undefined,
                endDate: appliedFilters.endDate ? appliedFilters.endDate.toISOString().split("T")[0] : undefined,
                minBudget: appliedFilters.minBudget,
                investigator: appliedFilters.investigator || undefined,
            };

            const response = isAdmin
                ? await TopicService.getAll(params)
                : await TopicService.getTopicByDepartment(userEmail, params);

            setTopics(response.data.data);
            setTotalItems(response.data.totalItems);
        } catch (error) {
            toast({
                title: "Có lỗi trong quá trình lấy dữ liệu!",
                description: "Không thể tải dữ liệu đề tài. Vui lòng thử lại sau.",
                variant: "error",
            });
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchTopics();
    }, [appliedFilters, isAdmin, userEmail]);

    useEffect(() => {
        updateUrl();
    }, [
        currentPage,
        itemsPerPage,
        searchTerm,
        statusFilter,
        sortField,
        sortOrder,
        departmentId,
        researchTypeId,
        researchFieldId,
        categoryId,
        registrationPeriodId,
        startDate,
        endDate,
        minBudget,
        investigator,
    ]);

    const handleFilter = (filters: any) => {
        setAppliedFilters((prev: any) => ({
            ...prev,
            status: filters.status || TopicStatus.ALL,
            departmentId: filters.department ? Number(filters.department) : 0,
            researchTypeId: filters.researchType ? Number(filters.researchType) : 0,
            researchFieldId: filters.researchField ? Number(filters.researchField) : 0,
            categoryId: filters.category ? Number(filters.category) : 0,
            registrationPeriodId: filters.registrationPeriodId || "",
            startDate: filters.startDate,
            endDate: filters.endDate,
            minBudget: filters.budget,
            investigator: filters.investigator || "",
            currentPage: 1,
        }));
        setStatusFilter(filters.status || TopicStatus.ALL);
        setDepartmentId(filters.department ? Number(filters.department) : 0);
        setResearchTypeId(filters.researchType ? Number(filters.researchType) : 0);
        setResearchFieldId(filters.researchField ? Number(filters.researchField) : 0);
        setCategoryId(filters.category ? Number(filters.category) : 0);
        setRegistrationPeriodId(filters.registrationPeriodId || "");
        setStartDate(filters.startDate);
        setEndDate(filters.endDate);
        setMinBudget(filters.budget);
        setInvestigator(filters.investigator || "");
        setCurrentPage(1);
        setShowFilters(false);
    };

    const handleClearFilters = () => {
        setStatusFilter(TopicStatus.ALL);
        setDepartmentId(0);
        setResearchTypeId(0);
        setResearchFieldId(0);
        setCategoryId(0);
        setRegistrationPeriodId("");
        setStartDate(undefined);
        setEndDate(undefined);
        setMinBudget(undefined);
        setInvestigator("");
        setSearchTerm("");
        setCurrentPage(1);
    };

    const handleExport = () => {
        console.log("Exporting data");
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearchTerm(e.target.value);
    };

    const handleSortChange = (field: string, order: string) => {
        setSortField(field);
        setSortOrder(order);
        setAppliedFilters((prev: any) => ({
            ...prev,
            sortField: field,
            sortOrder: order,
        }));
    };

    const handlePageChange = (pageNumber: number) => {
        setCurrentPage(pageNumber);
        setAppliedFilters((prev: any) => ({
            ...prev,
            currentPage: pageNumber,
        }));
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setItemsPerPage(newPageSize);
        setCurrentPage(1);
        setAppliedFilters((prev: any) => ({
            ...prev,
            itemsPerPage: newPageSize,
            currentPage: 1,
        }));
    };

    const handleSelectionChange = (keys: string[], rows: any[]) => {
        // Cho phép chọn tất cả mà không giới hạn trạng thái
        setSelectedRowKeys(keys);
        setSelectedRows(rows);
    };

    const handleClearSelection = () => {
        setSelectedRowKeys([]);
        setSelectedRows([]);
    };

    const handleRefresh = () => {
        fetchTopics();
    };

    const handleViewDetail = (topicId: string, status: TopicStatus): void => {
        navigate(`/admin/topics/${topicId}`);
    };

    const handleAssign = (topicId: string) => {
        navigate(`/admin/topics/assign/${topicId}`);
    };

    const handleReview = (topicId: string) => {
        navigate(`/admin/topics/initial-review/${topicId}`);
    };

    const handleCategoryAssigned = () => {
        fetchTopics(); // Refresh the topic list after assigning category
        handleClearSelection(); // Clear selection after assigning
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold">Quản lý đề tài nghiên cứu</h1>
                    <p className="text-sm text-muted-foreground">
                        Quản lý và theo dõi tiến độ các đề tài nghiên cứu khoa học.
                    </p>
                </div>
                <div>
                    <Button variant="default" className="flex items-center gap-2" onClick={handleRefresh}>
                        <RefreshCcw className="w-4 h-4" />
                    </Button>
                </div>
            </div>

            {/* Stats Cards */}
            <>
                {isAdmin && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card>
                            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tổng số đề tài
                                </CardTitle>
                                <div className="p-2 rounded-full bg-blue-100 text-blue-800">
                                    <FileText className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold">{totalTopics}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Đề tài đang thực hiện
                                </CardTitle>
                                <div className="p-2 rounded-full bg-amber-100 text-amber-800">
                                    <Clock className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Đề tài đã hoàn thành
                                </CardTitle>
                                <div className="p-2 rounded-full bg-green-100 text-green-800">
                                    <CheckCircle className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader className="pb-2 pt-4 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    Tổng kinh phí
                                </CardTitle>
                                <div className="p-2 rounded-full bg-purple-100 text-purple-800">
                                    <DollarSign className="h-4 w-4" />
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold text-purple-600">
                                    {formatVND(totalBudget)}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </>

            {/* Charts Section */}
            <>
                {isAdmin && (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Phân bố theo trạng thái</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={statusData}
                                            cx="50%"
                                            cy="50%"
                                            labelLine={true}
                                            outerRadius={90}
                                            fill="#8884d8"
                                            dataKey="value"
                                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                        >
                                            {statusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <Tooltip />
                                        <Legend
                                            layout="horizontal"
                                            align="center"
                                            verticalAlign="bottom"
                                            wrapperStyle={{ paddingTop: "10px", fontSize: "14px" }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Phân bố theo đơn vị</CardTitle>
                            </CardHeader>
                            <CardContent className="h-[300px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart
                                        data={departmentData}
                                        layout="vertical"
                                        margin={{ top: 5, right: 30, left: 0, bottom: 5 }}
                                    >
                                        <CartesianGrid strokeDasharray="3 3" />
                                        <XAxis type="number" />
                                        <YAxis
                                            type="category"
                                            dataKey="name"
                                            tick={{ fontSize: 12 }}
                                            width={140}
                                        />
                                        <Tooltip />
                                        <Bar dataKey="value" fill="#A78BFA" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>
                    </div>
                )}
            </>

            {/* Actions Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex items-center flex-1 gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                        <Input
                            placeholder="Tìm kiếm đề tài..."
                            className="pl-9"
                            value={searchTerm}
                            onChange={handleSearchChange}
                        />
                    </div>
                    <>
                        {isAdmin && (
                            <>
                                <Button
                                    variant="default"
                                    onClick={() => setShowFilters(!showFilters)}
                                >
                                    <Filter className="w-4 h-4" />
                                    Lọc
                                </Button>
                                {selectedRows.length > 0 && (
                                    <>
                                        <Button
                                            variant="default"
                                            className="bg-green-600 hover:bg-green-700"
                                            onClick={() => {
                                                toast({
                                                    title: "Thông báo",
                                                    description: "Chỉ những đề tài đã được duyệt mới có thể xác định danh mục.",
                                                    variant: "info",
                                                })
                                                setIsAssignCategoryModalOpen(true);
                                            }}
                                            disabled={validSelectedTopicIds.length === 0}
                                        >
                                            <ListCheck className="w-4 h-4" />
                                            Xác định danh mục
                                        </Button>
                                        <Button
                                            variant="outline"
                                            className="text-rose-500"
                                            onClick={handleClearSelection}
                                        >
                                            <X className="w-4 h-4" />
                                            Hủy chọn
                                        </Button>
                                    </>
                                )}
                            </>
                        )}
                    </>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4" />
                    Xuất file
                </Button>
            </div>

            {/* Filters panel */}
            {showFilters && (
                <div>
                    <TopicsFilter
                        onFilter={handleFilter}
                        onClearFilters={handleClearFilters}
                        departments={departments}
                        researchTypes={researchTypes}
                        researchFields={researchFields}
                        categories={categories}
                        registrationPeriods={registrationPeriods}
                        status={statusFilter}
                        setStatus={setStatusFilter}
                        department={departmentId ? String(departmentId) : ""}
                        setDepartment={(value) => setDepartmentId(value ? Number(value) : 0)}
                        researchType={researchTypeId ? String(researchTypeId) : ""}
                        setResearchType={(value) => setResearchTypeId(value ? Number(value) : 0)}
                        researchField={researchFieldId ? String(researchFieldId) : ""}
                        setResearchField={(value) => setResearchFieldId(value ? Number(value) : 0)}
                        category={categoryId ? String(categoryId) : ""}
                        setCategory={(value) => setCategoryId(value ? Number(value) : 0)}
                        registrationPeriodId={registrationPeriodId}
                        setRegistrationPeriod={(value) => setRegistrationPeriodId(value ? value : "")}
                        startDate={startDate}
                        setStartDate={setStartDate}
                        endDate={endDate}
                        setEndDate={setEndDate}
                        budget={minBudget}
                        setBudget={setMinBudget}
                        budgetDisplay={budgetDisplay}
                        setBudgetDisplay={setBudgetDisplay}
                        investigator={investigator}
                        setInvestigator={setInvestigator}
                    />
                </div>
            )}

            {/* Table */}
            <div className="rounded-md border p-4">
                <TopicsTable
                    topics={topics}
                    totalItems={totalItems}
                    itemsPerPage={itemsPerPage}
                    currentPage={currentPage}
                    loading={isLoading}
                    selectedRowKeys={selectedRowKeys}
                    selectedRows={selectedRows}
                    onPageChange={handlePageChange}
                    onPageSizeChange={handlePageSizeChange}
                    onSortChange={handleSortChange}
                    onSelectionChange={handleSelectionChange}
                    onViewDetail={handleViewDetail}
                    onAssign={handleAssign}
                    onReview={handleReview}
                />
            </div>

            {/* Assign Category Modal */}
            <AssignCategoryModal
                open={isAssignCategoryModalOpen}
                onOpenChange={setIsAssignCategoryModalOpen}
                categories={categories}
                selectedTopicIds={validSelectedTopicIds}
                selectedTopics={selectedRows.filter(row => row.status === TopicStatus.SUBMITTED || row.status === TopicStatus.REVIEWED)}
                onCategoryAssigned={handleCategoryAssigned}
            />
        </div>
    );
};

export default TopicsPage;