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
    Download,
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
    }, [searchQuery, topics])

    const filterTopics = () => {
        let filtered = [...topics]

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
        // Check if topic is already IN_CATALOG
        if (topic.status === TopicStatus.IN_CATALOG) {
            toast({
                title: "Không thể đánh giá",
                description: "Đề tài đã có trong danh mục, không thể đánh giá lại.",
                variant: "error",
            })
            return
        }

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

    const handleClassification = (topic: Topic) => {
        // Check if topic is already IN_CATALOG
        if (topic.status === TopicStatus.IN_CATALOG) {
            toast({
                title: "Không thể phân loại",
                description: "Đề tài đã có trong danh mục, không thể phân loại lại.",
                variant: "error",
            })
            return
        }
        navigate(`/admin/topics/${topic.id}/classification`)
    }

    const handleDownloadResult = (topic: Topic) => {
        // Find review result document
        const reviewDocument = topic.documents?.find(doc => doc.documentType === "Biên bản đánh giá")
        if (reviewDocument) {
            // Open download link
            window.open(reviewDocument.filePath, '_blank')
        } else {
            toast({
                title: "Không tìm thấy file",
                description: "Chưa có file kết quả đánh giá cho đề tài này.",
                variant: "error",
            })
        }
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
            case TopicStatus.IN_CATALOG:
                return <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200">Trong danh mục</Badge>
            default:
                return (
                    <Badge variant="outline" className="bg-gray-100 text-gray-800">
                        Chưa xác định
                    </Badge>
                )
        }
    }

    if (isLoading) {
        return <Loading />
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50/50 via-white to-purple-50/30">
            <div className="space-y-6">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            Xác định danh mục đề tài
                        </h1>
                        <p className="text-muted-foreground mt-1">
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
                            className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white shadow-lg"
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
                            className="pl-10 border-gray-200 focus:border-blue-300 focus:ring-blue-200"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                {/* Topics List */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-white to-blue-50/50 border-b border-gray-200">
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
                                            className="flex items-center gap-1 hover:bg-blue-50"
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
                            <div className="flex flex-col items-center justify-center py-16">
                                <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                                    <FileText className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold mb-3 text-gray-900">Không tìm thấy đề tài</h3>
                                <p className="text-muted-foreground max-w-md text-center mb-6">
                                    {searchQuery
                                        ? "Không tìm thấy đề tài phù hợp với từ khóa tìm kiếm."
                                        : "Không có đề tài nào cần xác định danh mục."}
                                </p>
                                {searchQuery && (
                                    <Button variant="outline" onClick={() => setSearchQuery("")} className="gap-2">
                                        <ArrowLeft className="h-4 w-4" />
                                        Xóa bộ lọc
                                    </Button>
                                )}
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-gradient-to-r from-gray-50 to-blue-50/30">
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
                                        <TableRow key={topic.id} className="hover:bg-blue-50/30 transition-colors">
                                            <TableCell className="font-medium">{index + 1}</TableCell>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium text-gray-900 line-clamp-2">{topic.vietnameseName}</div>
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
                                                        <AvatarFallback className="bg-blue-100 text-blue-600">
                                                            {getInitialsAvt(topic.principalInvestigator || "User")}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium text-sm">{topic.principalInvestigator || "Chưa có"}</div>
                                                        <div className="text-xs text-gray-500">{topic.department?.name || "Không có phòng ban"}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>{getCategoryStatusBadge(topic.status)}</TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-blue-50">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                            <span className="sr-only">Mở menu</span>
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48">
                                                        <DropdownMenuItem onClick={() => openViewDialog(topic)}>
                                                            <Eye className="h-4 w-4 mr-2" />
                                                            Xem chi tiết
                                                        </DropdownMenuItem>
                                                        {topic.status !== TopicStatus.IN_CATALOG && (
                                                            <DropdownMenuItem onClick={() => handleClassification(topic)}>
                                                                <Edit className="h-4 w-4 mr-2" />
                                                                Phân loại đề tài
                                                            </DropdownMenuItem>
                                                        )}
                                                        {topic.status === TopicStatus.IN_CATALOG && (
                                                            <DropdownMenuItem onClick={() => handleDownloadResult(topic)} className="text-green-600">
                                                                <Download className="h-4 w-4 mr-2" />
                                                                Tải file kết quả
                                                            </DropdownMenuItem>
                                                        )}
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
                        <CardFooter className="flex justify-between items-center py-4 border-t border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50/30">
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
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Mục tiêu</h3>
                                <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">
                                    {selectedTopic?.objectives || "Không có mô tả"}
                                </p>
                            </div>

                            <div>
                                <h3 className="text-sm font-medium text-gray-500 mb-1">Trạng thái danh mục</h3>
                                <div className="flex items-center space-x-2">
                                    {getCategoryStatusBadge(selectedTopic?.status)}
                                </div>
                            </div>

                            {selectedTopic?.additionalNotes && (
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 mb-1">Ghi chú</h3>
                                    <p className="text-gray-900 bg-gray-50 p-3 rounded border text-sm">{selectedTopic.additionalNotes}</p>
                                </div>
                            )}
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                                Đóng
                            </Button>
                            {selectedTopic?.status !== TopicStatus.IN_CATALOG && (
                                <Button
                                    onClick={() => {
                                        setIsViewDialogOpen(false)
                                        handleClassification(selectedTopic!)
                                    }}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Phân loại đề tài
                                </Button>
                            )}
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
        </div>
    )
}