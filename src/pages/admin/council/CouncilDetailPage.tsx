import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import {
    ArrowLeft,
    Calendar,
    Download,
    Edit,
    FileText,
    Info,
    MoreHorizontal,
    Trash2,
    Users,
    Plus,
    Clock,
    CheckCircle,
    AlertCircle,
    ChevronLeft,
    ChevronRight,
    ExternalLink,
    Clipboard,
    Share2,
    User,
    BarChart,
    Search,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
    type Council,
    getCouncilTypeText,
    getCouncilTypeBadgeClass,
    getCouncilStatus,
    getStatusVariant,
    getMemberRoleText,
    getMemberRoleBadgeClass,
} from "@/models/council"
import { CouncilService } from "@/service/council-service"
import { TopicApplicationService } from "@/service/topic-application-service"
import { formatDateString } from "@/utils/dateTimeFormat"
import { getInitialsAvt } from "@/utils/common"
import { ApplicationStatus, type TopicApplication } from "@/models/topic-application"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import TopicSummaryModal from "@/pages/admin/council/TopicSummaryModal"

export default function CouncilDetailPage() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [council, setCouncil] = useState<Council | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [activeTab, setActiveTab] = useState("overview")
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
    const [topicApplications, setTopicApplications] = useState<Record<number, TopicApplication[]>>({})
    const [loadingApplications, setLoadingApplications] = useState<Record<number, boolean>>({})
    const [selectedTopic, setSelectedTopic] = useState<any>(null)
    const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)

    // Lấy thông tin chi tiết hội đồng
    useEffect(() => {
        const fetchCouncilDetail = async () => {
            if (!id) return

            setIsLoading(true)
            try {
                const response = await CouncilService.getById(Number(id))
                setCouncil(response.data.data)
            } catch (error) {
                console.error("Lỗi khi lấy thông tin hội đồng:", error)
                toast({
                    title: "Lỗi",
                    description: "Không thể tải thông tin hội đồng. Vui lòng thử lại.",
                    variant: "error",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchCouncilDetail()
    }, [id])

    // Xử lý xóa hội đồng
    const handleDeleteCouncil = async () => {
        if (!council) return

        try {
            // await CouncilService.delete(council.id)
            toast({
                title: "Thành công",
                description: "Đã xóa hội đồng thành công",
            })
            navigate("/admin/councils")
        } catch (error) {
            console.error("Lỗi khi xóa hội đồng:", error)
            toast({
                title: "Lỗi",
                description: "Không thể xóa hội đồng. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setIsDeleteDialogOpen(false)
        }
    }

    // Hàm lấy chữ cái đầu của tên
    const getInitials = (name: string) => {
        if (!name) return "U"
        return name
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .substring(0, 2)
    }

    // Hàm copy link
    const copyToClipboard = () => {
        navigator.clipboard.writeText(window.location.href)
        toast({
            title: "Đã sao chép",
            description: "Đường dẫn đã được sao chép vào clipboard",
        })
    }

    // Hàm lấy danh sách ứng viên của đề tài
    const fetchTopicApplications = async (topicId: string) => {
        if (topicApplications[topicId]) return // Đã có dữ liệu rồi

        setLoadingApplications((prev) => ({ ...prev, [topicId]: true }))
        try {
            const response = await TopicApplicationService.getApplicationsByTopic(topicId)
            setTopicApplications((prev) => ({
                ...prev,
                [topicId]: response.data.data || [],
            }))
        } catch (error) {
            console.error("Lỗi khi lấy danh sách ứng viên:", error)
            toast({
                title: "Lỗi",
                description: "Không thể tải danh sách ứng viên. Vui lòng thử lại.",
                variant: "error",
            })
        } finally {
            setLoadingApplications((prev) => ({ ...prev, [topicId]: false }))
        }
    }

    // Hàm hiển thị trạng thái ứng viên
    const getApplicationStatusBadge = (status: ApplicationStatus) => {
        switch (status) {
            case ApplicationStatus.APPROVED:
                return <Badge className="bg-green-100 text-green-800 border-green-200">Đã duyệt</Badge>
            case ApplicationStatus.REJECTED:
                return <Badge className="bg-red-100 text-red-800 border-red-200">Từ chối</Badge>
            case ApplicationStatus.IN_PROGRESS:
                return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Đang xét duyệt</Badge>
            case ApplicationStatus.PENDING:
            default:
                return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Chờ đánh giá</Badge>
        }
    }

    // Hàm mở modal tổng kết đề tài
    const handleOpenSummaryModal = (topic: any) => {
        setSelectedTopic(topic)
        setIsSummaryModalOpen(true)
    }

    if (isLoading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex items-center mb-6">
                    <Button
                        variant="ghost"
                        className="text-gray-600 hover:text-gray-900 p-2 rounded-full"
                        onClick={() => navigate("/admin/councils")}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="h-8 w-64 bg-slate-200 rounded animate-pulse"></div>
                </div>

                <div className="space-y-6">
                    <div className="h-40 w-full bg-slate-200 rounded-xl animate-pulse"></div>

                    <div className="h-10 w-64 bg-slate-200 rounded animate-pulse"></div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
                        <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
                        <div className="h-64 bg-slate-200 rounded-xl animate-pulse"></div>
                    </div>
                </div>
            </div>
        )
    }

    if (!council) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="flex flex-col items-center justify-center h-[60vh]">
                    <div className="bg-gray-50 p-8 rounded-2xl border border-gray-200 shadow-sm text-center max-w-md">
                        <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Không tìm thấy hội đồng</h2>
                        <p className="text-gray-500 mb-6">Hội đồng bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
                        <Button onClick={() => navigate("/admin/councils")} className="mx-auto">
                            <ChevronLeft className="h-4 w-4" />
                            Quay lại danh sách
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    const status = getCouncilStatus(council)

    return (
        <div className="space-y-6">
            {/* Breadcrumb & Navigation */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-2">
                <div className="flex items-center">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-gray-500 hover:text-gray-900"
                        onClick={() => navigate("/admin/councils")}
                    >
                        <ChevronLeft className="h-5 w-5" />
                        <span className="sr-only">Quay lại</span>
                    </Button>
                    <div className="flex items-center text-sm text-gray-500">
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/")}>
                            Trang chủ
                        </span>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="hover:text-gray-900 cursor-pointer" onClick={() => navigate("/admin/councils")}>
                            Hội đồng
                        </span>
                        <ChevronRight className="h-4 w-4 mx-2" />
                        <span className="font-medium text-gray-900 truncate max-w-[200px]">{council.name}</span>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <Button variant="outline" size="sm" className="h-9" onClick={copyToClipboard}>
                        <Clipboard className="h-4 w-4 mr-1.5" />
                        Sao chép link
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        className="h-9"
                        onClick={() => navigate(`/admin/councils/edit/${council.id}`)}
                    >
                        <Edit className="h-4 w-4 mr-1.5" />
                        Chỉnh sửa
                    </Button>
                </div>
            </div>

            {/* Header Card */}
            <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                <div className="relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-50 to-slate-100 opacity-50"></div>
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>

                    <CardHeader className="relative z-10 pb-4 pt-6 px-6">
                        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Badge variant={getStatusVariant(status)} className="px-2.5 py-0.5 text-xs font-medium rounded-full">
                                        {status}
                                    </Badge>
                                    <Badge
                                        variant="outline"
                                        className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getCouncilTypeBadgeClass(council.type)}`}
                                    >
                                        {getCouncilTypeText(council.type)}
                                    </Badge>
                                </div>
                                <CardTitle className="text-2xl font-bold text-gray-900 mb-1">{council.name}</CardTitle>
                                <CardDescription className="text-gray-500 flex items-center">
                                    <FileText className="h-3.5 w-3.5 mr-1.5 text-gray-400" />
                                    Quyết định số: <span className="font-medium ml-1 text-gray-700">{council.decisionNumber}</span>
                                </CardDescription>
                            </div>
                            <div className="flex space-x-2 md:self-start">
                                <Button
                                    variant="outline"
                                    className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                                    onClick={() => window.open("#", "_blank")}
                                >
                                    <Download className="h-4 w-4" />
                                    Tải quyết định
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button
                                            variant="outline"
                                            className="bg-white/80 border-gray-200 text-gray-700 hover:bg-gray-50 shadow-sm"
                                        >
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => navigate(`/admin/councils/edit/${council.id}`)}>
                                            <Edit className="h-4 w-4 mr-2" />
                                            Chỉnh sửa
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => window.open("#", "_blank")}>
                                            <ExternalLink className="h-4 w-4 mr-2" />
                                            Xem quyết định
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={copyToClipboard}>
                                            <Share2 className="h-4 w-4 mr-2" />
                                            Chia sẻ
                                        </DropdownMenuItem>
                                        <DropdownMenuSeparator />
                                        <DropdownMenuItem className="text-red-600" onClick={() => setIsDeleteDialogOpen(true)}>
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Xóa
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className="px-6 pb-6 pt-0 relative z-10">
                        <div className="flex flex-wrap gap-6 mt-2">
                            <div className="flex items-center text-sm">
                                <Calendar className="h-4 w-4 mr-1.5 text-gray-500" />
                                <span className="text-gray-500">Thành lập:</span>
                                <span className="font-medium text-gray-900 ml-1.5">{formatDateString(council.establishmentDate)}</span>
                            </div>
                            <div className="flex items-center text-sm">
                                <Clock className="h-4 w-4 mr-1.5 text-gray-500" />
                                <span className="text-gray-500">Hoạt động:</span>
                                <span className="font-medium text-gray-900 ml-1.5">
                                    {formatDateString(council.startDate)} - {formatDateString(council.endDate)}
                                </span>
                            </div>
                            {council.councilMembers && (
                                <div className="flex items-center text-sm">
                                    <Users className="h-4 w-4 mr-1.5 text-gray-500" />
                                    <span className="text-gray-500">Thành viên:</span>
                                    <span className="font-medium text-gray-900 ml-1.5">{council.councilMembers.length} người</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </div>
            </Card>

            {/* Tabs */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <div className="border-b border-gray-200 mb-6">
                    <div className="flex items-center justify-between">
                        <TabsList className="h-12 bg-transparent p-0 w-auto">
                            <TabsTrigger
                                value="overview"
                                className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:bg-transparent"
                            >
                                <Info className="h-4 w-4 mr-2" />
                                Tổng quan
                            </TabsTrigger>
                            <TabsTrigger
                                value="members"
                                className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:bg-transparent"
                            >
                                <Users className="h-4 w-4 mr-2" />
                                Thành viên
                            </TabsTrigger>
                            <TabsTrigger
                                value="topics"
                                className="h-12 px-4 data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none bg-transparent data-[state=active]:bg-transparent"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Đề tài
                            </TabsTrigger>
                        </TabsList>
                    </div>
                </div>

                {/* Overview Tab */}
                <TabsContent value="overview" className="space-y-6 mt-0">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Thông tin thời gian */}
                        <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-blue-50 to-blue-100 pb-4 pt-5">
                                <h3 className="text-base font-semibold text-gray-800 flex items-center">
                                    <Calendar className="h-5 w-5 text-blue-600 mr-2" />
                                    Thời gian
                                </h3>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="space-y-4">
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">Ngày thành lập</p>
                                        <p className="text-base font-medium mt-1 text-gray-800">
                                            {formatDateString(council.establishmentDate)}
                                        </p>
                                    </div>
                                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                        <p className="text-xs text-blue-600 uppercase tracking-wider font-medium">Thời gian hoạt động</p>
                                        <p className="text-base font-medium mt-1 text-gray-800">
                                            {formatDateString(council.startDate)} - {formatDateString(council.endDate)}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Thông tin thành viên */}
                        <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-4 pt-5">
                                <h3 className="text-base font-semibold text-gray-800 flex items-center">
                                    <Users className="h-5 w-5 mr-2 text-purple-600" />
                                    Thành viên
                                </h3>
                            </CardHeader>
                            <CardContent className="p-5">
                                {council.councilMembers ? (
                                    <div className="space-y-4">
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                                            <p className="text-xs text-purple-600 uppercase tracking-wider font-medium">Tổng số thành viên</p>
                                            <p className="text-base font-medium mt-1 text-gray-800">
                                                {council.councilMembers.length} thành viên
                                            </p>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {council.councilMembers.slice(0, 5).map((member) => (
                                                <Avatar key={member.id} className="h-8 w-8 border border-white shadow-sm">
                                                    <AvatarImage src={member.user?.imageUrl || "/avatar-default.jpg"} alt={member.user?.name} />
                                                    <AvatarFallback>{getInitialsAvt(member.user?.name || "")}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {council.councilMembers.length > 5 && (
                                                <div className="h-8 w-8 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-xs font-medium text-gray-600 shadow-sm">
                                                    +{council.councilMembers.length - 5}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <Users className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                        <p className="text-gray-500">Chưa có thành viên</p>
                                    </div>
                                )}
                            </CardContent>
                            <CardFooter className="bg-purple-50/50 px-5 py-3 border-t border-purple-100">
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="w-full text-purple-700 hover:text-purple-900 hover:bg-purple-100"
                                    onClick={() => setActiveTab("members")}
                                >
                                    Xem tất cả thành viên
                                    <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </CardFooter>
                        </Card>

                        {/* Trạng thái */}
                        <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                            <CardHeader
                                className={`pb-4 pt-5 ${status === "Đang hoạt động"
                                    ? "bg-gradient-to-r from-green-50 to-green-100"
                                    : status === "Sắp diễn ra"
                                        ? "bg-gradient-to-r from-blue-50 to-blue-100"
                                        : "bg-gradient-to-r from-gray-50 to-gray-100"
                                    }`}
                            >
                                <h3 className="text-base font-semibold text-gray-800 flex items-center">
                                    <Info
                                        className={`h-5 w-5 mr-2 ${status === "Đang hoạt động"
                                            ? "text-green-600"
                                            : status === "Sắp diễn ra"
                                                ? "text-blue-600"
                                                : "text-gray-600"
                                            }`}
                                    />
                                    Trạng thái
                                </h3>
                            </CardHeader>
                            <CardContent className="p-5">
                                <div className="flex flex-col items-center text-center">
                                    <div
                                        className={`
                                            w-20 h-20 rounded-full flex items-center justify-center mb-4
                                            ${status === "Đang hoạt động"
                                                ? "bg-green-100"
                                                : status === "Sắp diễn ra"
                                                    ? "bg-blue-100"
                                                    : "bg-gray-100"
                                            }
                                        `}
                                    >
                                        {status === "Đang hoạt động" ? (
                                            <CheckCircle className="h-10 w-10 text-green-600" />
                                        ) : status === "Sắp diễn ra" ? (
                                            <Clock className="h-10 w-10 text-blue-600" />
                                        ) : (
                                            <AlertCircle className="h-10 w-10 text-gray-600" />
                                        )}
                                    </div>
                                    <p
                                        className={`text-lg font-semibold ${status === "Đang hoạt động"
                                            ? "text-green-700"
                                            : status === "Sắp diễn ra"
                                                ? "text-blue-700"
                                                : "text-gray-700"
                                            }`}
                                    >
                                        {status}
                                    </p>

                                    <p className="text-sm text-gray-500 mt-2">
                                        {status === "Đang hoạt động"
                                            ? "Hội đồng đang trong thời gian hoạt động"
                                            : status === "Sắp diễn ra"
                                                ? "Hội đồng sẽ bắt đầu hoạt động trong thời gian tới"
                                                : "Hội đồng đã kết thúc thời gian hoạt động"}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Ghi chú */}
                    <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-gray-50 to-gray-100 pb-4 pt-5 border-b">
                            <h3 className="text-base font-semibold text-gray-800 flex items-center">
                                <Info className="h-5 w-5 mr-2 text-gray-600 mr-2" />
                                Ghi chú
                            </h3>
                        </CardHeader>
                        <CardContent className="p-6">
                            <div className="bg-white rounded-lg">
                                <div className="prose prose-sm max-w-none prose-headings:font-semibold prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600">
                                    {council.notes ? (
                                        <p>{council.notes}</p>
                                    ) : (
                                        <div className="flex items-center justify-center py-8 text-gray-500 italic">
                                            <Info className="h-5 w-5 mr-2 text-gray-400" />
                                            Không có ghi chú
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Members Tab */}
                <TabsContent value="members" className="space-y-6 mt-0">
                    <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-purple-50 to-purple-100 pb-4 pt-5 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 flex items-center">
                                        <Users className="h-5 w-5 mr-2 text-purple-600" />
                                        Danh sách thành viên
                                    </h3>
                                    {council.councilMembers && (
                                        <p className="text-sm text-gray-500 mt-1">Tổng cộng {council.councilMembers.length} thành viên</p>
                                    )}
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white"
                                    onClick={() => navigate(`/admin/councils/edit/${council.id}`)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa thành viên
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {council.councilMembers && council.councilMembers.length > 0 ? (
                                <div className="divide-y">
                                    {council.councilMembers.map((member) => (
                                        <div
                                            key={member.id}
                                            className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center space-x-4">
                                                <Avatar className="h-10 w-10 border border-gray-200">
                                                    <AvatarImage src={member.user?.imageUrl || "/avatar-default.jpg"} alt={member.user?.name} />
                                                    <AvatarFallback>{getInitialsAvt(member.user.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-medium text-gray-900">{member.user?.name}</div>
                                                    <div className="text-sm text-gray-500">{member.user?.email}</div>
                                                </div>
                                            </div>
                                            <Badge variant="outline" className={`${getMemberRoleBadgeClass(member.role)} px-2.5 py-0.5`}>
                                                {getMemberRoleText(member.role)}
                                            </Badge>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <Users className="h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có thành viên nào</h3>
                                    <p className="text-gray-500 max-w-md text-center mb-4">
                                        Hội đồng này chưa có thành viên nào. Bạn có thể thêm thành viên bằng cách chỉnh sửa hội đồng.
                                    </p>
                                    <Button variant="outline" onClick={() => navigate(`/admin/councils/edit/${council.id}`)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm thành viên
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* Topics Tab */}
                <TabsContent value="topics" className="space-y-6 mt-0">
                    <Card className="border border-gray-200 rounded-xl overflow-hidden shadow-sm">
                        <CardHeader className="bg-gradient-to-r from-amber-50 to-amber-100 pb-4 pt-5 border-b">
                            <div className="flex justify-between items-center">
                                <div>
                                    <h3 className="text-base font-semibold text-gray-800 flex items-center">
                                        <FileText className="h-5 w-5 mr-2 text-amber-600" />
                                        Danh sách đề tài
                                    </h3>
                                    <p className="text-sm text-gray-500 mt-1">Các đề tài được gán cho hội đồng này</p>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="bg-white"
                                    onClick={() => navigate(`/admin/councils/edit/${council.id}`)}
                                >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Chỉnh sửa đề tài
                                </Button>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            {council.topicCouncils && council.topicCouncils.length > 0 ? (
                                <Accordion type="single" collapsible className="w-full">
                                    {council.topicCouncils.map((topicCouncil) => (
                                        <AccordionItem key={topicCouncil.id} value={`topic-${topicCouncil.id}`}>
                                            <AccordionTrigger className="px-6 py-4 hover:bg-gray-50 transition-colors">
                                                <div className="flex flex-col items-start text-left">
                                                    <div className="font-medium text-gray-900">{topicCouncil.topic?.vietnameseName}</div>
                                                    <div className="text-sm text-gray-500">Mã đề tài: {topicCouncil.topic?.topicCode}</div>
                                                </div>
                                            </AccordionTrigger>
                                            <AccordionContent className="px-6 pb-4">
                                                <div className="space-y-4">
                                                    <div className="flex justify-between items-center">
                                                        <h4 className="text-sm font-medium text-gray-700">Danh sách ứng viên</h4>
                                                        <Button
                                                            variant="outline"
                                                            size="sm"
                                                            onClick={() => handleOpenSummaryModal(topicCouncil.topic)}
                                                            className="bg-white text-amber-600 border-amber-200 hover:bg-amber-50"
                                                        >
                                                            <BarChart className="h-4 w-4" />
                                                            Tổng kết
                                                        </Button>
                                                    </div>

                                                    <div className="border rounded-md overflow-hidden">
                                                        {loadingApplications[topicCouncil.topic?.id] ? (
                                                            <div className="p-4 text-center">
                                                                <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
                                                                <p className="mt-2 text-sm text-gray-500">Đang tải danh sách ứng viên...</p>
                                                            </div>
                                                        ) : topicApplications[topicCouncil.topic?.id] ? (
                                                            topicApplications[topicCouncil.topic?.id].length > 0 ? (
                                                                <Table>
                                                                    <TableHeader>
                                                                        <TableRow>
                                                                            <TableHead className="w-[50px]">#</TableHead>
                                                                            <TableHead>Ứng viên</TableHead>
                                                                            <TableHead className="w-[300px]">Trạng thái</TableHead>
                                                                            <TableHead className="w-[150px]">Điểm</TableHead>
                                                                        </TableRow>
                                                                    </TableHeader>
                                                                    <TableBody>
                                                                        {topicApplications[topicCouncil.topic?.id].map((application, index) => (
                                                                            <TableRow key={application.id}>
                                                                                <TableCell className="font-medium">{index + 1}</TableCell>
                                                                                <TableCell>
                                                                                    <div className="flex items-center space-x-2">
                                                                                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                                                                                            <User className="h-4 w-4 text-muted-foreground" />
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="font-medium">{application.user.name}</div>
                                                                                            <div className="text-xs text-muted-foreground">
                                                                                                {application.user.email}
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                </TableCell>
                                                                                <TableCell>{getApplicationStatusBadge(application.status)}</TableCell>
                                                                                <TableCell>
                                                                                    {application.totalScore !== null ? (
                                                                                        <span
                                                                                            className={
                                                                                                application.passed
                                                                                                    ? "text-green-600 font-medium"
                                                                                                    : "text-red-600 font-medium"
                                                                                            }
                                                                                        >
                                                                                            {application.totalScore}/100
                                                                                        </span>
                                                                                    ) : (
                                                                                        <span className="text-muted-foreground">Chưa đánh giá</span>
                                                                                    )}
                                                                                </TableCell>
                                                                            </TableRow>
                                                                        ))}
                                                                    </TableBody>
                                                                </Table>
                                                            ) : (
                                                                <div className="p-6 text-center">
                                                                    <Search className="h-10 w-10 mx-auto text-gray-300 mb-2" />
                                                                    <p className="text-gray-500">Không có ứng viên nào đăng ký đề tài này</p>
                                                                </div>
                                                            )
                                                        ) : (
                                                            <div className="p-4 text-center">
                                                                <Button
                                                                    variant="outline"
                                                                    onClick={() => fetchTopicApplications(topicCouncil.topic?.id)}
                                                                >
                                                                    <Users className="h-4 w-4 mr-2" />
                                                                    Xem danh sách ứng viên
                                                                </Button>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </AccordionContent>
                                        </AccordionItem>
                                    ))}
                                </Accordion>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-12 px-4">
                                    <FileText className="h-12 w-12 text-gray-300 mb-4" />
                                    <h3 className="text-lg font-medium text-gray-800 mb-2">Chưa có đề tài nào</h3>
                                    <p className="text-gray-500 max-w-md text-center mb-4">
                                        Hội đồng này chưa có đề tài nào. Bạn có thể thêm đề tài bằng cách chỉnh sửa hội đồng.
                                    </p>
                                    <Button variant="outline" onClick={() => navigate(`/admin/councils/edit/${council.id}`)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Thêm đề tài
                                    </Button>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>

            {/* Delete Confirmation Dialog */}
            <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Xác nhận xóa</DialogTitle>
                        <DialogDescription>
                            Bạn có chắc chắn muốn xóa hội đồng này? Hành động này không thể hoàn tác.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-4 my-4">
                        <div className="flex">
                            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mr-2" />
                            <div className="text-sm text-red-600">
                                Việc xóa hội đồng sẽ xóa tất cả thông tin liên quan, bao gồm thành viên và các đề tài được gán.
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                            Hủy
                        </Button>
                        <Button variant="destructive" onClick={handleDeleteCouncil}>
                            Xóa
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Topic Summary Modal */}
            <Dialog open={isSummaryModalOpen} onOpenChange={setIsSummaryModalOpen}>
                <DialogContent className="max-w-6xl min-h-[90vh] overflow-auto p-0">
                    {selectedTopic && (
                        <TopicSummaryModal
                            topic={selectedTopic}
                            applications={topicApplications[selectedTopic.id] || []}
                            onClose={() => setIsSummaryModalOpen(false)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
