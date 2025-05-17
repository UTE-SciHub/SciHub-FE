import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import {
    ArrowLeft,
    CheckCircle,
    XCircle,
    Edit,
    Send,
    FileText,
    AlertCircle,
    Search,
    Eye,
    MoreHorizontal,
} from "lucide-react"
import type { Topic } from "@/models/topic"
import { toast } from "@/hooks/use-toast"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Textarea } from "@/components/ui/textarea"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { TopicService } from "@/service/topic-service"
import Loading from "@/components/loading/loading"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { TopicStatus } from "@/models/enums/topic-status.enum"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { getInitialsAvt } from "@/utils/common"

// Schema cho việc xác định danh mục đề tài
const evaluateSchema = z
    .object({
        status: z.enum([TopicStatus.APPROVED, TopicStatus.REJECTED, TopicStatus.NEED_REVISION], {
            message: "Vui lòng chọn trạng thái danh mục",
        }),
        notes: z.string().optional(),
    })
    .refine(
        (data) =>
            data.status !== TopicStatus.NEED_REVISION ||
            (data.status === TopicStatus.NEED_REVISION && data.notes && data.notes.length > 0),
        {
            message: "Vui lòng nhập lý do cần chỉnh sửa",
            path: ["notes"],
        },
    )

type EvaluateFormValues = z.infer<typeof evaluateSchema>

export default function EvaluateTopicPage() {
    const [topics, setTopics] = useState<Topic[]>([])
    const [filteredTopics, setFilteredTopics] = useState<Topic[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null)
    const [isEvaluateDialogOpen, setIsEvaluateDialogOpen] = useState(false)
    const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
    const [isConfirmPublishOpen, setIsConfirmPublishOpen] = useState(false)
    const [activeTab, setActiveTab] = useState("all")
    const navigate = useNavigate()

    const form = useForm<EvaluateFormValues>({
        resolver: zodResolver(evaluateSchema),
        defaultValues: {
            status: TopicStatus.APPROVED,
            notes: "",
        },
    })

    const fetchTopics = async () => {
        try {
            const response = await TopicService.getAll({
                status: TopicStatus.REVIEWED,
                p: 1,
                s: 100,
                sort: "createdAt",
                order: "desc",
            })
            if (response.status === 200 && response.data.code === 1000) {
                setTopics(response.data.data)
                setFilteredTopics(response.data.data)
            } else {
                toast({
                    title: "Lỗi khi tải danh sách đề tài",
                    description: response.data.message || "Không thể tải danh sách đề tài. Vui lòng thử lại.",
                    variant: "error",
                })
            }
        } catch (error) {
            console.error("Lỗi khi lấy danh sách đề tài:", error)
            toast({
                title: "Lỗi khi tải danh sách đề tài",
                description: "Không thể tải danh sách đề tài. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchTopics()
    }, [])

    useEffect(() => {
        filterTopics()
    }, [searchQuery, topics, activeTab])

    const filterTopics = () => {
        let filtered = [...topics]

        // Lọc theo tab
        if (activeTab === "approved") {
            filtered = filtered.filter((topic) => topic.status === TopicStatus.APPROVED)
        } else if (activeTab === "rejected") {
            filtered = filtered.filter((topic) => topic.status === TopicStatus.REJECTED)
        } else if (activeTab === "needRevision") {
            filtered = filtered.filter((topic) => topic.status === TopicStatus.NEED_REVISION)
        } else if (activeTab === "pending") {
            filtered = filtered.filter((topic) => !topic.status)
        }

        // Lọc theo từ khóa tìm kiếm
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase()
            filtered = filtered.filter(
                (topic) =>
                    topic.vietnameseName?.toLowerCase().includes(query) ||
                    topic.englishName?.toLowerCase().includes(query) ||
                    topic.topicCode?.toLowerCase().includes(query) ||
                    topic.principalInvestigator?.toLowerCase().includes(query),
            )
        }

        setFilteredTopics(filtered)
    }

    const openEvaluateDialog = (topic: Topic) => {
        setSelectedTopic(topic)
        // Đặt giá trị mặc định cho form dựa trên trạng thái hiện tại của đề tài
        form.reset({
            status: (topic.status as EvaluateFormValues["status"]) || TopicStatus.APPROVED,
            notes: topic.additionalNotes || "",
        })
        setIsEvaluateDialogOpen(true)
    }

    const openViewDialog = (topic: Topic) => {
        setSelectedTopic(topic)
        setIsViewDialogOpen(true)
    }

    const onSubmit = async (data: EvaluateFormValues) => {
        if (!selectedTopic) return

        setIsLoading(true)
        try {
            // Mô phỏng API call
            setTimeout(() => {
                // Cập nhật trạng thái đề tài trong state
                const updatedTopics = topics.map((topic) => {
                    if (topic.id === selectedTopic.id) {
                        return {
                            ...topic,
                            status: data.status,
                            notes: data.notes || "",
                        }
                    }
                    return topic
                })

                setTopics(updatedTopics)
                setIsEvaluateDialogOpen(false)
                toast({
                    title: "Xác định danh mục thành công",
                    description: `Đề tài đã được phân loại: ${data.status === TopicStatus.APPROVED
                        ? "Đạt"
                        : data.status === TopicStatus.REJECTED
                            ? "Không đạt"
                            : "Cần chỉnh sửa"
                        }`,
                })
                setIsLoading(false)
            }, 500)

            // Uncomment khi có API thực tế
            // const response = await TopicService.evaluateTopic(selectedTopic.id, {
            //   status: data.status,
            //   notes: data.notes || "",
            // });
            // if (response.status === 200 && response.data.code === 1000) {
            //   toast({
            //     title: "Xác định danh mục thành công",
            //     description: `Đề tài đã được phân loại: ${data.status === TopicStatus.APPROVED ? "Đạt" : data.status === TopicStatus.REJECTED ? "Không đạt" : "Cần chỉnh sửa"}`,
            //   });
            //   fetchTopics();
            //   setIsEvaluateDialogOpen(false);
            // } else {
            //   toast({
            //     title: "Xác định danh mục thất bại",
            //     description: response.data.message || "Đã xảy ra lỗi khi xác định danh mục đề tài.",
            //     variant: "error",
            //   });
            // }
        } catch (error) {
            console.error("Lỗi khi xác định danh mục đề tài:", error)
            toast({
                title: "Không thể xác định danh mục",
                description: "Đã xảy ra lỗi khi xác định danh mục đề tài. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handlePublishCategories = async () => {
        setIsConfirmPublishOpen(false)
        setIsLoading(true)
        try {
            // Mô phỏng API call
            setTimeout(() => {
                toast({
                    title: "Gửi danh mục thành công",
                    description: "Danh mục đề tài đã được gửi đến các đơn vị và CNĐT.",
                })
                navigate("/admin/topics")
                setIsLoading(false)
            }, 1000)

            // Uncomment khi có API thực tế
            // const response = await TopicService.publishCategories();
            // if (response.status === 200 && response.data.code === 1000) {
            //   toast({
            //     title: "Gửi danh mục thành công",
            //     description: "Danh mục đề tài đã được gửi đến các đơn vị và CNĐT.",
            //   });
            //   navigate("/admin/topics");
            // } else {
            //   toast({
            //     title: "Gửi danh mục thất bại",
            //     description: response.data.message || "Đã xảy ra lỗi khi gửi danh mục đề tài.",
            //     variant: "error",
            //   });
            // }
        } catch (error) {
            console.error("Lỗi khi gửi danh mục đề tài:", error)
            toast({
                title: "Không thể gửi danh mục",
                description: "Đã xảy ra lỗi khi gửi danh mục đề tài. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const handleBack = () => {
        navigate("/admin/topics")
    }

    const getCategoryStatusBadge = (status: string | undefined) => {
        if (!status) {
            return (
                <Badge variant="outline" className="bg-gray-100 text-gray-800">
                    Chưa xác định
                </Badge>
            )
        }

        switch (status) {
            case TopicStatus.APPROVED:
                return <Badge className="bg-green-100 text-green-800 border-green-200">Đạt</Badge>
            case TopicStatus.REJECTED:
                return <Badge className="bg-red-100 text-red-800 border-red-200">Không đạt</Badge>
            case TopicStatus.NEED_REVISION:
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Cần chỉnh sửa</Badge>
            default:
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Chưa xác định
                    </Badge>
                )
        }
    }

    const getTabCounts = () => {
        const approved = topics.filter((topic) => topic.status === TopicStatus.APPROVED).length
        const rejected = topics.filter((topic) => topic.status === TopicStatus.REJECTED).length
        const needRevision = topics.filter((topic) => topic.status === TopicStatus.NEED_REVISION).length
        const pending = topics.filter((topic) => !topic.status).length

        return { approved, rejected, needRevision, pending, all: topics.length }
    }

    const tabCounts = getTabCounts()

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Xác định danh mục đề tài</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Phòng QLKH&HTQT xác định danh mục đề tài và gửi về các đơn vị, CNĐT
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={handleBack} className="flex items-center gap-2">
                        <ArrowLeft className="h-4 w-4" />
                        Quay lại danh sách
                    </Button>
                    <Button
                        onClick={() => setIsConfirmPublishOpen(true)}
                        className="bg-green-600 hover:bg-green-700 text-white"
                        disabled={topics.some((topic) => !topic.status) || topics.length === 0}
                    >
                        <Send className="mr-2 h-4 w-4" />
                        Gửi danh mục
                    </Button>
                </div>
            </div>

            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                        placeholder="Tìm kiếm đề tài..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <Select defaultValue="all">
                    <SelectTrigger className="w-full sm:w-[180px]">
                        <SelectValue placeholder="Lọc theo trạng thái" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">Tất cả trạng thái</SelectItem>
                        <SelectItem value="approved">Đạt</SelectItem>
                        <SelectItem value="rejected">Không đạt</SelectItem>
                        <SelectItem value="needRevision">Cần chỉnh sửa</SelectItem>
                        <SelectItem value="pending">Chưa xác định</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid grid-cols-5 mb-4">
                    <TabsTrigger value="all" className="data-[state=active]:bg-gray-100">
                        Tất cả
                        <Badge variant="secondary" className="ml-2">
                            {tabCounts.all}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="pending" className="data-[state=active]:bg-gray-100">
                        Chưa xác định
                        <Badge variant="secondary" className="ml-2">
                            {tabCounts.pending}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="approved" className="data-[state=active]:bg-green-100 data-[state=active]:text-green-800">
                        Đạt
                        <Badge variant="secondary" className="ml-2 bg-green-200 text-green-800">
                            {tabCounts.approved}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger value="rejected" className="data-[state=active]:bg-red-100 data-[state=active]:text-red-800">
                        Không đạt
                        <Badge variant="secondary" className="ml-2 bg-red-200 text-red-800">
                            {tabCounts.rejected}
                        </Badge>
                    </TabsTrigger>
                    <TabsTrigger
                        value="needRevision"
                        className="data-[state=active]:bg-yellow-100 data-[state=active]:text-yellow-800"
                    >
                        Cần chỉnh sửa
                        <Badge variant="secondary" className="ml-2 bg-yellow-200 text-yellow-800">
                            {tabCounts.needRevision}
                        </Badge>
                    </TabsTrigger>
                </TabsList>

                <TabsContent value={activeTab} className="mt-0">
                    {/* Topics List */}
                    <Card className="shadow-sm border border-gray-200">
                        <CardHeader className="bg-gray-50 border-b border-gray-200">
                            <div className="flex justify-between items-center">
                                <div>
                                    <CardTitle className="text-xl font-semibold text-gray-900">Danh sách đề tài</CardTitle>
                                    <CardDescription className="text-sm text-muted-foreground">
                                        {filteredTopics.length} đề tài được hiển thị
                                    </CardDescription>
                                </div>
                                <TooltipProvider>
                                    <Tooltip>
                                        <TooltipTrigger asChild>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => fetchTopics()}
                                                className="flex items-center gap-1"
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="16"
                                                    height="16"
                                                    viewBox="0 0 24 24"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth="2"
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    className="h-4 w-4"
                                                >
                                                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                                                    <path d="M3 3v5h5" />
                                                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                                                    <path d="M16 21h5v-5" />
                                                </svg>
                                                Làm mới
                                            </Button>
                                        </TooltipTrigger>
                                        <TooltipContent>
                                            <p>Làm mới danh sách đề tài</p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {filteredTopics.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy đề tài</h3>
                                    <p className="text-gray-500 max-w-md text-center mb-4">
                                        {searchQuery
                                            ? "Không tìm thấy đề tài phù hợp với từ khóa tìm kiếm."
                                            : "Không có đề tài nào cần xác định danh mục."}
                                    </p>
                                    {searchQuery && (
                                        <Button variant="outline" onClick={() => setSearchQuery("")}>
                                            Xóa bộ lọc
                                        </Button>
                                    )}
                                </div>
                            ) : (
                                <Table>
                                    <TableHeader className="bg-gray-50">
                                        <TableRow>
                                            <TableHead className="w-[50px]">#</TableHead>
                                            <TableHead>Tên đề tài</TableHead>
                                            <TableHead className="w-[200px]">Người đăng ký</TableHead>
                                            <TableHead className="w-[150px]">Trạng thái danh mục</TableHead>
                                            <TableHead className="w-[120px] text-right">Thao tác</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {filteredTopics.map((topic, index) => (
                                            <TableRow key={topic.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium text-gray-900">{topic.vietnameseName}</div>
                                                        <div className="text-sm text-gray-500 mt-1">
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                                {topic.topicCode || "Chưa có mã"}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center space-x-2">
                                                        <Avatar className="h-8 w-8">
                                                            <AvatarFallback>{getInitialsAvt(topic.principalInvestigator || "User")}</AvatarFallback>
                                                        </Avatar>
                                                        <div>
                                                            <div className="font-medium text-sm">{topic.principalInvestigator || "Chưa có"}</div>
                                                            <div className="text-xs text-gray-500">{topic.email || "Không có email"}</div>
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>{getCategoryStatusBadge(topic.status)}</TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                                <MoreHorizontal className="h-4 w-4" />
                                                                <span className="sr-only">Mở menu</span>
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end">
                                                            <DropdownMenuItem onClick={() => openViewDialog(topic)}>
                                                                <Eye className="h-4 w-4 mr-2" />
                                                                Xem chi tiết
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem onClick={() => openEvaluateDialog(topic)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Xác định danh mục
                                                            </DropdownMenuItem>
                                                            <DropdownMenuSeparator />
                                                            <DropdownMenuItem
                                                                onClick={() => navigate(`/admin/topics/${topic.id}`)}
                                                                className="text-blue-600"
                                                            >
                                                                <FileText className="h-4 w-4 mr-2" />
                                                                Xem đề tài
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                        {filteredTopics.length > 0 && (
                            <CardFooter className="flex justify-between items-center py-4 border-t border-gray-200">
                                <div className="text-sm text-gray-500">
                                    Hiển thị {filteredTopics.length} / {topics.length} đề tài
                                </div>
                                <div className="flex items-center space-x-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => setIsConfirmPublishOpen(true)}
                                        disabled={topics.some((topic) => !topic.status) || topics.length === 0}
                                        className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Gửi danh mục
                                    </Button>
                                </div>
                            </CardFooter>
                        )}
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Evaluate Dialog */}
            <Dialog open={isEvaluateDialogOpen} onOpenChange={setIsEvaluateDialogOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle>Xác định danh mục đề tài</DialogTitle>
                        <DialogDescription>
                            {selectedTopic?.vietnameseName}
                            <span className="block mt-1 text-xs font-medium text-blue-600">{selectedTopic?.topicCode}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Trạng thái danh mục</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Chọn trạng thái" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value={TopicStatus.APPROVED} className="text-green-600">
                                                    <div className="flex items-center">
                                                        <CheckCircle className="h-4 w-4 mr-2" />
                                                        Đạt
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TopicStatus.REJECTED} className="text-red-600">
                                                    <div className="flex items-center">
                                                        <XCircle className="h-4 w-4 mr-2" />
                                                        Không đạt
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value={TopicStatus.NEED_REVISION} className="text-yellow-600">
                                                    <div className="flex items-center">
                                                        <Edit className="h-4 w-4 mr-2" />
                                                        Cần chỉnh sửa
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Ghi chú</FormLabel>
                                        <FormControl>
                                            <Textarea
                                                placeholder="Nhập ghi chú hoặc lý do (bắt buộc nếu chọn 'Cần chỉnh sửa')..."
                                                className="min-h-[100px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormDescription>Ghi chú sẽ được hiển thị cho người đăng ký đề tài.</FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setIsEvaluateDialogOpen(false)}>
                                    Hủy
                                </Button>
                                <Button type="submit">Xác nhận</Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* View Dialog */}
            <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
                <DialogContent className="sm:max-w-[600px]">
                    <DialogHeader>
                        <DialogTitle>Chi tiết đề tài</DialogTitle>
                        <DialogDescription>
                            {selectedTopic?.vietnameseName}
                            <span className="block mt-1 text-xs font-medium text-blue-600">{selectedTopic?.topicCode}</span>
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Tên tiếng Việt</h3>
                                <p className="text-gray-900">{selectedTopic?.vietnameseName}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Tên tiếng Anh</h3>
                                <p className="text-gray-900">{selectedTopic?.englishName}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Mã đề tài</h3>
                                <p className="text-gray-900">{selectedTopic?.topicCode || "Chưa có mã"}</p>
                            </div>
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Chủ nhiệm đề tài</h3>
                                <p className="text-gray-900">{selectedTopic?.principalInvestigator || "Chưa có"}</p>
                            </div>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Mô tả</h3>
                            <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">
                                {selectedTopic?.description || "Không có mô tả"}
                            </p>
                        </div>

                        <div>
                            <h3 className="text-sm font-medium text-gray-500 mb-1">Trạng thái danh mục</h3>
                            <div className="flex items-center space-x-2">
                                {getCategoryStatusBadge(selectedTopic?.status)}
                                {selectedTopic?.status && (
                                    <span className="text-sm text-gray-500">
                                        {selectedTopic.status === TopicStatus.APPROVED
                                            ? "Đề tài đạt yêu cầu"
                                            : selectedTopic.status === TopicStatus.REJECTED
                                                ? "Đề tài không đạt yêu cầu"
                                                : "Đề tài cần chỉnh sửa"}
                                    </span>
                                )}
                            </div>
                        </div>

                        {selectedTopic?.notes && (
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Ghi chú</h3>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">{selectedTopic.notes}</p>
                            </div>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                            Đóng
                        </Button>
                        <Button
                            onClick={() => {
                                setIsViewDialogOpen(false)
                                openEvaluateDialog(selectedTopic!)
                            }}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Xác định danh mục
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Confirm Publish Dialog */}
            <Dialog open={isConfirmPublishOpen} onOpenChange={setIsConfirmPublishOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận gửi danh mục</DialogTitle>
                        <DialogDescription>Bạn có chắc chắn muốn gửi danh mục đề tài đến các đơn vị và CNĐT?</DialogDescription>
                    </DialogHeader>
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-2">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-yellow-600 mr-2 flex-shrink-0" />
                            <div className="text-sm text-yellow-700">
                                Sau khi gửi, danh mục đề tài sẽ được công bố và không thể chỉnh sửa.
                            </div>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Tổng số đề tài:</span>
                            <span className="font-medium">{topics.length}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Đạt:</span>
                            <span className="font-medium text-green-600">{tabCounts.approved}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Không đạt:</span>
                            <span className="font-medium text-red-600">{tabCounts.rejected}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-500">Cần chỉnh sửa:</span>
                            <span className="font-medium text-yellow-600">{tabCounts.needRevision}</span>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsConfirmPublishOpen(false)}>
                            Hủy
                        </Button>
                        <Button onClick={handlePublishCategories} className="bg-green-600 hover:bg-green-700 text-white">
                            <Send className="h-4 w-4 mr-2" />
                            Xác nhận gửi
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
