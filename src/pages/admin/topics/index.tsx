import { useEffect, useState } from "react";
import { Search, Filter, Download, RefreshCcw } from "lucide-react";
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
import { TopicStatus } from "@/models/enums/topic-status.enum";
import useDebounce from "@/hooks/use-debounce";
import { formatVND } from "@/utils/common";
import { useLocation, useNavigate } from "react-router-dom";

const TopicsPage = () => {
    const location = useLocation();
    const navigate = useNavigate();

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

    const debouncedSearchQuery = useDebounce(searchTerm, 300);

    // Map status to Vietnamese names
    const statusNameMap: { [key: string]: string } = {
        DRAFT: "Nháp",
        SUBMITTED: "Đã nộp",
        PENDING_REVIEW: "Chờ xét duyệt",
        APPROVED: "Đã phê duyệt",
        REJECTED: "Từ chối",
        FUNDED: "Đã cấp kinh phí",
        IN_PROGRESS: "Đang thực hiện",
        COMPLETED: "Hoàn thành",
    };

    // Colors for status chart
    const statusColors: { [key: string]: string } = {
        DRAFT: "#CBD5E1",
        SUBMITTED: "#93C5FD",
        PENDING_REVIEW: "#60A5FA",
        APPROVED: "#34D399",
        REJECTED: "#FCA5A5",
        FUNDED: "#A5B4FC",
        IN_PROGRESS: "#818CF8",
        COMPLETED: "#86EFAC",
    };

    // Sync budgetDisplay with minBudget
    useEffect(() => {
        setBudgetDisplay(formatVND(minBudget));
    }, [minBudget]);

    // Update appliedFilters when debounced search term changes
    useEffect(() => {
        setAppliedFilters((prev: any) => ({
            ...prev,
            searchTerm: debouncedSearchQuery,
            currentPage: 1,
        }));
        setCurrentPage(1);
    }, [debouncedSearchQuery]);

    // Fetch departments, research types, fields, categories, and statistics
    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [departmentResponse, researchTypeResponse, researchFieldResponse, categoryResponse, statisticsResponse] = await Promise.all([
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
                    TopicService.getStatistics(),
                ]);

                setDepartments(departmentResponse.data.data);
                setResearchTypes(researchTypeResponse.data.data);
                setResearchFields(researchFieldResponse.data.data);
                setCategories(categoryResponse.data.data);

                // Update statistics
                setTotalTopics(statisticsResponse.data.totalTopics);
                setInProgressCount(statisticsResponse.data.inProgressCount);
                setCompletedCount(statisticsResponse.data.completedCount);
                setTotalBudget(statisticsResponse.data.totalBudget);

                // Map status distribution to chart format
                const statusChartData = statisticsResponse.data.statusDistribution.map(item => ({
                    name: statusNameMap[item.status] || item.status,
                    value: item.count,
                    fill: statusColors[item.status] || "#8884d8",
                }));
                setStatusData(statusChartData);

                const departmentChartData = statisticsResponse.data.departmentDistribution.map(item => ({
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
            q: searchTerm,
            status: statusFilter !== TopicStatus.ALL ? statusFilter : undefined,
            departmentId: departmentId !== 0 ? departmentId : undefined,
            researchTypeId: researchTypeId !== 0 ? researchTypeId : undefined,
            researchFieldId: researchFieldId !== 0 ? researchFieldId : undefined,
            categoryId: categoryId !== 0 ? categoryId : undefined,
            startDate,
            endDate,
            minBudget,
            investigator: investigator || undefined,
        };

        Object.entries(params).forEach(([key, value]) => {
            if (value !== undefined && value !== "") {
                if (value instanceof Date) {
                    searchParams.set(key, value.toISOString().split("T")[0]);
                } else {
                    searchParams.set(key, value.toString());
                }
            }
        });

        navigate({ search: searchParams.toString() }, { replace: true });
    };

    // Fetch topics based on applied filters
    const fetchTopics = async () => {
        setIsLoading(true);
        try {
            const response = await TopicService.getAll({
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
                startDate: appliedFilters.startDate ? appliedFilters.startDate.toISOString().split("T")[0] : undefined,
                endDate: appliedFilters.endDate ? appliedFilters.endDate.toISOString().split("T")[0] : undefined,
                minBudget: appliedFilters.minBudget,
                investigator: appliedFilters.investigator || undefined,
            });

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

    // Trigger fetchTopics when appliedFilters change
    useEffect(() => {
        fetchTopics();
    }, [appliedFilters]);

    // Update URL when filter state changes
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
        setSelectedRowKeys(keys);
        setSelectedRows(rows);
    };

    const handleRefresh = () => {
        fetchTopics();
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng số đề tài
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalTopics}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đề tài đang thực hiện
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-blue-600">{inProgressCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Đề tài đã hoàn thành
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-600">{completedCount}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Tổng kinh phí
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-purple-600">
                            {formatVND(totalBudget)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Charts Section */}
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
                                    labelLine={false}
                                    outerRadius={100}
                                    fill="#8884d8"
                                    dataKey="value"
                                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                >
                                    {statusData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
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
                            <BarChart data={departmentData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name" />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Bar dataKey="value" name="Số đề tài" fill="#8884d8" />
                            </BarChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>
            </div>

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
                    <Button
                        variant="outline"
                        onClick={() => setShowFilters(!showFilters)}
                        className={showFilters ? "bg-blue-50" : ""}
                    >
                        <Filter className="w-4 h-4" />
                        Lọc
                    </Button>
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
                />
            </div>
        </div>
    );
};

export default TopicsPage;