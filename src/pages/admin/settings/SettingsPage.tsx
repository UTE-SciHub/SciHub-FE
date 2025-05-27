import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    FileText,
    Pencil,
    Trash2,
    Download,
    MoreHorizontal,
    Loader2,
    Filter,
    FileIcon,
    Table as TableIcon,
    Grid,
    ChevronDown
} from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import TemplateManagementForm from "./TemplateManagementForm";
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import TemplateListPage from "./TemplateListPage";

// Define the Template interface
interface Template {
    id: string;
    code: string;
    name: string;
    description?: string;
    fileUrl?: string;
    fileType?: string;
    createdAt: string;
}

const SettingsPage = () => {
    const [activeTab, setActiveTab] = useState("templates");
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [loading, setLoading] = useState(false);
    const [templates, setTemplates] = useState<Template[]>([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
    const [filterType, setFilterType] = useState<string>("all");
    const itemsPerPage = viewMode === "grid" ? 9 : 10;

    // Mock templates data with file types
    const mockTemplates: Template[] = [
        {
            id: "1",
            code: "R01",
            name: "Đề xuất",
            description: "Đề xuất đề tài KHCN, đề xuất đề án khoa học, đề xuất dự án sản xuất thử nghiệm",
            fileUrl: "/templates/R01.docx",
            fileType: "docx",
            createdAt: "2023-05-15T10:30:00Z"
        },
        {
            id: "2",
            code: "R02",
            name: "Thuyết minh",
            description: "Thuyết minh đề tài KHCN, thuyết minh đề án khoa học, thuyết minh dự án sản xuất thử nghiệm",
            fileUrl: "/templates/R02.docx",
            fileType: "docx",
            createdAt: "2023-05-16T11:20:00Z"
        },
        {
            id: "3",
            code: "R03",
            name: "Hợp đồng",
            description: "Hợp đồng đề tài cấp ĐHQG-HCM loại A, B, C và hợp đồng đề án khoa học, hợp đồng dự án sản xuất thử nghiệm",
            fileUrl: "/templates/R03.docx",
            fileType: "docx",
            createdAt: "2023-05-17T09:15:00Z"
        },
        {
            id: "4",
            code: "R04",
            name: "Kèm theo thuyết minh",
            description: "Dự toán đề tài, Lý lịch khoa học, Xác nhận phối hợp thực hiện, Giải trình hoàn thiện hồ sơ, Biên bản kiểm tra hồ sơ đang ký giao nhiệm vụ",
            fileUrl: "/templates/R04.pdf",
            fileType: "pdf",
            createdAt: "2023-05-18T14:30:00Z"
        },
        {
            id: "5",
            code: "R05",
            name: "Báo cáo tiến độ",
            description: "Báo cáo tiến độ thực hiện đề tài KHCN",
            fileUrl: "/templates/R05.xlsx",
            fileType: "xlsx",
            createdAt: "2023-05-19T16:45:00Z"
        }
    ];

    // Get file icon based on file type
    const getFileIcon = (fileType?: string) => {
        switch (fileType) {
            case 'docx':
            case 'doc':
                return <FileText className="h-10 w-10 text-blue-500" />;
            case 'pdf':
                return <FileText className="h-10 w-10 text-red-500" />;
            case 'xlsx':
            case 'xls':
                return <FileText className="h-10 w-10 text-green-500" />;
            default:
                return <FileIcon className="h-10 w-10 text-gray-500" />;
        }
    };

    // Get file type badge
    const getFileTypeBadge = (fileType?: string) => {
        switch (fileType) {
            case 'docx':
            case 'doc':
                return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Word</Badge>;
            case 'pdf':
                return <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">PDF</Badge>;
            case 'xlsx':
            case 'xls':
                return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Excel</Badge>;
            default:
                return <Badge variant="outline">Unknown</Badge>;
        }
    };

    // Fetch templates
    useEffect(() => {
        const fetchTemplates = async () => {
            setLoading(true);
            try {
                // In a real application, this would be an API call
                // For now, we'll use the mock data
                await new Promise(resolve => setTimeout(resolve, 500));

                let filteredTemplates = [...mockTemplates];

                // Apply search filter
                if (searchQuery) {
                    filteredTemplates = filteredTemplates.filter(template =>
                        template.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (template.description && template.description.toLowerCase().includes(searchQuery.toLowerCase()))
                    );
                }

                // Apply type filter
                if (filterType !== "all") {
                    filteredTemplates = filteredTemplates.filter(template =>
                        template.fileType === filterType
                    );
                }

                setTemplates(filteredTemplates);
                setTotalPages(Math.ceil(filteredTemplates.length / itemsPerPage));

                // Reset to page 1 if current page exceeds total pages
                if (currentPage > Math.ceil(filteredTemplates.length / itemsPerPage)) {
                    setCurrentPage(1);
                }
            } catch (error) {
                console.error("Error fetching templates:", error);
                toast({
                    title: "Lỗi",
                    description: "Không thể tải danh sách biểu mẫu. Vui lòng thử lại sau.",
                    variant: "error",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [searchQuery, filterType, itemsPerPage, currentPage]);

    const handleAddTemplate = () => {
        setIsAddModalOpen(true);
    };

    const handleEditTemplate = (template: Template) => {
        setSelectedTemplate(template);
        setIsEditModalOpen(true);
    };

    const handleDeleteTemplate = (template: Template) => {
        setSelectedTemplate(template);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteTemplate = async () => {
        if (!selectedTemplate) return;

        try {
            // In a real application, this would be an API call
            await new Promise(resolve => setTimeout(resolve, 500));

            // Filter out the deleted template
            setTemplates(prev => prev.filter(t => t.id !== selectedTemplate.id));

            toast({
                title: "Xóa thành công",
                description: `Biểu mẫu "${selectedTemplate.name}" đã được xóa.`,
                variant: "success",
            });
        } catch (error) {
            console.error("Error deleting template:", error);
            toast({
                title: "Lỗi",
                description: "Không thể xóa biểu mẫu. Vui lòng thử lại sau.",
                variant: "error",
            });
        } finally {
            setIsDeleteDialogOpen(false);
            setSelectedTemplate(null);
        }
    };

    const handleDownloadTemplate = (template: Template) => {
        // In a real application, this would trigger a file download
        toast({
            title: "Đang tải xuống",
            description: `Đang tải xuống biểu mẫu "${template.name}"`,
            variant: "success",
        });
    };

    const handleTemplateAdded = () => {
        // Refresh the template list
        // In a real application, you would refetch the data
        toast({
            title: "Thành công",
            description: "Biểu mẫu đã được cập nhật.",
            variant: "success",
        });
    };

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    const toggleViewMode = () => {
        setViewMode(prev => prev === "grid" ? "table" : "grid");
        setCurrentPage(1);
    };

    // Get current templates for pagination
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentTemplates = templates.slice(indexOfFirstItem, indexOfLastItem);

    // Generate page numbers
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
    }

    // Render grid view
    const renderGridView = () => {
        if (loading) {
            return (
                <div className="flex justify-center items-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin mr-2" />
                    <span>Đang tải dữ liệu...</span>
                </div>
            );
        }

        if (currentTemplates.length === 0) {
            return (
                <div className="text-center py-20 text-muted-foreground">
                    Không tìm thấy biểu mẫu nào
                </div>
            );
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                {currentTemplates.map((template) => (
                    <Card key={template.id} className="overflow-hidden hover:shadow-md transition-shadow">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start">
                                <div className="flex items-center space-x-2">
                                    <Badge variant="secondary" className="text-xs font-medium">
                                        {template.code}
                                    </Badge>
                                    {getFileTypeBadge(template.fileType)}
                                </div>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <span className="sr-only">Mở menu</span>
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                                            <Download className="mr-2 h-4 w-4" />
                                            <span>Tải xuống</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                            <Pencil className="mr-2 h-4 w-4" />
                                            <span>Chỉnh sửa</span>
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem
                                            onClick={() => handleDeleteTemplate(template)}
                                            className="text-red-600"
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" />
                                            <span>Xóa</span>
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                            <CardTitle className="text-lg mt-2">{template.name}</CardTitle>
                        </CardHeader>
                        <CardContent className="pb-3">
                            <div className="flex items-center justify-center py-4">
                                {getFileIcon(template.fileType)}
                            </div>
                            <p className="text-sm text-muted-foreground line-clamp-2">
                                {template.description}
                            </p>
                        </CardContent>
                        <CardFooter className="flex justify-between pt-0 pb-4">
                            <div className="text-xs text-muted-foreground">
                                {new Date(template.createdAt).toLocaleDateString('vi-VN')}
                            </div>
                            <Button variant="outline" size="sm" onClick={() => handleDownloadTemplate(template)}>
                                <Download className="h-4 w-4 mr-1" /> Tải xuống
                            </Button>
                        </CardFooter>
                    </Card>
                ))}
            </div>
        );
    };

    // Render table view
    const renderTableView = () => {
        return (
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[80px]">STT</TableHead>
                            <TableHead className="w-[100px]">Ký hiệu biểu mẫu</TableHead>
                            <TableHead className="w-[250px]">Tên biểu mẫu</TableHead>
                            <TableHead>Mô tả</TableHead>
                            <TableHead className="w-[100px]">Loại tệp</TableHead>
                            <TableHead className="w-[120px]">Ngày tạo</TableHead>
                            <TableHead className="w-[100px] text-right">Thao tác</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    <div className="flex justify-center items-center">
                                        <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                        <span>Đang tải dữ liệu...</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : currentTemplates.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-10">
                                    Không tìm thấy biểu mẫu nào
                                </TableCell>
                            </TableRow>
                        ) : (
                            currentTemplates.map((template, index) => (
                                <TableRow key={template.id}>
                                    <TableCell>{indexOfFirstItem + index + 1}</TableCell>
                                    <TableCell className="font-medium">{template.code}</TableCell>
                                    <TableCell>{template.name}</TableCell>
                                    <TableCell className="max-w-md truncate">
                                        {template.description}
                                    </TableCell>
                                    <TableCell>
                                        {getFileTypeBadge(template.fileType)}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(template.createdAt).toLocaleDateString('vi-VN')}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Mở menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => handleDownloadTemplate(template)}>
                                                    <Download className="mr-2 h-4 w-4" />
                                                    <span>Tải xuống</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleEditTemplate(template)}>
                                                    <Pencil className="mr-2 h-4 w-4" />
                                                    <span>Chỉnh sửa</span>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    onClick={() => handleDeleteTemplate(template)}
                                                    className="text-red-600"
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    <span>Xóa</span>
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold mb-6">Cài đặt hệ thống</h1>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="mb-4">
                    <TabsTrigger value="templates">Quản lý biểu mẫu</TabsTrigger>
                    <TabsTrigger value="general">Cài đặt chung</TabsTrigger>
                    <TabsTrigger value="notifications">Thông báo</TabsTrigger>
                    <TabsTrigger value="catalog">Danh mục biểu mẫu</TabsTrigger>
                </TabsList>

                <TabsContent value="templates">
                    <Card>
                        <CardHeader>
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <CardTitle>Danh mục các biểu mẫu</CardTitle>
                                    <CardDescription>Quản lý các biểu mẫu được sử dụng trong hệ thống.</CardDescription>
                                </div>
                                <Button onClick={handleAddTemplate}>
                                    <Plus className="mr-2 h-4 w-4" />
                                    Thêm biểu mẫu
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                                <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                    <div className="relative w-full sm:w-72">
                                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Tìm kiếm biểu mẫu..."
                                            className="pl-8"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Select value={filterType} onValueChange={setFilterType}>
                                            <SelectTrigger className="w-[180px]">
                                                <div className="flex items-center">
                                                    <Filter className="h-4 w-4 mr-2" />
                                                    <SelectValue placeholder="Loại tệp" />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">Tất cả loại tệp</SelectItem>
                                                <SelectItem value="docx">Word (.docx)</SelectItem>
                                                <SelectItem value="pdf">PDF (.pdf)</SelectItem>
                                                <SelectItem value="xlsx">Excel (.xlsx)</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                                <div className="flex items-center">
                                    <Button variant="outline" size="sm" onClick={toggleViewMode}>
                                        {viewMode === "grid" ? (
                                            <>
                                                <TableIcon className="h-4 w-4 mr-2" />
                                                Xem dạng bảng
                                            </>
                                        ) : (
                                            <>
                                                <Grid className="h-4 w-4 mr-2" />
                                                Xem dạng lưới
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>

                            {viewMode === "grid" ? renderGridView() : renderTableView()}

                            {totalPages > 1 && (
                                <div className="mt-6 flex justify-center">
                                    <Pagination>
                                        <PaginationContent>
                                            <PaginationItem>
                                                <PaginationPrevious
                                                    onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                                                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>

                                            {pageNumbers.map(number => (
                                                <PaginationItem key={number}>
                                                    <PaginationLink
                                                        isActive={currentPage === number}
                                                        onClick={() => handlePageChange(number)}
                                                    >
                                                        {number}
                                                    </PaginationLink>
                                                </PaginationItem>
                                            ))}

                                            <PaginationItem>
                                                <PaginationNext
                                                    onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                                                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                                                />
                                            </PaginationItem>
                                        </PaginationContent>
                                    </Pagination>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="general">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt chung</CardTitle>
                            <CardDescription>Quản lý các cài đặt chung của hệ thống.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Tính năng đang được phát triển.</p>
                        </CardContent>
                    </Card>
                </TabsContent>

                <TabsContent value="notifications">
                    <Card>
                        <CardHeader>
                            <CardTitle>Cài đặt thông báo</CardTitle>
                            <CardDescription>Quản lý các cài đặt thông báo của hệ thống.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Tính năng đang được phát triển.</p>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="catalog">
                    <TemplateListPage />
                </TabsContent>
            </Tabs>

            {/* Add Template Modal */}
            <TemplateManagementForm
                open={isAddModalOpen}
                onOpenChange={setIsAddModalOpen}
                onTemplateAdded={handleTemplateAdded}
            />

            {/* Edit Template Modal */}
            <TemplateManagementForm
                open={isEditModalOpen}
                onOpenChange={setIsEditModalOpen}
                onTemplateAdded={handleTemplateAdded}
                editTemplate={selectedTemplate}
            />

            {/* Delete Confirmation Dialog */}
            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Xác nhận xóa biểu mẫu</AlertDialogTitle>
                        <AlertDialogDescription>
                            Bạn có chắc chắn muốn xóa biểu mẫu "{selectedTemplate?.name}"?
                            Hành động này không thể hoàn tác.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Hủy</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmDeleteTemplate} className="bg-red-600 hover:bg-red-700">
                            Xóa
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default SettingsPage;